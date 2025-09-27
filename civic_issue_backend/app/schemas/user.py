from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    phone_number: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    profile_picture_url: Optional[str] = None

class UserOut(BaseModel):
    id: int
    full_name: str
    phone_number: str
    role: str
    department: Optional[str] = None
    ward: Optional[str] = None
    trust_score: Optional[float] = 100.0
    profile_picture_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
