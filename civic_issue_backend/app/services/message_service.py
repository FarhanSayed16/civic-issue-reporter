from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.issue import Issue, Message, Notification
from app.models.user import User
from app.core.websocket import manager

class MessageService:
    def __init__(self, db: Session):
        self.db = db

    async def send_message(self, issue_id: int, sender_id: int, message_text: str, is_admin_message: bool = False):
        """Send a message in issue chat"""
        # Check if issue exists
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return {"success": False, "message": "Issue not found"}
        
        # Create message
        message = Message(
            issue_id=issue_id,
            sender_id=sender_id,
            message=message_text,
            is_admin_message=is_admin_message
        )
        
        self.db.add(message)
        self.db.commit()
        
        # Send notification to the other party
        if is_admin_message:
            # Admin sent message, notify user
            self._send_notification(
                user_id=issue.reporter_id,
                issue_id=issue_id,
                notification_type="message",
                message=f"Admin sent a message about issue #{issue_id}: {message_text[:50]}..."
            )
            # Send real-time notification via WebSocket
            await manager.send_to_user(issue.reporter_id, {
                "type": "new_message",
                "issue_id": issue_id,
                "message": message_text,
                "sender": "admin",
                "timestamp": datetime.utcnow().isoformat()
            })
        else:
            # User sent message, notify assigned admin
            if issue.assigned_admin_id:
                self._send_notification(
                    user_id=issue.assigned_admin_id,
                    issue_id=issue_id,
                    notification_type="message",
                    message=f"User sent a message about issue #{issue_id}: {message_text[:50]}..."
                )
                # Send real-time notification via WebSocket
                await manager.send_to_user(issue.assigned_admin_id, {
                    "type": "new_message",
                    "issue_id": issue_id,
                    "message": message_text,
                    "sender": "user",
                    "timestamp": datetime.utcnow().isoformat()
                })
        
        return {"success": True, "message_id": message.id}

    def get_issue_messages(self, issue_id: int):
        """Get all messages for an issue"""
        messages = self.db.query(Message).filter(
            Message.issue_id == issue_id
        ).order_by(Message.created_at.asc()).all()
        
        return [
            {
                "id": msg.id,
                "issue_id": msg.issue_id,
                "sender_id": msg.sender_id,
                "message": msg.message,
                "is_admin_message": msg.is_admin_message,
                "created_at": msg.created_at,
                "sender_name": msg.sender.full_name if msg.sender else "Unknown"
            }
            for msg in messages
        ]

    def _send_notification(self, user_id: int, issue_id: int, notification_type: str, message: str):
        """Send notification to user"""
        notification = Notification(
            user_id=user_id,
            issue_id=issue_id,
            type=notification_type,
            message=message
        )
        self.db.add(notification)
        self.db.commit()
