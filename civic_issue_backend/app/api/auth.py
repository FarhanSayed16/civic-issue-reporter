from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import base64
from app.schemas.auth import Token, LoginRequest, RegisterRequest, EncryptedRequest, EncryptedResponse, LoginWithEncryptedSecret
from app.core.encryption import decrypt_payload
from app.schemas.user import UserOut
from app.services.auth_service import AuthService
from app.services.hcaptcha_service import HCaptchaService
from app.core.db import get_db

router = APIRouter()

@router.post("/register", response_model=UserOut)
async def register(data: dict, request: Request, db: Session = Depends(get_db)):
    # Accept packed format like login: { full_name, phone_number, password: base64(nonce||ciphertext), fp_check: base64(nonce||ciphertext) }
    if 'password' in data and 'phone_number' in data and 'full_name' in data:
        # Check if password and phone_number are encrypted (packed format) or plain text
        password_value = data['password']
        phone_value = data['phone_number']
        
        # Helper function to unpack and decrypt
        def unpack_and_decrypt(packed_b64: str):
            import base64
            padding = '=' * ((4 - (len(packed_b64) % 4)) % 4)
            raw = base64.b64decode(packed_b64 + padding)
            if len(raw) < 12:
                raise HTTPException(status_code=400, detail="Invalid packed data")
            nonce = base64.b64encode(raw[:12]).decode('ascii')
            ciphertext = base64.b64encode(raw[12:]).decode('ascii')
            try:
                return decrypt_payload(nonce, ciphertext)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid encrypted payload")
        
        # Try to detect if password is encrypted (base64 packed format)
        try:
            # If it's base64 and longer than typical plain text, assume it's encrypted
            if len(password_value) > 20 and password_value.replace('+', '').replace('/', '').replace('=', '').isalnum():
                secret_obj = unpack_and_decrypt(password_value)
                password = secret_obj.get('secret') or secret_obj.get('password')
                if not password:
                    raise HTTPException(status_code=400, detail="Missing password secret")
            else:
                # Plain text password
                password = password_value
        except Exception:
            # If unpacking fails, treat as plain text
            password = password_value
            
        # Try to detect if phone_number is encrypted
        try:
            if len(phone_value) > 20 and phone_value.replace('+', '').replace('/', '').replace('=', '').isalnum():
                phone_obj = unpack_and_decrypt(phone_value)
                phone_number = phone_obj.get('secret') or phone_obj.get('phone_number')
                if not phone_number:
                    raise HTTPException(status_code=400, detail="Missing phone number")
            else:
                # Plain text phone number
                phone_number = phone_value
        except Exception:
            # If unpacking fails, treat as plain text
            phone_number = phone_value
        try:
            print("[register] Decrypted password:", password)
        except Exception:
            pass
        fp_plain = None
        if 'fp_check' in data and data['fp_check']:
            try:
                fp_obj = unpack_and_decrypt(data['fp_check'])
                # Print/log decrypted fp_check text
                fp_plain = str(fp_obj)
                print("[register] Decrypted fp_check:", fp_plain)
            except Exception:
                pass
        # Verify hCaptcha - TEMPORARILY DISABLED
        # hcaptcha_token = data.get('hcaptcha_token')
        # if not hcaptcha_token:
        #     raise HTTPException(status_code=400, detail="hCaptcha token is required")
        
        # hcaptcha_service = HCaptchaService()
        # client_ip = request.client.host if request.client else None
        # is_valid = await hcaptcha_service.verify_token(hcaptcha_token, client_ip)
        
        # if not is_valid:
        #     raise HTTPException(status_code=400, detail="hCaptcha verification failed")
        
        service = AuthService(db)
        role = data.get('role', 'citizen')
        department = data.get('department')
        user = service.create_user(data['full_name'], phone_number, password, role, department)
        return user
    else:
        # Fallback: plain data or fully encrypted body
        try:
            # Try plain data first
            register_schema = RegisterRequest(**data)
            service = AuthService(db)
            role = data.get('role', 'citizen')
            department = data.get('department')
            user = service.create_user(register_schema.full_name, register_schema.phone_number, register_schema.password, role, department)
            return user
        except Exception:
            # Fallback to encrypted data
            try:
                register_req = EncryptedRequest(**data)
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid request body")
            try:
                decrypted = decrypt_payload(register_req.nonce, register_req.ciphertext)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid encrypted payload")
            register_schema = RegisterRequest(**decrypted)
            service = AuthService(db)
            user = service.create_user(register_schema.full_name, register_schema.phone_number, register_schema.password)
            return user

