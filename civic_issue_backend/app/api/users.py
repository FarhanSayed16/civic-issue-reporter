from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserOut
from app.schemas.issue import IssueOut
from app.services.auth_service import AuthService
from app.services.issue_service import IssueService
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List

router = APIRouter()

@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service = AuthService(db)
    user = auth_service.get_user(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/me/issues", response_model=List[IssueOut])
def get_my_issues(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    issue_service = IssueService(db)
    issues = issue_service.get_user_issues(current_user["id"])
    return issues
