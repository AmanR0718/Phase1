# backend/app/routes/farmers.py
"""
Farmer CRUD routes - HTTP handlers only.
Business logic is in services/farmer_service.py
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import get_database
from app.dependencies.roles import require_role
from app.models.farmer import FarmerCreate, FarmerOut
from app.services.farmer_service import FarmerService

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])


@router.post("/", response_model=FarmerOut, status_code=status.HTTP_201_CREATED)
async def create_farmer(
    farmer: FarmerCreate,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR"]))
):
    """Create a new farmer record."""
    return await FarmerService.create(farmer, db)


@router.get("/")
async def list_farmers(
    skip: int = 0,
    limit: int = 20,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))
):
    """List all farmers (paginated)."""
    return await FarmerService.list_all(skip, limit, db)


@router.get("/{farmer_id}")
async def get_farmer(
    farmer_id: str,
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))
):
    """Get one farmer by ID."""
    return await FarmerService.get_by_id(farmer_id, db)


@router.put("/{farmer_id}")
async def update_farmer(
    farmer_id: str,
    updates: dict,  # ← Use dict instead of FarmerUpdate
    db=Depends(get_database),
    _=Depends(require_role(["ADMIN", "OPERATOR"]))
):
    """Update farmer details."""
    result = await db.farmers.update_one(
        {"farmer_id": farmer_id},
        {"$set": updates}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    farmer["_id"] = str(farmer["_id"])
    return farmer


@router.delete("/{farmer_id}")
async def delete_farmer(farmer_id: str, db=Depends(get_database)):
    result = await db.farmers.delete_one({"farmer_id": farmer_id})
    if result.deleted_count == 0:
        raise HTTPException(  # ← Should align with 'if'
            status_code=404,
            detail="Farmer not found"
        )
    return {"message": f"Farmer {farmer_id} deleted"}


@router.get("/health", status_code=200)
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "farmers"}
        