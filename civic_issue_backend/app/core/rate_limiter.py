"""
Rate limiting middleware for FastAPI
Uses slowapi for in-memory rate limiting (simple and effective for demo)
"""
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse

# Create limiter instance
limiter = Limiter(key_func=get_remote_address)

# Custom rate limit exceeded handler
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded errors"""
    response = JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": f"Rate limit exceeded: {exc.detail}",
            "retry_after": getattr(exc, 'retry_after', None)
        }
    )
    # Try to inject rate limit headers if available
    try:
        if hasattr(request.state, 'view_rate_limit') and hasattr(request.app.state.limiter, '_inject_headers'):
            response = request.app.state.limiter._inject_headers(
                response, request.state.view_rate_limit
            )
    except Exception:
        # If header injection fails, just return the response without headers
        pass
    return response

# Rate limit configurations
# Format: "count/period" where period can be: second, minute, hour, day
RATE_LIMITS = {
    "default": "100/minute",  # Default: 100 requests per minute
    "auth": "10/minute",  # Auth endpoints: 10 requests per minute (prevent brute force)
    "issue_creation": "20/minute",  # Issue creation: 20 per minute
    "ai_endpoints": "30/minute",  # AI endpoints: 30 per minute (heavier operations)
    "analytics": "60/minute",  # Analytics: 60 per minute
}

def get_rate_limit_for_endpoint(endpoint: str) -> str:
    """Determine rate limit based on endpoint path"""
    if "/auth/" in endpoint or "/login" in endpoint or "/signup" in endpoint:
        return RATE_LIMITS["auth"]
    elif "/issues" in endpoint and "POST" in endpoint:
        return RATE_LIMITS["issue_creation"]
    elif "/ai/" in endpoint:
        return RATE_LIMITS["ai_endpoints"]
    elif "/analytics/" in endpoint:
        return RATE_LIMITS["analytics"]
    else:
        return RATE_LIMITS["default"]

