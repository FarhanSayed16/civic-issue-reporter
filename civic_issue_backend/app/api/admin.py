from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.issue import IssueOut, IssueUpdate
from app.schemas.user import UserOut
from app.schemas.notification import NotificationOut
from app.services.issue_service import IssueService
from app.services.auth_service import AuthService
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List, Optional

router = APIRouter()

@router.get("/issues", response_model=List[IssueOut])
def get_admin_issues(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
    limit: Optional[int] = Query(50, description="Number of issues to return"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all issues from admin's department"""
    from app.models.user import User
    
    # Get admin's department
    admin = db.query(User).filter(User.id == current_user["id"]).first()
    if not admin or not admin.department:
        raise HTTPException(status_code=400, detail="Admin department not found")
    
    issue_service = IssueService(db)
    issues = issue_service.get_department_issues(
        department=admin.department,
        status=status,
        category=category,
        priority=priority,
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
    """Update issue with admin actions and trust score management - only for assigned issues"""
    issue_service = IssueService(db)
    
    # First check if the issue exists and is assigned to this admin
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Check if the issue is assigned to this admin
    if issue.get("assigned_admin_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only update issues assigned to you")
    
    # Use the new method that handles trust score updates
    result = issue_service.update_issue_status_with_trust_score(
        issue_id=issue_id,
        status=issue_update.status,
        admin_id=current_user["id"]
    )
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result.get("message", "Issue not found"))
    
    # Return updated issue
    updated_issue = issue_service.get_issue(issue_id)
    if not updated_issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    return updated_issue

@router.get("/my-issues", response_model=List[IssueOut])
def get_my_assigned_issues(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    sort_by: Optional[str] = Query("created_at", description="Sort by field"),
    sort_order: Optional[str] = Query("desc", description="Sort order (asc/desc)"),
    limit: Optional[int] = Query(50, description="Number of issues to return"),
    offset: Optional[int] = Query(0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get issues assigned to current admin"""
    issue_service = IssueService(db)
    issues = issue_service.get_admin_issues(
        admin_id=current_user["id"],
        status=status,
        category=category,
        priority=priority,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset
    )
    return issues

@router.delete("/issues/{issue_id}")
def delete_issue(issue_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an issue (for spam/invalid reports) - only for assigned issues"""
    issue_service = IssueService(db)
    
    # First check if the issue exists and is assigned to this admin
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Check if the issue is assigned to this admin
    if issue.get("assigned_admin_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete issues assigned to you")
    
    success = issue_service.delete_issue(issue_id)
    if not success:
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"success": True, "message": "Issue deleted successfully"}

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

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get notifications for current user"""
    from app.models.issue import Notification
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user["id"]
    ).order_by(Notification.created_at.desc()).limit(50).all()
    
    return [
        {
            "id": n.id,
            "user_id": n.user_id,
            "issue_id": n.issue_id,
            "type": n.type,
            "message": n.message,
            "read": n.read,
            "created_at": n.created_at
        }
        for n in notifications
    ]

@router.patch("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    from app.models.issue import Notification
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user["id"]
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = True
    db.commit()
    
    return {"success": True, "message": "Notification marked as read"}

@router.patch("/notifications/mark-all-read")
def mark_all_notifications_read(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all notifications as read for current user"""
    from app.models.issue import Notification
    
    db.query(Notification).filter(
        Notification.user_id == current_user["id"],
        Notification.read == False
    ).update({"read": True})
    
    db.commit()
    
    return {"success": True, "message": "All notifications marked as read"}
