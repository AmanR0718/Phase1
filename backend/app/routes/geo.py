from bson import ObjectId
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List, Dict, Any
from app.database import get_database
from bson.regex import Regex
import math

router = APIRouter(tags=["Geographic Data"])

def is_valid_number(value):
    """Check if a number is JSON-serializable (not NaN or Infinity)"""
    if isinstance(value, (int, float)):
        return math.isfinite(value)
    return True

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Recursively convert MongoDB documents to JSON-serializable format.
    Handles ObjectId, datetime, NaN, Infinity, and other BSON types.
    """
    if doc is None:
        return None
    
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, float):
            # Handle NaN and Infinity
            if math.isnan(value):
                result[key] = None
            elif math.isinf(value):
                result[key] = None
            else:
                result[key] = value
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        elif isinstance(value, list):
            result[key] = [serialize_doc(item) if isinstance(item, dict) else 
                          (str(item) if isinstance(item, ObjectId) else 
                          (None if isinstance(item, float) and not math.isfinite(item) else item))
                          for item in value]
        else:
            result[key] = value
    return result

@router.get("/provinces")
async def list_provinces(db=Depends(get_database)):
    """Get all provinces"""
    try:
        cursor = db.provinces.find({})
        provinces = await cursor.to_list(length=100)
        
        if not provinces:
            raise HTTPException(status_code=404, detail="No provinces found")
        
        return [serialize_doc({k: v for k, v in p.items() if k != '_id'}) for p in provinces]
    except Exception as e:
        print(f"Error in list_provinces: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/districts")
async def list_districts(province_id: Optional[str] = Query(None), db=Depends(get_database)):
    """Get districts, optionally filtered by province_id"""
    try:
        query = {"province_id": province_id} if province_id else {}
        cursor = db.districts.find(query)
        districts = await cursor.to_list(length=500)
        
        if not districts:
            raise HTTPException(status_code=404, detail="No districts found")
        
        return [serialize_doc({k: v for k, v in d.items() if k != '_id'}) for d in districts]
    except Exception as e:
        print(f"Error in list_districts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chiefdoms")
async def list_chiefdoms(district_id: Optional[str] = Query(None), db=Depends(get_database)):
    """Get chiefdoms, optionally filtered by district_id"""
    try:
        # Case-insensitive match on district_id
        query = {"district_id": Regex(f"^{district_id}$", "i")} if district_id else {}
        
        cursor = db.chiefdoms.find(query)
        chiefdoms = await cursor.to_list(length=2000)
        
        # Return empty list if no chiefdoms found
        if not chiefdoms:
            return []
        
        # Process chiefdoms
        result = []
        for c in chiefdoms:
            try:
                doc = {k: v for k, v in c.items() if k != '_id'}
                
                # Ensure chiefdom_name exists
                if "chiefdom_name" not in doc and "chief_name" in doc:
                    doc["chiefdom_name"] = doc["chief_name"]
                
                # Serialize and validate
                serialized = serialize_doc(doc)
                result.append(serialized)
            except Exception as e:
                print(f"Error processing chiefdom {c.get('chiefdom_id', 'unknown')}: {e}")
                continue
        
        return result
    except Exception as e:
        print(f"Error in list_chiefdoms: {e}")
        raise HTTPException(status_code=500, detail=str(e))
