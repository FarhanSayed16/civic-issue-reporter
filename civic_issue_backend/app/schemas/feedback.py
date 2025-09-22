from pydantic import BaseModel

class FeedbackCreate(BaseModel):
    issue_id: int
    rating: int
    comments: str
