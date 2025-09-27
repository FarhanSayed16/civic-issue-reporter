import os
import json
import base64
import secrets
from typing import Any, Dict

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from hashlib import sha256

from app.core.config import settings
from app.core.key_manager import get_aad_string


def _get_aad_value() -> bytes:
    """Get the obfuscated AAD string"""
    try:
        aad_string = get_aad_string()
        return aad_string.encode('utf-8')
    except Exception:
        # Fallback to secure default
        return b"zz1UyP7wdPOqiAg1m4XB5w=="


AAD_VALUE: bytes = _get_aad_value()


def _get_aesgcm_key() -> bytes:
    """
    Returns a 32-byte key for AES-256-GCM. If ENCRYPTION_KEY is provided in settings,
    it may be a raw 32-byte value (base64 or hex). Otherwise derive from SECRET_KEY via SHA-256.
    """
    key_source = getattr(settings, "ENCRYPTION_KEY", None)
    if key_source:
        # Try base64 then hex, otherwise use raw bytes of the string (padded/hashed)
        try:
            key = base64.b64decode(key_source)
            if len(key) == 32:
                return key
        except Exception:
            pass
        try:
            key = bytes.fromhex(key_source)
            if len(key) == 32:
                return key
        except Exception:
            pass
        # Fallback: hash provided value to 32 bytes
        return sha256(key_source.encode("utf-8")).digest()
    # Derive from SECRET_KEY
    return sha256(settings.SECRET_KEY.encode("utf-8")).digest()


def encrypt_payload(payload: Dict[str, Any]) -> Dict[str, str]:
    """
    Encrypts a JSON-serializable dict and returns base64 strings for nonce and ciphertext.
    The ciphertext includes the GCM authentication tag (cryptography AESGCM behavior).
    """
    key = _get_aesgcm_key()
    aesgcm = AESGCM(key)
    nonce = secrets.token_bytes(12)
    plaintext = json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    ciphertext = aesgcm.encrypt(nonce, plaintext, AAD_VALUE)
    return {
        "nonce": base64.b64encode(nonce).decode("ascii"),
        "ciphertext": base64.b64encode(ciphertext).decode("ascii"),
    }


def decrypt_payload(nonce_b64: str, ciphertext_b64: str) -> Dict[str, Any]:
    """
    Decrypts base64-encoded nonce and ciphertext (with GCM tag) and returns the dict payload.
    Raises ValueError on failure.
    """
    key = _get_aesgcm_key()
    aesgcm = AESGCM(key)
    def _pad_b64(value: str) -> bytes:
        padding = '=' * ((4 - (len(value) % 4)) % 4)
        return base64.b64decode(value + padding)
    try:
        nonce = _pad_b64(nonce_b64)
        ciphertext = _pad_b64(ciphertext_b64)
        plaintext = aesgcm.decrypt(nonce, ciphertext, AAD_VALUE)
        return json.loads(plaintext.decode("utf-8"))
    except Exception as exc:
        raise ValueError("Decryption failed") from exc


def get_key_b64() -> str:
    """Returns the active 32-byte AES-GCM key in base64 (for client use)."""
    return base64.b64encode(_get_aesgcm_key()).decode("ascii")


