from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.issue import IssueCreate, IssueOut, UploadInitiateResponse
from app.services.issue_service import IssueService
from app.services.storage_service import StorageService
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List, Optional

router = APIRouter()
storage_service = StorageService()

@router.post("/initiate-upload", response_model=UploadInitiateResponse)
def initiate_upload(filename: str):
    """Step 1: Get secure upload URL for photo"""
    upload_data = storage_service.generate_presigned_upload(filename)
    return upload_data

@router.post("", response_model=IssueOut)
def create_issue(payload: IssueCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Step 2: Create issue after photo upload"""
    # Set reporter_id from current user
    payload.reporter_id = current_user["id"]
    issue_service = IssueService(db)
    issue = issue_service.create_issue(payload)
    if not issue:
        raise HTTPException(status_code=500, detail="Could not create issue")
    return issue

@router.get("", response_model=List[IssueOut])
def get_issues(
    lat: Optional[float] = Query(None, description="Latitude for nearby issues"),
    lng: Optional[float] = Query(None, description="Longitude for nearby issues"),
    radius: Optional[float] = Query(5.0, description="Radius in km for nearby issues"),
    category: Optional[str] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """Get list of issues with optional filtering"""
    issue_service = IssueService(db)
    issues = issue_service.get_issues(lat, lng, radius, category, status)
    return issues

@router.get("/{issue_id}", response_model=IssueOut)
def get_issue(issue_id: int, db: Session = Depends(get_db)):
    issue_service = IssueService(db)
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@router.post("/{issue_id}/upvote")
def upvote_issue(issue_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Upvote an issue (same issue counter)"""
    issue_service = IssueService(db)
    result = issue_service.upvote_issue(issue_id, current_user["id"])
    if not result.get("ok"):
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"ok": True, "message": "Issue upvoted successfully", "upvoted_at": result.get("upvoted_at"), "issue_updated_at": result.get("issue_updated_at")}

@router.patch("/{issue_id}/status")
def update_status(issue_id: int, status_update: dict, db: Session = Depends(get_db)):
    issue_service = IssueService(db)
    result = issue_service.update_status(issue_id, status_update.get("status"))
    return result
