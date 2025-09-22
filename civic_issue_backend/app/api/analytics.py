from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.schemas.analytics import StatsResponse, HeatmapPoint
from app.services.analytics_service import AnalyticsService
from app.core.security import get_current_user
from app.core.db import get_db
from typing import List, Optional
from datetime import datetime

router = APIRouter()

@router.get("/stats", response_model=StatsResponse)
def get_stats(
    start_date: Optional[datetime] = Query(None, description="Start date for stats"),
    end_date: Optional[datetime] = Query(None, description="End date for stats"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get key KPI numbers for dashboard header"""
    analytics_service = AnalyticsService(db)
    stats = analytics_service.get_stats(start_date, end_date)
    return stats

@router.get("/heatmap", response_model=List[HeatmapPoint])
def get_heatmap_data(
    status: Optional[str] = Query(None, description="Filter by status"),
    category: Optional[str] = Query(None, description="Filter by category"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get issue coordinates for heatmap visualization"""
    analytics_service = AnalyticsService(db)
    heatmap_data = analytics_service.get_heatmap_data(status, category)
    return heatmap_data
