from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List, Optional, Dict, Any

import math

try:
    # Optional import; handled gracefully if not available
    from ultralytics import YOLO  # type: ignore
except Exception:  # pragma: no cover
    YOLO = None  # type: ignore


@dataclass
class DetectionResult:
    label: str
    confidence: float
    bbox: Optional[List[float]] = None  # [x1, y1, x2, y2] if available


class AIService:
    """AI utilities: image detection (YOLO), text tagging, severity, duplicates, sentiment, prediction."""

    def __init__(self):
        # Resolve model path: env first, then common local fallback
        env_path = os.getenv("YOLO_MODEL_PATH")
        default_path = "app/models/yolo/best.pt"
        fallback_local_path = os.path.join("app", "models", "yolo", "best.pt")
        self.model_path = default_path
        allowed = os.getenv("YOLO_ALLOWED_LABELS", "*")
        self.allowed_labels = None if allowed.strip() == "*" else set(allowed.split(","))

        self._yolo = None
        if YOLO is not None and os.path.exists(self.model_path):
            try:
                self._yolo = YOLO(self.model_path)
            except Exception:
                self._yolo = None

    # -----------------------
    # Image Recognition (YOLO)
    # -----------------------
    def detect_issue_from_image(self, image_path_or_url: str) -> List[DetectionResult]:
        """Run YOLO inference to detect civic issue classes and return labels with confidences.

        Accepts local paths or URLs supported by the YOLO loader.
        """
        if self._yolo is None:
            # Model not available; return empty list
            return []

        try:
            # Use lower confidence threshold to catch more detections
            results = self._yolo(image_path_or_url, conf=0.1)
        except Exception:
            return []

        detections: List[DetectionResult] = []
        try:
            # ultralytics Results list
            for result in results:  # type: ignore
                names = result.names  # index->label mapping
                boxes = result.boxes  # boxes with .cls and .conf
                if boxes is None:
                    continue
                for b in boxes:
                    cls_idx = int(b.cls)
                    label = names.get(cls_idx, str(cls_idx)) if isinstance(names, dict) else str(cls_idx)
                    conf = float(b.conf)
                    if self.allowed_labels is not None and label.lower() not in self.allowed_labels:
                        continue
                    xyxy = b.xyxy[0].tolist() if hasattr(b, "xyxy") else None
                    detections.append(DetectionResult(label=label, confidence=conf, bbox=xyxy))
        except Exception:
            # If schema changes, fail safe
            return []

        # sort high to low confidence
        detections.sort(key=lambda d: d.confidence, reverse=True)
        return detections

    # -----------------------
    # NLP: simple keyword-based fallback (can be replaced with real models)
    # -----------------------
    def analyze_text(self, text: str) -> Dict[str, Any]:
        text_l = (text or "").lower()
        keywords = {
            "pothole": ["pothole", "hole", "road broken", "road damage"],
            "manhole": ["manhole"],
            "streetlight": ["streetlight", "light", "lamp"],
            "garbage": ["garbage", "trash", "dump", "waste"],
            "waterlogging": ["waterlogging", "flood", "water log", "sewage"],
            "traffic": ["traffic", "jam", "congestion"],
        }
        matched: List[str] = []
        for label, terms in keywords.items():
            if any(term in text_l for term in terms):
                matched.append(label)
        return {"keywords": matched}

    # -----------------------
    # Severity estimation (heuristic combining detections and text cues)
    # -----------------------
    def estimate_severity(self, detections: List[DetectionResult], text: str) -> Dict[str, Any]:
        base = 0.2
        if detections:
            base = max(base, min(1.0, detections[0].confidence))
            label = detections[0].label.lower()
            if label in {"pothole", "manhole"}:
                base = min(1.0, base + 0.3)
            if label in {"waterlogging"}:
                base = min(1.0, base + 0.2)
        text_l = (text or "").lower()
        if any(k in text_l for k in ["busy road", "highway", "school", "hospital"]):
            base = min(1.0, base + 0.2)
        if any(k in text_l for k in ["huge", "massive", "very large", "danger"]):
            base = min(1.0, base + 0.2)
        level = "low"
        if base >= 0.75:
            level = "high"
        elif base >= 0.45:
            level = "medium"
        return {"score": round(base, 2), "level": level}

    # -----------------------
    # Duplicate detection (location and label proximity heuristic)
    # -----------------------
    @staticmethod
    def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        r = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return r * c

    def find_duplicates(self, new_issue: Dict[str, Any], existing_issues: List[Dict[str, Any]], radius_km: float = 0.2) -> List[int]:
        duplicates: List[int] = []
        for issue in existing_issues:
            dist = self._haversine_km(new_issue.get("lat"), new_issue.get("lng"), issue.get("lat"), issue.get("lng"))
            if dist <= radius_km:
                # Simple label/description similarity
                same_cat = (new_issue.get("category") or "").lower() == (issue.get("category") or "").lower()
                desc_sim = self._jaccard_similarity(new_issue.get("description", ""), issue.get("description", ""))
                if same_cat or desc_sim >= 0.3:
                    duplicates.append(issue.get("id"))
        return duplicates

    @staticmethod
    def _jaccard_similarity(a: str, b: str) -> float:
        set_a = set(w for w in a.lower().split() if w)
        set_b = set(w for w in b.lower().split() if w)
        if not set_a or not set_b:
            return 0.0
        return len(set_a & set_b) / len(set_a | set_b)

    # -----------------------
    # Sentiment (simple heuristic)
    # -----------------------
    def sentiment(self, text: str) -> Dict[str, Any]:
        text_l = (text or "").lower()
        pos = ["good", "thanks", "appreciate", "great"]
        neg = ["bad", "worst", "angry", "frustrated", "urgent", "terrible"]
        score = 0
        score += sum(1 for p in pos if p in text_l)
        score -= sum(1 for n in neg if n in text_l)
        label = "neutral"
        if score >= 1:
            label = "positive"
        elif score <= -1:
            label = "negative"
        return {"score": score, "label": label}

