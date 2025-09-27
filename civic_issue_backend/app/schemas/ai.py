from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any


class ImageDetectRequest(BaseModel):
    image_url: Optional[str] = None
    image_data_url: Optional[str] = None


class Detection(BaseModel):
    label: str
    confidence: float
    bbox: Optional[List[float]] = None


class ImageDetectResponse(BaseModel):
    detections: List[Detection]


class TextAnalyzeRequest(BaseModel):
    text: str


class TextAnalyzeResponse(BaseModel):
    keywords: List[str]


class SeverityRequest(BaseModel):
    image_url: Optional[str] = None
    image_data_url: Optional[str] = None
    text: Optional[str] = None


class SeverityResponse(BaseModel):
    score: float
    level: str


class DuplicateCheckRequest(BaseModel):
    lat: float
    lng: float
    description: str
    category: Optional[str] = None


class DuplicateCheckResponse(BaseModel):
    duplicate_issue_ids: List[int]


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    score: int
    label: str
