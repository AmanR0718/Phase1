from pydantic import BaseModel
from typing import Optional
from datetime import datetime
class PersonalInfo(BaseModel):
    first_name: str
    last_name: str
    phone_primary: str
class Address(BaseModel):
    province: str
    district: str
class FarmerCreate(BaseModel):
    temp_id: Optional[str] = None
    personal_info: PersonalInfo
    address: Address
class FarmerOut(FarmerCreate):
    farmer_id: str
    created_at: Optional[datetime] = None
