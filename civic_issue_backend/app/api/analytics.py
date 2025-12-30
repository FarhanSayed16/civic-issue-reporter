from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.analytics import StatsResponse, HeatmapPoint
from app.services.analytics_service import AnalyticsService
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List, Optional
from datetime import datetime
import os
import json

router = APIRouter()

# Demo mode check
DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'

def load_mock_analytics():
    """Load mock analytics data"""
    try:
        mock_path = os.path.join(os.path.dirname(__file__), '..', '..', 'mock_data', 'analytics.json')
        if os.path.exists(mock_path):
            with open(mock_path, 'r') as f:
                data = json.load(f)
                # Convert to StatsResponse format
                from app.schemas.analytics import StatsResponse
                return StatsResponse(
                    total_issues=data.get('total_issues', 150),
                    resolved_today=data.get('resolved_today', 12),
                    pending=data.get('pending', 8),
                    in_progress=data.get('in_progress', 15),
                    resolved_this_week=data.get('resolved_this_week', 45),
                    avg_resolution_time_hours=data.get('avg_resolution_time_hours', 24),
                    top_category=data.get('top_category', 'Open Garbage Dump'),
                    top_ward=data.get('top_ward', 'Solid Waste Management'),
                    new_issues=data.get('new_issues', 25),
                    total_pending=data.get('total_pending', 23)
                )
        # Fallback mock data
        from app.schemas.analytics import StatsResponse
        return StatsResponse(
            total_issues=150,
            resolved_today=12,
            pending=8,
            in_progress=15,
            resolved_this_week=45,
            avg_resolution_time_hours=24,
            top_category='Open Garbage Dump',
            top_ward='Solid Waste Management',
            new_issues=25,
            total_pending=23
        )
    except Exception as e:
        # Fallback mock data
        from app.schemas.analytics import StatsResponse
        return StatsResponse(
            total_issues=150,
            resolved_today=12,
            pending=8,
            in_progress=15,
            resolved_this_week=45,
            avg_resolution_time_hours=24,
            top_category='Open Garbage Dump',
            top_ward='Solid Waste Management',
            new_issues=25,
            total_pending=23
        )

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    start_date: Optional[datetime] = Query(None, description="Start date for stats"),
    end_date: Optional[datetime] = Query(None, description="End date for stats"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get key KPI numbers for dashboard header - department specific"""
    # Demo mode: return mock data
    if DEMO_MODE:
        return load_mock_analytics()
    
    from app.models.user import User
    
    # Get admin's department
    admin = db.query(User).filter(User.id == current_user["id"]).first()
    department = admin.department if admin else None
    
    analytics_service = AnalyticsService(db)
    stats = analytics_service.get_stats(start_date, end_date, department)
    return stats

@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap_data(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get issue coordinates for heatmap visualization - department specific"""
    from app.models.user import User
    
    # Get admin's department
    admin = db.query(User).filter(User.id == current_user["id"]).first()
    department = admin.department if admin else None
    
    analytics_service = AnalyticsService(db)
    heatmap_data = analytics_service.get_heatmap_data(status, category, department)
    return heatmap_data
