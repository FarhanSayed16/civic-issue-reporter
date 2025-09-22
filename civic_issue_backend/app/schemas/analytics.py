from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class StatsResponse(BaseModel):
    total_issues: int
    resolved_today: int
    pending: int
    in_progress: int
    resolved_this_week: int
    avg_resolution_time_hours: float
    top_category: str
    top_ward: str

class HeatmapPoint(BaseModel):
    lat: float
    lng: float
    count: int
    category: str
    status: str
