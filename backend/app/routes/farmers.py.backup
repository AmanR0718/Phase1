from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from uuid import uuid4
from datetime import datetime
from app.tasks.id_card_task import generate_id_card

from ..models.farmer import FarmerCreate, FarmerOut
from ..database import get_database
from ..services.farmer_service import FarmerService
from ..dependencies.roles import require_role

router = APIRouter(prefix="/api/farmers", tags=["Farmers"])


# ✅ Create farmer (ADMIN or OPERATOR only)
@router.post("/", response_model=FarmerOut, status_code=201,
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def create_farmer(farmer: FarmerCreate, db=Depends(get_database)):
    data = farmer.dict()

    FarmerService.validate_farmer_data(data)
    data = FarmerService.encrypt_sensitive_fields(data)

    data["farmer_id"] = "ZM" + uuid4().hex[:8].upper()
    data["created_at"] = datetime.utcnow()
    data["registration_status"] = "pending"

    result = await db.farmers.insert_one(data)
    return FarmerOut(**data)


# ✅ Get list of farmers (ADMIN, OPERATOR, VIEWER)
@router.get("/", dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))])
async def list_farmers(skip: int = 0, limit: int = 10, db=Depends(get_database)):
    farmers = await db.farmers.find().skip(skip).limit(limit).to_list(length=limit)
    return {"count": len(farmers), "results": farmers}


# ✅ Get single farmer (any authenticated role)
@router.get("/{farmer_id}", dependencies=[Depends(require_role(["ADMIN", "OPERATOR", "VIEWER"]))])
async def get_farmer(farmer_id: str, db=Depends(get_database)):
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer


# ✅ Update farmer (ADMIN, OPERATOR)
@router.put("/{farmer_id}", dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def update_farmer(farmer_id: str, payload: dict, db=Depends(get_database)):
    result = await db.farmers.update_one({"farmer_id": farmer_id}, {"$set": payload})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return {"message": "Farmer updated successfully"}


# ✅ Delete farmer (ADMIN only)
@router.delete("/{farmer_id}", dependencies=[Depends(require_role(["ADMIN"]))])
async def delete_farmer(farmer_id: str, db=Depends(get_database)):
    result = await db.farmers.delete_one({"farmer_id": farmer_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return {"message": f"Farmer {farmer_id} deleted successfully"}


# ✅ Generate ID card (async Celery task)
@router.post("/{farmer_id}/generate-idcard",
            dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def generate_farmer_idcard(farmer_id: str, background_tasks: BackgroundTasks, db=Depends(get_database)):
    farmer = await db.farmers.find_one({"farmer_id": farmer_id})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # trigger async celery task
    background_tasks.add_task(generate_id_card.delay, farmer_id)
    return {"message": f"ID card generation started for {farmer_id}"}
