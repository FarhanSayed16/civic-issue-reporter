from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class IssueCreate(BaseModel):
    reporter_id: Optional[int] = None  # Will be set from current user
    category: str
    description: str
    lat: float
    lng: float
    media_urls: Optional[List[str]] = []
    ward: Optional[str] = None

class IssueOut(BaseModel):
    id: int
    reporter_id: int
    category: str
    status: str
    description: str
    lat: float
    lng: float
    media_urls: Optional[List[str]] = []
    ward: Optional[str] = None
    upvote_count: int = 0
    created_at: datetime
    updated_at: datetime

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    ward: Optional[str] = None
    assigned_department: Optional[str] = None
    internal_notes: Optional[str] = None

class UploadInitiateResponse(BaseModel):
    url: str
    expires_in: int
