class StorageService:
    def generate_presigned_upload(self, filename: str):
        expiry = 300
        url = f"https://minio.local/{filename}?X-Amz-SignedHeaders=placeholder&Expires={expiry}"
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        return {"url": url, "expires_in": expiry, "generated_at": now, "expires_at": now + timedelta(seconds=expiry)}
