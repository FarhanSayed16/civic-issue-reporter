# schemas.py
from pydantic import BaseModel

class IssueBase(BaseModel):
    description: str
    latitude: float
    longitude: float

class IssueCreate(IssueBase):
    pass

class Issue(IssueBase):
    id: int
    status: str

    class Config:
        from_attributes = True # Changed from orm_mode for Pydantic v2
        