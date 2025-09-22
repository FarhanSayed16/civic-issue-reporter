from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from typing import List, Optional

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, full_name, phone_number, password):
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.phone_number == phone_number).first()
        if existing_user:
            # Return existing user info instead of error to make register idempotent
            return {
                "id": existing_user.id,
                "full_name": existing_user.full_name,
                "phone_number": existing_user.phone_number,
                "role": existing_user.role,
                "trust_score": existing_user.trust_score,
                "created_at": existing_user.created_at,
                "updated_at": existing_user.updated_at
            }
        
        # Create new user
        user = User(
            full_name=full_name,
            phone_number=phone_number,
            password_hash=pwd_ctx.hash(password),
            role="citizen",
            trust_score=100.0
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return {
            "id": user.id,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "role": user.role,
            "trust_score": user.trust_score,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }

    def authenticate_user(self, username, password):
        user = self.db.query(User).filter(User.phone_number == username).first()
        if user and pwd_ctx.verify(password, user.password_hash):
            access_token = jwt.encode(
                {"sub": str(user.id), "exp": datetime.utcnow() + timedelta(minutes=60)}, 
                settings.SECRET_KEY, 
                algorithm=settings.ALGORITHM
            )
            refresh_token = jwt.encode(
                {"sub": str(user.id), "exp": datetime.utcnow() + timedelta(days=7)}, 
                settings.SECRET_KEY, 
                algorithm=settings.ALGORITHM
            )
            return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
        return None

    def get_user(self, user_id: int):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        return {
            "id": user.id,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "role": user.role,
            "trust_score": user.trust_score,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }

    def get_all_users(self, role: Optional[str] = None, limit: int = 50, offset: int = 0):
        query = self.db.query(User)
        
        if role:
            query = query.filter(User.role == role)
        
        users = query.offset(offset).limit(limit).all()
        
        return [
            {
                "id": user.id,
                "full_name": user.full_name,
                "phone_number": user.phone_number,
                "role": user.role,
                "trust_score": user.trust_score,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            for user in users
        ]
