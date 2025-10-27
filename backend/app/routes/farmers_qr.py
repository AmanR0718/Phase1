from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from app.utils.security import verify_qr_signature
from app.database import get_database
from app.dependencies.roles import require_role
import os

router = APIRouter(prefix="/api/farmers", tags=["Farmers QR & ID"])

# ✅  Verify QR authenticity
@router.post("/verify-qr")
async def verify_qr(payload: dict, db=Depends(get_database)):
    """
    Verify a QR payload signed with server secret.
    Expected payload: {"farmer_id": "...", "timestamp": "...", "signature": "..."}
    """
    farmer_id = payload.get("farmer_id")
    signature = payload.get("signature")

    if not farmer_id or not signature:
        raise HTTPException(status_code=400, detail="Missing fields in payload")

    if not verify_qr_signature(payload):
        raise HTTPException(status_code=400, detail="Invalid or tampered QR signature")

    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Return minimal verified info
    return {
        "verified": True,
        "farmer_id": farmer_id,
        "name": f"{farmer['personal_info']['first_name']} {farmer['personal_info']['last_name']}",
        "province": farmer["address"].get("province"),
        "district": farmer["address"].get("district"),
    }


# ✅  Secure ID card PDF download
@router.get("/{farmer_id}/download-idcard",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def download_idcard(farmer_id: str, db=Depends(get_database)):
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    file_path = farmer.get("id_card_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="ID card not generated yet")

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"{farmer_id}_card.pdf"
    )
