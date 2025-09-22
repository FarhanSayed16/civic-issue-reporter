from pydantic import BaseModel
from datetime import datetime

class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    read: bool
    created_at: datetime
