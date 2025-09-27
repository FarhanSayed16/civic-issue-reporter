import re
from textblob import TextBlob
from typing import Dict, List

class NLPService:
    def __init__(self):
        # High priority keywords
        self.high_priority_keywords = [
            'urgent', 'emergency', 'dangerous', 'danger', 'critical', 'severe', 'serious',
            'accident', 'injury', 'hurt', 'harm', 'unsafe', 'hazard', 'risk', 'threat',
            'blocking', 'blocked', 'stuck', 'trapped', 'flooding', 'flood', 'overflow',
            'broken', 'damaged', 'collapsed', 'falling', 'leaking', 'explosion', 'fire',
            'immediate', 'asap', 'now', 'quickly', 'fast', 'rush', 'priority'
        ]
        
        # Medium priority keywords
        self.medium_priority_keywords = [
            'problem', 'issue', 'concern', 'trouble', 'difficulty', 'inconvenience',
            'annoying', 'bothersome', 'uncomfortable', 'inconvenient', 'slow',
            'delayed', 'late', 'waiting', 'queue', 'crowded', 'busy', 'noisy',
            'dirty', 'messy', 'unclean', 'smelly', 'loud', 'bright', 'dark'
        ]
        
        # Low priority keywords
        self.low_priority_keywords = [
            'minor', 'small', 'little', 'slight', 'suggestion', 'improvement',
            'enhancement', 'better', 'nice', 'good', 'fine', 'okay', 'acceptable',
            'maintenance', 'routine', 'regular', 'normal', 'expected', 'planned'
        ]

    def detect_priority(self, description: str) -> str:
        """Detect priority level based on description text"""
        if not description:
            return "medium"
        
        # Convert to lowercase for analysis
        text = description.lower()
        
        # Count keyword occurrences
        high_count = self._count_keywords(text, self.high_priority_keywords)
        medium_count = self._count_keywords(text, self.medium_priority_keywords)
        low_count = self._count_keywords(text, self.low_priority_keywords)
        
        # Analyze sentiment
        sentiment_score = self._analyze_sentiment(text)
        
        # Analyze urgency indicators
        urgency_score = self._analyze_urgency(text)
        
        # Calculate priority score
        priority_score = self._calculate_priority_score(
            high_count, medium_count, low_count, sentiment_score, urgency_score
        )
        
        # Determine priority level
        if priority_score >= 0.7:
            return "high"
        elif priority_score >= 0.3:
            return "medium"
        else:
            return "low"
    
    def _count_keywords(self, text: str, keywords: List[str]) -> int:
        """Count occurrences of keywords in text"""
        count = 0
        for keyword in keywords:
            count += len(re.findall(r'\b' + re.escape(keyword) + r'\b', text))
        return count
    
    def _analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment of the text"""
        try:
            blob = TextBlob(text)
            # Sentiment polarity ranges from -1 (negative) to 1 (positive)
            # For priority detection, negative sentiment indicates higher priority
            return abs(blob.sentiment.polarity) if blob.sentiment.polarity < 0 else 0
        except:
            return 0
    
    def _analyze_urgency(self, text: str) -> float:
        """Analyze urgency indicators in text"""
        urgency_patterns = [
            r'\b(urgent|emergency|asap|immediately|now|quickly|fast)\b',
            r'\b\d+\s*(hours?|days?|minutes?)\b',  # Time references
            r'\b(blocking|stuck|trapped|flooding)\b',  # Blocking situations
            r'\b(accident|injury|danger|harm)\b',  # Safety issues
            r'!{2,}',  # Multiple exclamation marks
            r'\b(very|extremely|highly|severely)\b'  # Intensifiers
        ]
        
        urgency_score = 0
        for pattern in urgency_patterns:
            matches = re.findall(pattern, text)
            urgency_score += len(matches) * 0.1
        
        return min(urgency_score, 1.0)  # Cap at 1.0
    
    def _calculate_priority_score(self, high_count: int, medium_count: int, 
                                low_count: int, sentiment_score: float, 
                                urgency_score: float) -> float:
        """Calculate overall priority score"""
        # Weight the keyword counts
        keyword_score = (high_count * 0.4 + medium_count * 0.2 - low_count * 0.1)
        
        # Normalize keyword score
        keyword_score = min(keyword_score / 5.0, 1.0)  # Cap at 1.0
        
        # Combine with sentiment and urgency
        total_score = (keyword_score * 0.5 + sentiment_score * 0.3 + urgency_score * 0.2)
        
        return min(total_score, 1.0)  # Cap at 1.0
    
    def get_severity_score(self, description: str) -> float:
        """Get severity score (0-1) based on description text"""
        if not description:
            return 0.5  # Default medium severity
        
        text = description.lower()
        
        # Count keyword occurrences
        high_count = self._count_keywords(text, self.high_priority_keywords)
        medium_count = self._count_keywords(text, self.medium_priority_keywords)
        low_count = self._count_keywords(text, self.low_priority_keywords)
        
        # Analyze sentiment
        sentiment_score = self._analyze_sentiment(text)
        
        # Analyze urgency indicators
        urgency_score = self._analyze_urgency(text)
        
        # Calculate severity score (same logic as priority but return the raw score)
        keyword_score = (high_count * 0.4 + medium_count * 0.2 - low_count * 0.1)
        keyword_score = min(keyword_score / 5.0, 1.0)  # Cap at 1.0
        
        total_score = (keyword_score * 0.5 + sentiment_score * 0.3 + urgency_score * 0.2)
        
        return min(total_score, 1.0)  # Cap at 1.0

    def get_priority_explanation(self, description: str) -> Dict[str, any]:
        """Get detailed explanation of priority detection"""
        text = description.lower()
        
        detected_keywords = {
            'high': [kw for kw in self.high_priority_keywords if kw in text],
            'medium': [kw for kw in self.medium_priority_keywords if kw in text],
            'low': [kw for kw in self.low_priority_keywords if kw in text]
        }
        
        sentiment_score = self._analyze_sentiment(text)
        urgency_score = self._analyze_urgency(text)
        priority = self.detect_priority(description)
        severity_score = self.get_severity_score(description)
        
        return {
            'priority': priority,
            'severity_score': severity_score,
            'detected_keywords': detected_keywords,
            'sentiment_score': sentiment_score,
            'urgency_score': urgency_score,
            'explanation': f"Priority '{priority}' detected based on keywords, sentiment, and urgency indicators"
        }
