from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import base64
from app.schemas.auth import Token, LoginRequest, RegisterRequest, EncryptedRequest, EncryptedResponse, LoginWithEncryptedSecret
from app.core.encryption import decrypt_payload
from app.schemas.user import UserOut
from app.services.auth_service import AuthService
from app.core.db import get_db

router = APIRouter()

@router.post("/register", response_model=UserOut)
def register(data: dict, db: Session = Depends(get_db)):
    # Accept packed format like login: { full_name, phone_number, password: base64(nonce||ciphertext), fp_check: base64(nonce||ciphertext) }
    if 'password' in data and 'phone_number' in data and 'full_name' in data:
        # Unpack and decrypt password and fp_check
        import base64
        def unpack_and_decrypt(packed_b64: str):
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
        secret_obj = unpack_and_decrypt(data['password'])
        password = secret_obj.get('secret') or secret_obj.get('password')
        if not password:
            raise HTTPException(status_code=400, detail="Missing password secret")
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
        service = AuthService(db)
        user = service.create_user(data['full_name'], data['phone_number'], password)
        return user
    else:
        # Fallback: previous fully encrypted body
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
def login(data: dict, db: Session = Depends(get_db)):
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
        # Packed base64: password = base64(nonce || ciphertext)
        try:
            packed = data['password']
            # tolerate missing padding
            padding = '=' * ((4 - (len(packed) % 4)) % 4)
            raw = base64.b64decode(packed + padding)
            if len(raw) < 12:
                raise ValueError('Invalid packed length')
            nonce = raw[:12]
            ciphertext = raw[12:]
            # reuse decrypt_payload by re-encoding parts
            from_base = base64.b64encode
            decrypted = decrypt_payload(from_base(nonce).decode('ascii'), from_base(ciphertext).decode('ascii'))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid encrypted password format")
        secret = decrypted.get('secret')
        if not secret:
            raise HTTPException(status_code=400, detail="Missing secret in decrypted payload")
        try:
            print("[login] Decrypted password:", secret)
        except Exception:
            pass
        login_schema = LoginRequest(username=data['phone_number'], password=secret)
    else:
        # Plain JSON fallback
        login_schema = LoginRequest(**data)
    service = AuthService(db)
    tokens = service.authenticate_user(login_schema.username, login_schema.password)
    if not tokens:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return tokens

@router.post("/refresh", response_model=Token)
def refresh(token: dict):
    return {"access_token": "refreshed-access-token", "refresh_token": "refreshed-refresh-token", "token_type": "bearer"}
