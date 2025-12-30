from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserUpdate
from typing import List, Optional

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, full_name, phone_number, password, role="citizen", department=None):
        # Check if user already exists
        existing_user = self.db.query(User).filter(User.phone_number == phone_number).first()
        if existing_user:
            # Return existing user info instead of error to make register idempotent
            return {
                "id": existing_user.id,
                "full_name": existing_user.full_name,
                "phone_number": existing_user.phone_number,
                "role": existing_user.role,
                "department": existing_user.department,
                "ward": existing_user.ward,
                "trust_score": existing_user.trust_score,
                "profile_picture_url": existing_user.profile_picture_url,
                "created_at": existing_user.created_at,
                "updated_at": existing_user.updated_at
            }
        
        # Create new user
        user = User(
            full_name=full_name,
            phone_number=phone_number,
            phone_number_hash=pwd_ctx.hash(phone_number),  # Encrypt phone number
            password_hash=pwd_ctx.hash(password),
            role=role,
            department=department,
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
            "department": user.department,
            "ward": user.ward,
            "trust_score": user.trust_score,
            "profile_picture_url": user.profile_picture_url,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }

    def authenticate_user(self, username, password):
        user = self.db.query(User).filter(User.phone_number == username).first()
        if not user:
            return None
        
        # Ensure password is a string and not too long for bcrypt (72 byte limit)
        if isinstance(password, bytes):
            password = password.decode('utf-8', errors='ignore')
        password_str = str(password)
        
        # Bcrypt has a 72-byte limit, truncate if necessary
        # Convert to bytes to check length, then truncate
        password_bytes = password_str.encode('utf-8')
        if len(password_bytes) > 72:
            password_str = password_bytes[:72].decode('utf-8', errors='ignore')
        
        try:
            if pwd_ctx.verify(password_str, user.password_hash):
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
        except ValueError as e:
            # Handle bcrypt errors gracefully
            print(f"Password verification error: {e}")
            return None
        except Exception as e:
            print(f"Authentication error: {e}")
            return None
        
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
            "department": user.department,
            "ward": user.ward,
            "trust_score": user.trust_score,
            "profile_picture_url": user.profile_picture_url,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }

    def update_user_profile(self, user_id: int, user_update: UserUpdate):
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        if user_update.full_name is not None:
            user.full_name = user_update.full_name
        if user_update.profile_picture_url is not None:
            user.profile_picture_url = user_update.profile_picture_url
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return {
            "id": user.id,
            "full_name": user.full_name,
            "phone_number": user.phone_number,
            "role": user.role,
            "department": user.department,
            "ward": user.ward,
            "trust_score": user.trust_score,
            "profile_picture_url": user.profile_picture_url,
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
                "department": user.department,
                "ward": user.ward,
                "trust_score": user.trust_score,
                "profile_picture_url": user.profile_picture_url,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
            for user in users
        ]
