import hcaptcha
from app.core.config import settings

class HCaptchaService:
    def __init__(self):
        self.secret_key = settings.HCAPTCHA_SECRET_KEY
        self.site_key = settings.HCAPTCHA_SITE_KEY
    
    async def verify_token(self, token: str, remote_ip: str = None) -> bool:
        """Verify hCaptcha token"""
        try:
            if not token:
                return False
            
            # For development/testing, accept test tokens
            if self.secret_key == "0x0000000000000000000000000000000000000000":
                return token == "10000000-aaaa-bbbb-cccc-000000000001"
            
            # Verify with hCaptcha API
            result = await hcaptcha.verify(
                self.secret_key,
                token,
                remote_ip=remote_ip
            )
            return result.get("success", False)
        except Exception as e:
            print(f"hCaptcha verification error: {e}")
            return False
    
    def get_site_key(self) -> str:
        """Get hCaptcha site key for frontend"""
        return self.site_key
