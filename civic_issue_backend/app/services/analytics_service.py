from datetime import datetime, timedelta
from typing import List, Optional
from collections import Counter
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.schemas.analytics import StatsResponse, HeatmapPoint
from app.models.issue import Issue

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, department: Optional[str] = None):
        """Get key KPI numbers for dashboard header"""
        query = self.db.query(Issue)
        
        # Filter by department if provided
        if department:
            query = query.filter(Issue.assigned_department == department)
        
        # Filter by date range if provided
        if start_date:
            query = query.filter(Issue.created_at >= start_date)
        if end_date:
            query = query.filter(Issue.created_at <= end_date)
        
        issues = query.all()
        
        # Calculate stats
        total_issues = len(issues)
        
        # Count by status
        status_counts = Counter(issue.status for issue in issues)
        pending = status_counts.get("new", 0) + status_counts.get("in_progress", 0)
        in_progress = status_counts.get("in_progress", 0)
        
        # Resolved today
        today = datetime.now().date()
        resolved_today = len([
            issue for issue in issues 
            if issue.status == "resolved" and 
            issue.updated_at.date() == today
        ])
        
        # Resolved this week
        week_ago = datetime.now() - timedelta(days=7)
        resolved_this_week = len([
            issue for issue in issues 
            if issue.status == "resolved" and 
            issue.updated_at >= week_ago
        ])
        
        # Average resolution time
        resolved_issues = [issue for issue in issues if issue.status == "resolved"]
        if resolved_issues:
            total_time = sum(
                (issue.updated_at - issue.created_at).total_seconds()
                for issue in resolved_issues
            )
            avg_resolution_time_hours = (total_time / len(resolved_issues)) / 3600
        else:
            avg_resolution_time_hours = 0.0
        
        # Top category
        categories = Counter(issue.category for issue in issues)
        top_category = categories.most_common(1)[0][0] if categories else "None"
        
        return StatsResponse(
            total_issues=total_issues,
            resolved_today=resolved_today,
            pending=pending,
            in_progress=in_progress,
            resolved_this_week=resolved_this_week,
            avg_resolution_time_hours=round(avg_resolution_time_hours, 2),
            top_category=top_category,
        )
    
    def get_heatmap_data(self, status: Optional[str] = None, category: Optional[str] = None, department: Optional[str] = None):
        """Get issue coordinates for heatmap visualization"""
        query = self.db.query(Issue)
        
        # Apply filters
        if department:
            query = query.filter(Issue.assigned_department == department)
        if status:
            query = query.filter(Issue.status == status)
        if category:
            query = query.filter(Issue.category == category)
        
        issues = query.all()
        
        # Group by location and count
        location_counts = {}
        for issue in issues:
            key = (round(issue.lat, 4), round(issue.lng, 4))
            if key not in location_counts:
                location_counts[key] = {
                    "count": 0,
                    "category": issue.category,
                    "status": issue.status
                }
            location_counts[key]["count"] += 1
        
        # Convert to heatmap points
        heatmap_points = []
        for (lat, lng), data in location_counts.items():
            heatmap_points.append(HeatmapPoint(
                lat=lat,
                lng=lng,
                count=data["count"],
                category=data["category"],
                status=data["status"]
            ))
        
        return heatmap_points
