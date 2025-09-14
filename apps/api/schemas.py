# File: E:/civic-reporter/apps/api/schemas.py

from pydantic import BaseModel

# The basic data required for an issue
class IssueBase(BaseModel):
    description: str
    latitude: float
    longitude: float

# The data required when CREATING an issue (same as base for now)
class IssueCreate(IssueBase):
    pass

# The data that is RETURNED from the API, including the database-generated ID and status
class Issue(IssueBase):
    id: int
    status: str

    class Config:
        from_attributes = True