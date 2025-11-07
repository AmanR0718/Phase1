from fastapi import (
    APIRouter, Depends, HTTPException, status, BackgroundTasks, File, UploadFile
)
from uuid import uuid4
from datetime import datetime
from fastapi.responses import FileResponse, JSONResponse
import os

from app.database import get_database
from app.dependencies.roles import require_role
from app.models.farmer import FarmerCreate, FarmerOut
from app.services.farmer_service import FarmerService
from app.tasks.id_card_task import generate_id_card
from app.utils.security import verify_qr_signature
from app.config import settings

# ✅ Remove trailing slash in prefix — prevents 405 issues like
#    "GET /api/farmers/ZMXXXXXX/ HTTP 405"
router = APIRouter(prefix="/api/farmers", tags=["Farmers"])

# =======================================================
# Constants
# =======================================================
FRONTEND_ORIGIN = "https://glowing-fishstick-xg76vqgjxxph67ww-5173.app.github.dev"


# =======================================================
# Helper Functions
# =======================================================
def farmer_helper(farmer: dict) -> dict:
    """Convert MongoDB document to JSON-safe dict."""
    if not farmer:
        return None
    farmer["_id"] = str(farmer.get("_id"))
    return farmer



# =======================================================
# Create Farmer (ADMIN or OPERATOR)
# =======================================================
@router.post(
    "/",
    response_model=FarmerOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))],
)
async def create_farmer(farmer: FarmerCreate, db=Depends(get_database)):
    """Register a new farmer."""
    data = farmer.dict()

    # Validate + encrypt
    FarmerService.validate_farmer_data(data)
    data = FarmerService.encrypt_sensitive_fields(data)

    data["farmer_id"] = "ZM" + uuid4().hex[:8].upper()
    data["created_at"] = datetime.utcnow()
    data["registration_status"] = "pending"

    await db.farmers.insert_one(data)
    return FarmerOut(**data)


# =======================================================
# List Farmers (ADMIN, OPERATOR, VIEWER)
# =======================================================
@router.get(
    "/",
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))],
)
async def list_farmers(skip: int = 0, limit: int = 20, db=Depends(get_database)):
    """List all farmers (paginated)."""
    farmers = (
        await db.farmers.find({}, {"_id": 0})
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return {"count": len(farmers), "results": farmers}


# =======================================================
# Get Single Farmer
# =======================================================
@router.get(
    "/{farmer_id}",
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))],
)
async def get_farmer(farmer_id: str, db=Depends(get_database)):
    """Get one farmer by ID."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer_helper(farmer)


# =======================================================
# Update Farmer
# =======================================================
@router.put(
    "/{farmer_id}",
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))],
)
async def update_farmer(farmer_id: str, payload: dict, db=Depends(get_database)):
    """Update farmer details."""
    result = await db.farmers.update_one({"farmer_id": farmer_id}, {"$set": payload})
    if result.modified_count == 0:
        raise HTTPException(
            status_code=404, detail="Farmer not found or no changes made"
        )
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    return farmer_helper(farmer)


# =======================================================
# Delete Farmer
# =======================================================
@router.delete(
    "/{farmer_id}",
    dependencies=[Depends(require_role(["ADMIN"]))],
)
async def delete_farmer(farmer_id: str, db=Depends(get_database)):
    """Delete a farmer (Admin only)."""
    result = await db.farmers.delete_one({"farmer_id": farmer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return {"message": f"Farmer {farmer_id} deleted successfully"}


# =======================================================
# Upload Photo
# =======================================================
@router.post(
    "/{farmer_id}/upload-photo",
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))],
)
async def upload_farmer_photo(
    farmer_id: str, file: UploadFile = File(...), db=Depends(get_database)
):
    """Upload farmer photo."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # ✅ Ensure proper path construction (no /app leak)
    folder = os.path.join(settings.UPLOAD_DIR, "photos", farmer_id)
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, f"{farmer_id}_photo.jpg")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    db_path = file_path.replace("/app", "").replace("\\", "/")

    await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {"$set": {"photo_path": db_path}},
    )

    return {"message": "Photo uploaded", "photo_path": db_path}


# =======================================================
# Generate ID Card (async Celery)
# =======================================================
@router.post(
    "/{farmer_id}/generate-idcard",
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))],
)
async def generate_farmer_idcard(
    farmer_id: str, background_tasks: BackgroundTasks, db=Depends(get_database)
):
    """Trigger async ID card generation."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    background_tasks.add_task(generate_id_card, farmer)
    return {"message": "ID card generation started", "farmer_id": farmer_id}


# =======================================================
# Download ID Card
# =======================================================
@router.get(
    "/{farmer_id}/download-idcard",
    dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))],
)
async def download_idcard(farmer_id: str, db=Depends(get_database)):
    """Download generated ID card PDF."""
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer or not farmer.get("id_card_path"):
        raise HTTPException(status_code=404, detail="ID card not found")

    file_path = farmer["id_card_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path),
    )


# =======================================================
# Verify QR Code
# =======================================================
@router.post("/verify-qr")
async def verify_qr(payload: dict, db=Depends(get_database)):
    """Verify QR code signature."""
    if not verify_qr_signature(payload):
        raise HTTPException(status_code=400, detail="Invalid or tampered QR code")

    farmer_id = payload.get("farmer_id")
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return {
        "verified": True,
        "farmer_id": farmer["farmer_id"],
        "name": f"{farmer['personal_info']['first_name']} {farmer['personal_info']['last_name']}",
        "province": farmer["address"]["province"],
        "district": farmer["address"]["district"],
    }


# =======================================================
# Health endpoint
# =======================================================
@router.get("/health", status_code=200)
async def get_farmers_list_for_health():
    """Health check."""
    return {"message": "Farmers endpoint reachable"}
