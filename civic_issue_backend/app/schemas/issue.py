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
    is_anonymous: Optional[bool] = False
    assigned_department: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    street: Optional[str] = None
    landmark: Optional[str] = None
    pincode: Optional[str] = None

class IssueOut(BaseModel):
    id: int
    reporter_id: int
    reporter_name: str  # Show reporter name or "Anonymous"
    category: str
    status: str
    priority: str = "medium"
    severity_score: float = 0.5
    description: str
    lat: float
    lng: float
    media_urls: Optional[List[str]] = []
    is_anonymous: bool = False
    is_verified: bool = True
    assigned_department: Optional[str] = None
    assigned_admin_id: Optional[int] = None
    assigned_admin_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    street: Optional[str] = None
    landmark: Optional[str] = None
    pincode: Optional[str] = None
    upvote_count: int = 0
    created_at: datetime
    updated_at: datetime

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    assigned_department: Optional[str] = None
    assigned_admin_id: Optional[int] = None
    internal_notes: Optional[str] = None

class UploadInitiateResponse(BaseModel):
    url: str
    expires_in: int
