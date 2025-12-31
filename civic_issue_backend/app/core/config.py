import os
from pydantic import BaseSettings

# Optional dotenv import - not required if .env file is not used
try:
    from dotenv import load_dotenv
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    def load_dotenv(path):
        pass  # No-op if dotenv is not installed

# Load environment variables from .env file
# Get the directory where this config.py file is located
config_dir = os.path.dirname(os.path.abspath(__file__))
# Go up two levels to reach the project root (app/core -> app -> project root)
project_root = os.path.dirname(os.path.dirname(config_dir))
env_path = os.path.join(project_root, '.env')

# Load the .env file from the project root (if dotenv is available)
if DOTENV_AVAILABLE:
    load_dotenv(env_path)

def get_obfuscated_encryption_key():
    """Get the obfuscated encryption key"""
    try:
        from .key_manager import get_encryption_key
        return get_encryption_key()
    except Exception:
        # Fallback to environment variable or empty string
        return os.getenv("ENCRYPTION_KEY", "")

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civic_issues.db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    S3_BUCKET: str = os.getenv("S3_BUCKET", "civic-issues")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecret")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ENCRYPTION_KEY: str = ""  # Will be set by property
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "models/yolo/best.pt")
    AI_ENABLE_AUTOTAG: bool = os.getenv("AI_ENABLE_AUTOTAG", "false").lower() == "true"
    
    # ✅ Load from .env, not hardcoded
    HCAPTCHA_SECRET_KEY: str = os.getenv("HCAPTCHA_SECRET_KEY", "")
    HCAPTCHA_SITE_KEY: str = os.getenv("HCAPTCHA_SITE_KEY", "")
    
    # ⚠️ DEMO MODE: Temporary flag to bypass duplicate detection for demo/testing
    # Set DEMO_MODE=false in .env to disable. Currently enabled by default for testing.
    # This allows multiple issue submissions from same location during demo recording.
    # IMPORTANT: Set DEMO_MODE=false in production!
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ENCRYPTION_KEY = get_obfuscated_encryption_key()


settings = Settings()
