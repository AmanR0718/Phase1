from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserInDB(BaseModel):
    email: EmailStr
    password_hash: str
    roles: List[str] = Field(default_factory=lambda: ["VIEWER"])
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
