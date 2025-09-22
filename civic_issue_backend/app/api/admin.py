from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.issue import IssueOut, IssueUpdate
from app.schemas.user import UserOut
from app.services.issue_service import IssueService
from app.services.auth_service import AuthService
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List, Optional

router = APIRouter()

@router.get("/issues", response_model=List[IssueOut])
def get_admin_issues(
    status: Optional[str] = Query(None, description="Filter by status"),
    ward: Optional[str] = Query(None, description="Filter by ward"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
    limit: Optional[int] = Query(50, description="Number of issues to return"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all issues with powerful filtering for admin dashboard"""
    issue_service = IssueService(db)
    issues = issue_service.get_admin_issues(
        status=status,
        ward=ward,
        category=category,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset
    )
    return issues

@router.patch("/issues/{issue_id}", response_model=IssueOut)
def update_issue(
    issue_id: int, 
    issue_update: IssueUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update issue details (status, department, notes, etc.)"""
    issue_service = IssueService(db)
    issue = issue_service.update_issue(issue_id, issue_update)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@router.delete("/issues/{issue_id}")
def delete_issue(issue_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an issue (for spam/invalid reports)"""
    issue_service = IssueService(db)
    success = issue_service.delete_issue(issue_id)
    if not success:
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"ok": True, "message": "Issue deleted successfully"}

@router.get("/users", response_model=List[UserOut])
def get_admin_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    limit: Optional[int] = Query(50, description="Number of users to return"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all users for user management"""
    auth_service = AuthService(db)
    users = auth_service.get_all_users(role=role, limit=limit, offset=offset)
    return users
