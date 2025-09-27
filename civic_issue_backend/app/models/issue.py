from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.db import Base
from datetime import datetime
import json

class Issue(Base):
    __tablename__ = "issues"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), default="new", nullable=False)
    priority = Column(String(10), default="medium", nullable=False)  # high, medium, low
    severity_score = Column(Float, default=0.5, nullable=False)  # 0-1 severity score from NLP
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    media_urls = Column(Text, default="[]")  # JSON string for SQLite compatibility
    is_anonymous = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=True)  # All issues are verified by default
    assigned_department = Column(String(50))
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    street = Column(String(100))
    landmark = Column(String(100))
    pincode = Column(String(20))
    internal_notes = Column(Text)
    upvote_count = Column(Integer, default=0)
    assigned_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reporter = relationship("User", back_populates="issues", foreign_keys=[reporter_id])
    assigned_admin = relationship("User", foreign_keys=[assigned_admin_id], overlaps="assigned_issues")
    upvotes = relationship("Upvote", back_populates="issue")
    messages = relationship("Message", back_populates="issue")
    
    @property
    def media_urls_list(self):
        """Convert JSON string to list"""
        try:
            return json.loads(self.media_urls) if self.media_urls else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    @media_urls_list.setter
    def media_urls_list(self, value):
        """Convert list to JSON string"""
        self.media_urls = json.dumps(value) if value else "[]"

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=True)
    type = Column(String(50), nullable=False)  # 'status_update', 'assignment', 'spam', 'resolved'
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    issue = relationship("Issue")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_admin_message = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    issue = relationship("Issue", back_populates="messages")
    sender = relationship("User")

class Upvote(Base):
    __tablename__ = "upvotes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_id = Column(Integer, ForeignKey("issues.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="upvotes")
    issue = relationship("Issue", back_populates="upvotes")
    
    # Unique constraint to prevent duplicate upvotes
    __table_args__ = (
        {"extend_existing": True}
    )

