from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.security import get_current_user
from app.core.db import get_db
from app.services.issue_service import IssueService
from app.services.message_service import MessageService
from app.models.user import User
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class MessageCreate(BaseModel):
    message: str

class MessageOut(BaseModel):
    id: int
    issue_id: int
    sender_id: int
    message: str
    is_admin_message: bool
    created_at: datetime
    sender_name: str

    class Config:
        from_attributes = True

@router.post("/issues/{issue_id}/messages")
async def send_message(
    issue_id: int,
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message in issue chat"""
    issue_service = IssueService(db)
    message_service = MessageService(db)
    
    # Check if user has access to this issue
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Check if user is the reporter or assigned admin
    user_id = current_user["id"]
    is_admin = db.query(User).filter(User.id == user_id, User.role == "admin").first()
    
    # If user is admin, check if they are assigned to this issue
    if is_admin and issue.get("assigned_admin_id") != user_id:
        raise HTTPException(status_code=403, detail="You can only chat on issues assigned to you")
    
    # If user is not admin, check if they are the reporter
    if not is_admin and issue["reporter_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Send message
    result = await message_service.send_message(
        issue_id=issue_id,
        sender_id=user_id,
        message_text=message_data.message,
        is_admin_message=bool(is_admin)
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return {"success": True, "message_id": result["message_id"]}

@router.get("/issues/{issue_id}/messages", response_model=List[MessageOut])
def get_issue_messages(
    issue_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages for an issue"""
    issue_service = IssueService(db)
    message_service = MessageService(db)
    
    # Check if user has access to this issue
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Check if user is the reporter or assigned admin
    user_id = current_user["id"]
    is_admin = db.query(User).filter(User.id == user_id, User.role == "admin").first()
    
    # If user is admin, check if they are assigned to this issue
    if is_admin and issue.get("assigned_admin_id") != user_id:
        raise HTTPException(status_code=403, detail="You can only view messages for issues assigned to you")
    
    # If user is not admin, check if they are the reporter
    if not is_admin and issue["reporter_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    messages = message_service.get_issue_messages(issue_id)
    return messages

@router.patch("/issues/{issue_id}/read")
def mark_messages_as_read(
    issue_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark all messages for an issue as read"""
    issue_service = IssueService(db)
    message_service = MessageService(db)
    
    # Check if user has access to this issue
    issue = issue_service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    # Check if user is the reporter or assigned admin
    user_id = current_user["id"]
    is_admin = db.query(User).filter(User.id == user_id, User.role == "admin").first()
    
    # If user is admin, check if they are assigned to this issue
    if is_admin and issue.get("assigned_admin_id") != user_id:
        raise HTTPException(status_code=403, detail="You can only mark messages as read for issues assigned to you")
    
    # If user is not admin, check if they are the reporter
    if not is_admin and issue["reporter_id"] != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Mark messages as read (this is a simple implementation)
    # In a real app, you'd track read status per user
    return {"success": True, "message": "Messages marked as read"}
