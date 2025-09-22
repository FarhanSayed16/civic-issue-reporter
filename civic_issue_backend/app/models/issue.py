from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
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
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    ward = Column(String(50))
    media_urls = Column(Text, default="[]")  # JSON string for SQLite compatibility
    assigned_department = Column(String(50))
    internal_notes = Column(Text)
    upvote_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reporter = relationship("User", back_populates="issues")
    upvotes = relationship("Upvote", back_populates="issue")
    
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

