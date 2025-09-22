from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    full_name: str
    phone_number: str
    password: str

class UserOut(BaseModel):
    id: int
    full_name: str
    phone_number: str
    role: str
    trust_score: Optional[float] = 100.0
    created_at: datetime
    updated_at: datetime
