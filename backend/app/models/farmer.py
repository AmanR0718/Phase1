# backend/app/models/farmer.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List

class PersonalInfo(BaseModel):
    first_name: str = Field(..., min_length=1)
    last_name: str = Field(..., min_length=1)
    phone_primary: str = Field(..., min_length=10)
    phone_secondary: Optional[str] = None
    email: Optional[str] = None
    nrc: Optional[str] = None  # ← Field name is "nrc", not "nrc_number"
    date_of_birth: Optional[str] = None
    gender: Optional[str] = "other"

class Address(BaseModel):
    province: str = Field(..., min_length=1)
    province_name: Optional[str] = None
    district: str = Field(..., min_length=1)
    district_name: Optional[str] = None
    chiefdom_id: Optional[str] = None
    chiefdom_name: Optional[str] = None
    village: Optional[str] = None
    street: Optional[str] = None
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None

class FarmInfo(BaseModel):
    farm_size_hectares: float = Field(default=0.0, ge=0)
    crops_grown: List[str] = Field(default_factory=list)
    livestock_types: List[str] = Field(default_factory=list)
    has_irrigation: bool = False
    years_farming: int = Field(default=0, ge=0)

class HouseholdInfo(BaseModel):
    household_size: Optional[int] = None
    number_of_dependents: Optional[int] = None
    primary_income_source: Optional[str] = None
    
    class Config:
        extra = "allow"

class FarmerCreate(BaseModel):
    temp_id: Optional[str] = None
    personal_info: PersonalInfo
    address: Address
    farm_info: Optional[FarmInfo] = Field(default_factory=FarmInfo)
    household_info: Optional[HouseholdInfo] = Field(default_factory=HouseholdInfo)

class FarmerOut(BaseModel):
    farmer_id: str
    temp_id: Optional[str] = None
    personal_info: PersonalInfo
    address: Address
    farm_info: Optional[FarmInfo] = None
    household_info: Optional[HouseholdInfo] = None
    registration_status: str
    created_at: datetime
    
    class Config:
        orm_mode = True

class FarmerUpdate(BaseModel):
    personal_info: Optional[PersonalInfo] = None
    address: Optional[Address] = None
    farm_info: Optional[FarmInfo] = None
    household_info: Optional[HouseholdInfo] = None  
    registration_status: Optional[str] = None
    
    class Config:
        extra = "allow" 
        validate_assignment = True
    @validator("registration_status")
    def validate_registration_status(cls, v):
        allowed_statuses = {"PENDING", "VERIFIED", "REJECTED"}
        if v not in allowed_statuses:
            raise ValueError(f"registration_status must be one of {allowed_statuses}")
        return v        
    
        