@router.post("/login", response_model=Token)
async def login(data: dict, request: Request, db: Session = Depends(get_db)):
    # Support three forms:
    # 1) Fully encrypted: {nonce,ciphertext} -> {username/password} or {phone_number/secret}
    # 2) Mixed: {phone_number, nonce, ciphertext} -> ciphertext decrypts to {secret}
    # 3) Plain (fallback): {username,password}
    if 'nonce' in data and 'ciphertext' in data and 'phone_number' not in data:
        try:
            decrypted = decrypt_payload(data['nonce'], data['ciphertext'])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid encrypted payload")
        if 'phone_number' in decrypted and 'secret' in decrypted:
            try:
                print("[login] Decrypted password:", decrypted['secret'])
            except Exception:
                pass
            login_schema = LoginRequest(username=decrypted['phone_number'], password=decrypted['secret'])
        else:
            login_schema = LoginRequest(**decrypted)
    elif 'phone_number' in data and 'nonce' in data and 'ciphertext' in data:
        try:
            decrypted = decrypt_payload(data['nonce'], data['ciphertext'])
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid encrypted payload")
        secret = decrypted.get('secret')
        if not secret:
            raise HTTPException(status_code=400, detail="Missing secret in decrypted payload")
        try:
            print("[login] Decrypted password:", secret)
        except Exception:
            pass
        login_schema = LoginRequest(username=data['phone_number'], password=secret)
    elif 'phone_number' in data and 'password' in data:
        # Check if password is encrypted (packed base64) or plain text
        password_value = data['password']
        phone_value = data['phone_number']
        
        # Try to detect if password is encrypted
        try:
            if len(password_value) > 20 and password_value.replace('+', '').replace('/', '').replace('=', '').isalnum():
                # Password appears to be encrypted (packed base64)
                packed_password = password_value
                padding = '=' * ((4 - (len(packed_password) % 4)) % 4)
                raw = base64.b64decode(packed_password + padding)
                if len(raw) < 12:
                    raise ValueError('Invalid packed password length')
                nonce = raw[:12]
                ciphertext = raw[12:]
                from_base = base64.b64encode
                decrypted_password = decrypt_payload(from_base(nonce).decode('ascii'), from_base(ciphertext).decode('ascii'))
                secret = decrypted_password.get('secret')
                if not secret:
                    raise ValueError('Missing secret in decrypted payload')
                password = secret
            else:
                # Password is plain text
                password = password_value
        except Exception:
            # If decryption fails, treat as plain text
            password = password_value
        
        # Check if phone_number is also encrypted
        try:
            if len(phone_value) > 20 and phone_value.replace('+', '').replace('/', '').replace('=', '').isalnum():
                # Phone number is encrypted
                packed_phone = phone_value
                padding = '=' * ((4 - (len(packed_phone) % 4)) % 4)
                raw = base64.b64decode(packed_phone + padding)
                if len(raw) < 12:
                    raise ValueError('Invalid packed phone length')
                nonce = raw[:12]
                ciphertext = raw[12:]
                from_base = base64.b64encode
                decrypted_phone = decrypt_payload(from_base(nonce).decode('ascii'), from_base(ciphertext).decode('ascii'))
                phone_number = decrypted_phone.get('secret') or decrypted_phone.get('phone_number')
                if not phone_number:
                    raise ValueError('Missing phone number in decrypted payload')
            else:
                # Phone number is plain text
                phone_number = phone_value
        except Exception:
            # If phone decryption fails, treat as plain text
            phone_number = phone_value
            
        try:
            print("[login] Password:", password)
            print("[login] Phone number:", phone_number)
        except Exception:
            pass
        login_schema = LoginRequest(username=phone_number, password=password)
    else:
        # Plain JSON fallback - handle both phone_number and username formats
        if 'phone_number' in data and 'password' in data:
            # Convert phone_number to username format
            login_schema = LoginRequest(username=data['phone_number'], password=data['password'])
        else:
            # Standard username/password format
            login_schema = LoginRequest(**data)
    
    # Verify hCaptcha - TEMPORARILY DISABLED
    # hcaptcha_token = data.get('hcaptcha_token')
    # if not hcaptcha_token:
    #     raise HTTPException(status_code=400, detail="hCaptcha token is required")
    
    # hcaptcha_service = HCaptchaService()
    # client_ip = request.client.host if request.client else None
    # is_valid = await hcaptcha_service.verify_token(hcaptcha_token, client_ip)
    
    # if not is_valid:
    #     raise HTTPException(status_code=400, detail="hCaptcha verification failed")
    
    service = AuthService(db)
    tokens = service.authenticate_user(login_schema.username, login_schema.password)
    if not tokens:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return tokens

@router.post("/login-plain", response_model=Token)
async def login_plain(data: dict, db: Session = Depends(get_db)):
    """Simple plain text login for testing"""
    try:
        login_schema = LoginRequest(**data)
        service = AuthService(db)
        tokens = service.authenticate_user(login_schema.username, login_schema.password)
        if not tokens:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return tokens
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login error: {str(e)}")

@router.post("/refresh", response_model=Token)
def refresh(token: dict):
    return {"access_token": "refreshed-access-token", "refresh_token": "refreshed-refresh-token", "token_type": "bearer"}

@router.get("/hcaptcha/site-key")
def get_hcaptcha_site_key():
    """Get hCaptcha site key for frontend"""
    hcaptcha_service = HCaptchaService()
    return {"site_key": hcaptcha_service.get_site_key()}
