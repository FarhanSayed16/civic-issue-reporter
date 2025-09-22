from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.models.issue import Issue, Upvote
import math
import json

class IssueService:
    def __init__(self, db: Session):
        self.db = db

    def create_issue(self, payload):
        issue = Issue(
            reporter_id=payload.reporter_id,
            category=payload.category,
            description=payload.description,
            status="new",
            lat=payload.lat,
            lng=payload.lng,
            media_urls=json.dumps(payload.media_urls or []),
            ward=payload.ward,
            upvote_count=0
        )
        
        self.db.add(issue)
        self.db.commit()
        self.db.refresh(issue)
        
        return {
            "id": issue.id,
            "reporter_id": issue.reporter_id,
            "category": issue.category,
            "description": issue.description,
            "status": issue.status,
            "lat": issue.lat,
            "lng": issue.lng,
            "media_urls": issue.media_urls_list,
            "ward": issue.ward,
            "upvote_count": issue.upvote_count,
            "created_at": issue.created_at,
            "updated_at": issue.updated_at
        }

    def get_issue(self, issue_id: int):
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return None
        
        return {
            "id": issue.id,
            "reporter_id": issue.reporter_id,
            "category": issue.category,
            "description": issue.description,
            "status": issue.status,
            "lat": issue.lat,
            "lng": issue.lng,
            "media_urls": issue.media_urls_list,
            "ward": issue.ward,
            "upvote_count": issue.upvote_count,
            "created_at": issue.created_at,
            "updated_at": issue.updated_at
        }

    def get_issues(self, lat: Optional[float] = None, lng: Optional[float] = None, 
                   radius: float = 5.0, category: Optional[str] = None, 
                   status: Optional[str] = None):
        query = self.db.query(Issue)
        
        # Apply filters
        if category:
            query = query.filter(Issue.category == category)
        if status:
            query = query.filter(Issue.status == status)
        
        issues = query.all()
        
        # Filter by location if provided
        if lat and lng:
            filtered_issues = []
            for issue in issues:
                if self._calculate_distance(lat, lng, issue.lat, issue.lng) <= radius:
                    filtered_issues.append(issue)
            issues = filtered_issues
        
        return [
            {
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "category": issue.category,
                "description": issue.description,
                "status": issue.status,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "ward": issue.ward,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            }
            for issue in issues
        ]

    def get_user_issues(self, user_id: int):
        issues = self.db.query(Issue).filter(Issue.reporter_id == user_id).all()
        
        return [
            {
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "category": issue.category,
                "description": issue.description,
                "status": issue.status,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "ward": issue.ward,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            }
            for issue in issues
        ]

    def get_admin_issues(self, status: Optional[str] = None, ward: Optional[str] = None,
                        category: Optional[str] = None, sort_by: str = "created_at",
                        sort_order: str = "desc", limit: int = 50, offset: int = 0):
        query = self.db.query(Issue)
        
        # Apply filters
        if status:
            query = query.filter(Issue.status == status)
        if ward:
            query = query.filter(Issue.ward == ward)
        if category:
            query = query.filter(Issue.category == category)
        
        # Sort
        if sort_by == "upvote_count":
            if sort_order == "desc":
                query = query.order_by(desc(Issue.upvote_count))
            else:
                query = query.order_by(asc(Issue.upvote_count))
        elif sort_by == "created_at":
            if sort_order == "desc":
                query = query.order_by(desc(Issue.created_at))
            else:
                query = query.order_by(asc(Issue.created_at))
        
        # Paginate
        issues = query.offset(offset).limit(limit).all()
        
        return [
            {
                "id": issue.id,
                "reporter_id": issue.reporter_id,
                "category": issue.category,
                "description": issue.description,
                "status": issue.status,
                "lat": issue.lat,
                "lng": issue.lng,
                "media_urls": issue.media_urls_list,
                "ward": issue.ward,
                "upvote_count": issue.upvote_count,
                "created_at": issue.created_at,
                "updated_at": issue.updated_at
            }
            for issue in issues
        ]

    def upvote_issue(self, issue_id: int, user_id: int):
        # Check if user already upvoted
        existing_upvote = self.db.query(Upvote).filter(
            Upvote.issue_id == issue_id, 
            Upvote.user_id == user_id
        ).first()
        
        if existing_upvote:
            return True  # Already upvoted
        
        # Create new upvote
        upvote = Upvote(issue_id=issue_id, user_id=user_id)
        self.db.add(upvote)
        
        # Update upvote count
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if issue:
            issue.upvote_count += 1
            issue.updated_at = datetime.utcnow()
            self.db.commit()
            return {"ok": True, "upvoted_at": upvote.created_at, "issue_updated_at": issue.updated_at}
        
        return {"ok": False}

    def update_issue(self, issue_id: int, update_data):
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if not issue:
            return None
        
        # Update fields if provided
        for field, value in update_data.dict(exclude_unset=True).items():
            if value is not None:
                setattr(issue, field, value)
        
        issue.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(issue)
        
        return {
            "id": issue.id,
            "reporter_id": issue.reporter_id,
            "category": issue.category,
            "description": issue.description,
            "status": issue.status,
            "lat": issue.lat,
            "lng": issue.lng,
            "media_urls": issue.media_urls,
            "ward": issue.ward,
            "upvote_count": issue.upvote_count,
            "created_at": issue.created_at,
            "updated_at": issue.updated_at
        }

    def delete_issue(self, issue_id: int):
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if issue:
            # Delete related upvotes
            self.db.query(Upvote).filter(Upvote.issue_id == issue_id).delete()
            # Delete the issue
            self.db.delete(issue)
            self.db.commit()
            return True
        return False

    def update_status(self, issue_id: int, status: str):
        issue = self.db.query(Issue).filter(Issue.id == issue_id).first()
        if issue:
            issue.status = status
            issue.updated_at = datetime.utcnow()
            self.db.commit()
            return {"ok": True, "updated_at": issue.updated_at}
        return {"ok": False}

    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points in kilometers using Haversine formula"""
        R = 6371  # Earth's radius in kilometers
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = (math.sin(dlat/2) * math.sin(dlat/2) + 
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
             math.sin(dlng/2) * math.sin(dlng/2))
        
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
