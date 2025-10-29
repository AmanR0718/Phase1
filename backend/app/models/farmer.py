from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

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
class FarmerOut(BaseModel):
    farmer_id: str
    created_at: datetime
    registration_status: str
    # … other fields …
    _id: Optional[str] = None   # now not required