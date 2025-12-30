from fastapi import APIRouter, HTTPException, Depends, Query, Request
from fastapi import UploadFile, File, Body
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.schemas.issue import IssueCreate, IssueOut, UploadInitiateResponse
from app.services.issue_service import IssueService
from app.services.storage_service import StorageService
from app.core.security import get_current_user
from app.core.db import get_db
from app.core.rate_limiter import limiter
from typing import List, Optional

router = APIRouter()
storage_service = StorageService()

@router.post("/initiate-upload", response_model=UploadInitiateResponse)
def initiate_upload(filename: str):
    """Step 1: Get secure upload URL for photo. Local disk uploads are disabled."""
    # Enforce cloud storage usage only; avoid saving files on backend filesystem
    if getattr(storage_service, "provider", "local").lower() == "local":
        raise HTTPException(status_code=400, detail="Direct uploads disabled. Configure S3/MinIO storage.")
    upload_data = storage_service.generate_presigned_upload(filename)
    return upload_data

@router.put("/upload/{filename}")
async def upload_file_local(filename: str, file: bytes = Body(...)):
    """Local upload endpoint disabled to prevent saving files on backend."""
    raise HTTPException(status_code=400, detail="Local uploads are disabled. Use presigned S3/MinIO uploads.")

@router.post("", response_model=IssueOut)
@limiter.limit("20/minute")  # Rate limit: 20 issue creations per minute per user
def create_issue(payload: IssueCreate, request: Request, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Step 2: Create issue after photo upload"""
    # Set reporter_id from current user
    payload.reporter_id = current_user["id"]
    issue_service = IssueService(db)
    result = issue_service.create_issue(payload)
    
    # Check if duplicate was detected
    if isinstance(result, dict) and not result.get("success", True):
        raise HTTPException(
            status_code=409, 
            detail={
                "message": result["message"],
                "duplicates": result.get("duplicates", [])
            }
        )
    
    if not result:
        raise HTTPException(status_code=500, detail="Could not create issue")
    return result

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

@router.get("/my-issues", response_model=List[IssueOut])
def get_user_issues(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get issues reported by current user"""
    issue_service = IssueService(db)
    issues = issue_service.get_user_issues(current_user["id"])
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
    if not result.get("success"):
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"success": True, "message": "Issue upvoted successfully", "upvoted_at": result.get("upvoted_at"), "issue_updated_at": result.get("issue_updated_at")}

@router.patch("/{issue_id}/status")
def update_status(issue_id: int, status_update: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update issue status - only for assigned admins"""
    issue_service = IssueService(db)
    
    # First check if the issue exists and is assigned to this admin
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Check if the issue is assigned to this admin
    if issue.get("assigned_admin_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only update issues assigned to you")
    
    result = issue_service.update_status(issue_id, status_update.get("status"))
    return result
