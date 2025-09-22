import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civic_issues.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "civic-issues")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "")

settings = Settings()
