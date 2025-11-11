from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from app.core.database import get_database

router = APIRouter(prefix="/api/geo", tags=["Geographic Data"])

@router.get("/provinces")
async def list_provinces(db=Depends(get_database)):
    """Fetch all provinces."""
    provinces = await db.provinces.find({}, {"_id": 0}).to_list(length=100)
    if not provinces:
        raise HTTPException(status_code=404, detail="No provinces found")
    return provinces

@router.get("/districts")
async def list_districts(
    province_id: Optional[str] = Query(None),
    db=Depends(get_database),
):
    """Fetch districts; filter by province_id if provided."""
    query = {"province_id": province_id} if province_id else {}
    districts = await db.districts.find(query, {"_id": 0}).to_list(length=500)
    if not districts:
        raise HTTPException(status_code=404, detail="No districts found")
    return districts

@router.get("/chiefdoms")
async def list_chiefdoms(
    district_id: Optional[str] = Query(None),
    db=Depends(get_database),
):
    """Fetch chiefdoms; filter by district_id if provided."""
    query = {"district_id": district_id} if district_id else {}
    chiefdoms = await db.chiefdoms.find(query, {"_id": 0}).to_list(length=2000)
    if not chiefdoms:
        raise HTTPException(status_code=404, detail="No chiefdoms found")
    return chiefdoms
