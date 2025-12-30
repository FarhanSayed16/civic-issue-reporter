from fastapi import APIRouter, Depends, Query, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import json

from app.schemas.ai import (
    ImageDetectRequest,
    ImageDetectResponse,
    Detection,
    TextAnalyzeRequest,
    TextAnalyzeResponse,
    SeverityRequest,
    SeverityResponse,
    DuplicateCheckRequest,
    DuplicateCheckResponse,
    SentimentRequest,
    SentimentResponse,
)
from app.services.ai_service import AIService
from app.services.issue_service import IssueService
from app.core.db import get_db
from app.core.rate_limiter import limiter


router = APIRouter()
ai = AIService()

# Demo mode check
DEMO_MODE = os.getenv('DEMO_MODE', 'false').lower() == 'true'

def load_mock_ai_detection():
    """Load mock AI detection data"""
    try:
        mock_path = os.path.join(os.path.dirname(__file__), '..', '..', 'mock_data', 'ai_detections.json')
        if os.path.exists(mock_path):
            with open(mock_path, 'r') as f:
                data = json.load(f)
                # Return first detection as example
                if data.get('detections'):
                    det = data['detections'][0]
                    return [type('_D', (), {
                        'label': det['label'],
                        'confidence': det['confidence'],
                        'bbox': None
                    })()]
        # Fallback mock data
        return [type('_D', (), {'label': 'garbage', 'confidence': 0.95, 'bbox': None})()]
    except Exception:
        return [type('_D', (), {'label': 'garbage', 'confidence': 0.95, 'bbox': None})()]

def load_mock_text_analysis():
    """Load mock text analysis data"""
    try:
        mock_path = os.path.join(os.path.dirname(__file__), '..', '..', 'mock_data', 'text_analysis.json')
        if os.path.exists(mock_path):
            with open(mock_path, 'r') as f:
                return json.load(f)
        # Fallback mock data
        return {'keywords': ['waste', 'pollution', 'garbage']}
    except Exception:
        return {'keywords': ['waste', 'pollution', 'garbage']}


@router.post("/detect", response_model=ImageDetectResponse)
@limiter.limit("30/minute")  # Rate limit: 30 AI detections per minute
def detect_image(req: ImageDetectRequest, request: Request):
    # Demo mode: return mock data
    if DEMO_MODE:
        detections = load_mock_ai_detection()
        return ImageDetectResponse(detections=[Detection(label=d.label, confidence=d.confidence, bbox=d.bbox) for d in detections])
    
    src: Optional[str] = None
    temp_path: Optional[str] = None
    # Support data URLs to avoid backend file persistence
    if req.image_data_url and req.image_data_url.startswith("data:"):
        try:
            import base64, re, os, tempfile
            match = re.match(r"^data:(.*?);base64,(.*)$", req.image_data_url)
            if not match:
                raise ValueError("Invalid data URL")
            mime = (match.group(1) or "").lower()
            b64 = match.group(2)
            data = base64.b64decode(b64)
            ext = ".jpg"
            if "png" in mime:
                ext = ".png"
            elif "jpeg" in mime or "jpg" in mime:
                ext = ".jpg"
            elif "webp" in mime:
                ext = ".webp"
            fd, temp_path = tempfile.mkstemp(prefix="upload_", suffix=ext)
            with os.fdopen(fd, "wb") as f:
                f.write(data)
            src = temp_path
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid image data: {e}")
    elif req.image_url:
        src = req.image_url
        # Convert relative path to absolute path if it's a local file
        if not src.startswith(('http://', 'https://', 'file://')):
            import os
            if not os.path.isabs(src):
                # Make it relative to the backend directory
                src = os.path.join(os.getcwd(), src)
    else:
        raise HTTPException(status_code=400, detail="Provide image_url or image_data_url")

    detections = ai.detect_issue_from_image(src)

    # Clean up temporary file if used
    if temp_path:
        try:
            import os
            os.remove(temp_path)
        except Exception:
            pass

    return ImageDetectResponse(detections=[Detection(label=d.label, confidence=d.confidence, bbox=d.bbox) for d in detections])


@router.post("/analyze-text", response_model=TextAnalyzeResponse)
@limiter.limit("30/minute")  # Rate limit: 30 text analyses per minute
def analyze_text(req: TextAnalyzeRequest, request: Request):
    # Demo mode: return mock data
    if DEMO_MODE:
        mock_data = load_mock_text_analysis()
        return TextAnalyzeResponse(keywords=mock_data.get("keywords", []))
    
    data = ai.analyze_text(req.text)
    return TextAnalyzeResponse(keywords=data.get("keywords", []))


@router.post("/severity", response_model=SeverityResponse)
@limiter.limit("30/minute")  # Rate limit: 30 severity estimations per minute
def severity(req: SeverityRequest, request: Request):
    detections = []
    # Reuse detection on data URL if provided
    if req.image_data_url:
        det_resp = detect_image(ImageDetectRequest(image_data_url=req.image_data_url))
        detections = [
            type("_D", (), {"label": d.label, "confidence": d.confidence, "bbox": d.bbox})
            for d in det_resp.detections
        ]
    elif req.image_url:
        detections = ai.detect_issue_from_image(req.image_url)
    out = ai.estimate_severity(detections, req.text or "")
    return SeverityResponse(score=out["score"], level=out["level"])


@router.post("/duplicates", response_model=DuplicateCheckResponse)
def duplicates(req: DuplicateCheckRequest, db: Session = Depends(get_db)):
    issue_service = IssueService(db)
    all_issues = issue_service.get_issues()  # list of dicts
    new_issue = {
        "lat": req.lat,
        "lng": req.lng,
        "description": req.description,
        "category": req.category or "",
    }
    ids = ai.find_duplicates(new_issue, all_issues)
    return DuplicateCheckResponse(duplicate_issue_ids=ids)


@router.post("/sentiment", response_model=SentimentResponse)
def sentiment(req: SentimentRequest):
    res = ai.sentiment(req.text)
    return SentimentResponse(score=res["score"], label=res["label"])



