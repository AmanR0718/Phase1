# backend/app/routes/operators.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from app.database import get_database
from app.dependencies.roles import require_role
from app.utils.security import hash_password

router = APIRouter(prefix="/api/operators", tags=["Operators"])


# ---------------------------
# Pydantic schemas (local)
# ---------------------------
class OperatorCreate(BaseModel):
    email: EmailStr
    full_name: str = Field(..., example="Alice Tembo")
    phone: Optional[str] = Field(None, example="+260971234567")
    password: str = Field(..., min_length=6)
    assigned_regions: Optional[List[str]] = Field(default_factory=list)
    assigned_districts: Optional[List[str]] = Field(default_factory=list)


class OperatorUpdate(BaseModel):
    full_name: Optional[str]
    phone: Optional[str]
    assigned_regions: Optional[List[str]]
    assigned_districts: Optional[List[str]]
    is_active: Optional[bool]


class OperatorOut(BaseModel):
    operator_id: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    assigned_regions: List[str] = Field(default_factory=list)
    assigned_districts: List[str] = Field(default_factory=list)
    is_active: bool
    created_at: datetime
    farmer_count: int = 0


# ---------------------------
# Helpers
# ---------------------------
def _doc_to_operator(doc: dict) -> dict:
    if not doc:
        return {}
    doc = dict(doc)
    # Remove internal fields if present
    doc.pop("_id", None)
    return doc


async def _get_operator_stats(operator_id: str, db):
    """
    Return quick stats for an operator:
      - number of farmers created by this operator
      - total land (if available)
      - recent registrations (30 days)
    """
    farmer_count = await db.farmers.count_documents({"created_by": operator_id})
    from datetime import timedelta
    recent_cutoff = datetime.utcnow() - timedelta(days=30)
    recent_count = await db.farmers.count_documents(
        {"created_by": operator_id, "created_at": {"$gte": recent_cutoff}}
    )

    # aggregate total land holding if field exists
    pipeline = [
        {"$match": {"created_by": operator_id}},
        {
            "$group": {
                "_id": None,
                "total_land": {"$sum": {"$ifNull": ["$total_land_holding", 0]}},
                "avg_land": {"$avg": {"$ifNull": ["$total_land_holding", 0]}},
            }
        },
    ]
    agg = await db.farmers.aggregate(pipeline).to_list(length=1)
    total_land = agg[0]["total_land"] if agg else 0
    avg_land = agg[0]["avg_land"] if agg else 0

    return {
        "farmer_count": farmer_count,
        "recent_registrations_30d": recent_count,
        "total_land": total_land,
        "avg_land": avg_land,
    }


# ---------------------------
# Routes
# ---------------------------

@router.post("/", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(["ADMIN"]))])
async def create_operator(payload: OperatorCreate, db=Depends(get_database)):
    """
    Create a new operator (Admin only).
    This creates both an entry in `users` and an `operators` document.
    """
    email = payload.email.lower().strip()

    # check if user exists
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # create user record
    user_doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "roles": ["OPERATOR"],
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    user_res = await db.users.insert_one(user_doc)
    user_id = str(user_res.inserted_id)

    operator_id = "OP" + uuid4().hex[:8].upper()
    operator_doc = {
        "operator_id": operator_id,
        "user_id": user_id,
        "email": email,
        "full_name": payload.full_name,
        "phone": payload.phone,
        "assigned_regions": payload.assigned_regions or [],
        "assigned_districts": payload.assigned_districts or [],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    await db.operators.insert_one(operator_doc)

    out = OperatorOut(
        operator_id=operator_id,
        email=email,
        full_name=payload.full_name,
        phone=payload.phone,
        assigned_regions=operator_doc["assigned_regions"],
        assigned_districts=operator_doc["assigned_districts"],
        is_active=True,
        created_at=operator_doc["created_at"],
        farmer_count=0,
    )
    return {"message": "Operator created", "operator": out.dict()}


@router.get("/", dependencies=[Depends(require_role(["ADMIN"]))])
async def list_operators(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    region: Optional[str] = None,
    is_active: Optional[bool] = None,
    db=Depends(get_database),
):
    """
    List operators (Admin only). Optional filters: region, is_active.
    Returns operator list with basic stats (farmer_count).
    """
    query = {}
    if region:
        query["assigned_regions"] = region
    if is_active is not None:
        query["is_active"] = is_active

    cursor = db.operators.find(query).skip(skip).limit(limit)
    ops = await cursor.to_list(length=limit)

    results = []
    for op in ops:
        op_doc = _doc_to_operator(op)
        stats = await _get_operator_stats(op_doc["operator_id"], db)
        op_doc["farmer_count"] = stats["farmer_count"]
        results.append(op_doc)

    return {"count": len(results), "results": results}


@router.get("/{operator_id}", dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def get_operator(operator_id: str, db=Depends(get_database)):
    """Get single operator by operator_id"""
    op = await db.operators.find_one({"operator_id": operator_id})
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operator not found")
    op_doc = _doc_to_operator(op)
    stats = await _get_operator_stats(operator_id, db)
    op_doc.update(stats)
    return op_doc


@router.put("/{operator_id}", dependencies=[Depends(require_role(["ADMIN"]))])
async def update_operator(operator_id: str, payload: OperatorUpdate, db=Depends(get_database)):
    """
    Update operator details (Admin only).
    If is_active set to False, also deactivate corresponding user.
    """
    op = await db.operators.find_one({"operator_id": operator_id})
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operator not found")

    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    update_data["updated_at"] = datetime.utcnow()
    await db.operators.update_one({"operator_id": operator_id}, {"$set": update_data})

    # If disabling operator, disable user as well
    if "is_active" in update_data and update_data["is_active"] is False:
        await db.users.update_one({"_id": op["user_id"]}, {"$set": {"is_active": False}})

    updated = await db.operators.find_one({"operator_id": operator_id})
    return _doc_to_operator(updated)


@router.delete("/{operator_id}", dependencies=[Depends(require_role(["ADMIN"]))])
async def delete_operator(operator_id: str, db=Depends(get_database)):
    """Delete operator only if no farmers assigned"""
    op = await db.operators.find_one({"operator_id": operator_id})
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operator not found")

    farmer_count = await db.farmers.count_documents({"created_by": operator_id})
    if farmer_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete operator with {farmer_count} assigned farmers",
        )

    # delete operator and corresponding user record
    await db.operators.delete_one({"operator_id": operator_id})
    await db.users.delete_one({"_id": op["user_id"]})

    return {"message": "Operator deleted"}


@router.get("/{operator_id}/farmers", dependencies=[Depends(require_role(["ADMIN", "OPERATOR"]))])
async def get_operator_farmers(operator_id: str, skip: int = 0, limit: int = 50, db=Depends(get_database)):
    """Get farmers created/managed by an operator"""
    cursor = db.farmers.find({"created_by": operator_id}).skip(skip).limit(limit)
    farmers = await cursor.to_list(length=limit)
    # sanitize farmer docs
    for f in farmers:
        f.pop("_id", None)
    return {"count": len(farmers), "results": farmers}


@router.get("/{operator_id}/stats", dependencies=[Depends(require_role(["ADMIN"]))])
async def operator_statistics(operator_id: str, db=Depends(get_database)):
    """Return aggregated statistics for the operator"""
    op = await db.operators.find_one({"operator_id": operator_id})
    if not op:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Operator not found")

    stats = await _get_operator_stats(operator_id, db)
    return {"operator_id": operator_id, "operator_name": op.get("full_name"), **stats}
