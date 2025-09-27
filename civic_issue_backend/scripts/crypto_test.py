import os
import json
import base64
from hashlib import sha256

from cryptography.hazmat.primitives.ciphers.aead import AESGCM


AAD = b"zz1UyP7wdPOqiAg1m4XB5w=="


def get_key() -> bytes:
    key_b64 = os.getenv("ENCRYPTION_KEY", "").strip()
    if key_b64:
        try:
            key = base64.b64decode(key_b64)
            if len(key) == 32:
                return key
        except Exception:
            try:
                key = bytes.fromhex(key_b64)
                if len(key) == 32:
                    return key
            except Exception:
                pass
        return sha256(key_b64.encode()).digest()
    secret = os.getenv("SECRET_KEY", "supersecret")
    return sha256(secret.encode()).digest()


def encrypt_json(obj: dict) -> tuple[str, str]:
    key = get_key()
    aes = AESGCM(key)
    nonce = os.urandom(12)
    ct = aes.encrypt(nonce, json.dumps(obj, separators=(",", ":")).encode(), AAD)
    return base64.b64encode(nonce).decode(), base64.b64encode(ct).decode()


def decrypt_json(nonce_b64: str, ct_b64: str) -> dict:
    def pad(s: str) -> bytes:
        return base64.b64decode(s + "=" * ((4 - len(s) % 4) % 4))
    key = get_key()
    aes = AESGCM(key)
    pt = aes.decrypt(pad(nonce_b64), pad(ct_b64), AAD)
    return json.loads(pt.decode())


def pack_password_b64(nonce_b64: str, ct_b64: str) -> str:
    nonce = base64.b64decode(nonce_b64)
    ct = base64.b64decode(ct_b64)
    return base64.b64encode(nonce + ct).decode()


def unpack_password_b64(packed_b64: str) -> tuple[str, str]:
    raw = base64.b64decode(packed_b64 + "=" * ((4 - len(packed_b64) % 4) % 4))
    nonce = base64.b64encode(raw[:12]).decode()
    ct = base64.b64encode(raw[12:]).decode()
    return nonce, ct


if __name__ == "__main__":
    # Example usage
    # Add this at the bottom of scripts/crypto_test.py or run in a Python REPL:
    packed = "IPleKoR15AtCAzVOSrudF5npnhKQo9/gXYwRMy5wg0rmwp4ze36GAv/SDkcueTM="
    n, c = unpack_password_b64(packed)
    print("Decrypted:", decrypt_json(n, c))
    # nf, cf = encrypt_json({"fp_check": fp_value})
    # pf = pack_password_b64(nf, cf)
    # print("Packed fp_check:", pf)
    # nfd, cfd = unpack_password_b64(pf)
    # print("Unpacked fp_check json:", decrypt_json(nfd, cfd))


