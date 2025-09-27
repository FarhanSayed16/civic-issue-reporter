from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.core.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(15), unique=True, index=True, nullable=False)
    phone_number_hash = Column(String(255), nullable=False)  # Encrypted phone number
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="citizen", nullable=False)
    department = Column(String(50), nullable=True)  # For admin department assignment
    ward = Column(String(50), nullable=True)  # For ward-specific admin assignment
    trust_score = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    profile_picture_url = Column(String(500), nullable=True)  # URL to profile picture
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    issues = relationship("Issue", back_populates="reporter", foreign_keys="Issue.reporter_id")
    assigned_issues = relationship("Issue", foreign_keys="Issue.assigned_admin_id")
    upvotes = relationship("Upvote", back_populates="user")

