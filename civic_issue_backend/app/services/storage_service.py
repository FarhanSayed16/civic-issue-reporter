import os
from datetime import datetime, timedelta
from urllib.parse import quote

from app.core.config import settings

try:
    import boto3  # type: ignore
    from botocore.client import Config  # type: ignore
except Exception:
    boto3 = None
    Config = None


class StorageService:
    def __init__(self):
        self.bucket = os.getenv("S3_BUCKET", settings.S3_BUCKET if hasattr(settings, 'S3_BUCKET') else "civic-issues")
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL", "")  # e.g., http://localhost:9000 for MinIO
        self.region_name = os.getenv("S3_REGION", "us-east-1")
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID", "")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        self.provider = os.getenv("STORAGE_PROVIDER", "local").lower()  # local|minio|s3

    def generate_presigned_upload(self, filename: str):
        expiry = 300

        if self.provider in ("minio", "s3") and boto3 is not None and self.access_key and self.secret_key:
            try:
                s3 = boto3.client(
                    "s3",
                    endpoint_url=self.endpoint_url or None,
                    region_name=self.region_name,
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    config=Config(signature_version="s3v4") if Config else None,
                )
                key = f"uploads/{filename}"
                upload_url = s3.generate_presigned_url(
                    ClientMethod="put_object",
                    Params={"Bucket": self.bucket, "Key": key, "ContentType": "application/octet-stream"},
                    ExpiresIn=expiry,
                )
                public_url = self._build_public_url(key)
                now = datetime.utcnow()
                return {
                    "url": upload_url,
                    "expires_in": expiry,
                    "generated_at": now,
                    "expires_at": now + timedelta(seconds=expiry),
                    "public_url": public_url,
                }
            except Exception:
                # fall back to local
                pass

        # Local fallback: PUT to backend endpoint, which saves file under static/uploads
        safe_name = quote(filename)
        upload_url = f"/issues/upload/{safe_name}"
        public_url = f"/static/uploads/{safe_name}"
        now = datetime.utcnow()
        return {
            "url": upload_url,
            "expires_in": expiry,
            "generated_at": now,
            "expires_at": now + timedelta(seconds=expiry),
            "public_url": public_url,
        }

    def _build_public_url(self, key: str) -> str:
        if self.endpoint_url:
            base = self.endpoint_url.rstrip('/')
            return f"{base}/{self.bucket}/{key}"
        # AWS S3 style
        return f"https://{self.bucket}.s3.{self.region_name}.amazonaws.com/{key}"
