from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    full_name: str
    phone_number: str
    password: str
    role: str = "citizen"
    department: Optional[str] = None


class EncryptedRequest(BaseModel):
    nonce: str
    ciphertext: str


class EncryptedResponse(BaseModel):
    nonce: str
    ciphertext: str


class LoginWithEncryptedSecret(BaseModel):
    phone_number: str
    nonce: str
    ciphertext: str
