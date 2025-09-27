#!/usr/bin/env python3
"""
Test script to verify encryption/decryption compatibility between mobile and backend
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.encryption import encrypt_payload, decrypt_payload
from app.core.key_manager import get_encryption_key, get_aad_string
import base64

def test_encryption():
    print("=== Backend Encryption Test ===")
    
    # Test data
    test_data = {"secret": "testpassword123"}
    print(f"Original data: {test_data}")
    
    try:
        # Encrypt
        encrypted = encrypt_payload(test_data)
        print(f"Encrypted nonce: {encrypted['nonce']}")
        print(f"Encrypted ciphertext: {encrypted['ciphertext']}")
        
        # Pack (like mobile app does)
        nonce_bytes = base64.b64decode(encrypted['nonce'])
        ciphertext_bytes = base64.b64decode(encrypted['ciphertext'])
        packed_bytes = nonce_bytes + ciphertext_bytes
        packed_b64 = base64.b64encode(packed_bytes).decode()
        print(f"Packed password: {packed_b64}")
        
        # Unpack (like backend does)
        padding = '=' * ((4 - (len(packed_b64) % 4)) % 4)
        raw = base64.b64decode(packed_b64 + padding)
        nonce_b64 = base64.b64encode(raw[:12]).decode('ascii')
        ciphertext_b64 = base64.b64encode(raw[12:]).decode('ascii')
        print(f"Unpacked nonce: {nonce_b64}")
        print(f"Unpacked ciphertext: {ciphertext_b64}")
        
        # Decrypt
        decrypted = decrypt_payload(nonce_b64, ciphertext_b64)
        print(f"Decrypted data: {decrypted}")
        
        # Verify
        if decrypted.get('secret') == test_data['secret']:
            print("✅ Backend encryption/decryption test PASSED")
        else:
            print("❌ Backend encryption/decryption test FAILED")
            print(f"Expected: {test_data['secret']}")
            print(f"Got: {decrypted.get('secret')}")
            
    except Exception as e:
        print(f"❌ Backend encryption test failed with error: {e}")

def test_key_generation():
    print("\n=== Key Generation Test ===")
    
    try:
        encryption_key = get_encryption_key()
        aad_string = get_aad_string()
        
        print(f"Encryption key length: {len(encryption_key)}")
        print(f"Encryption key (first 20 chars): {encryption_key[:20]}...")
        print(f"AAD string length: {len(aad_string)}")
        print(f"AAD string (first 20 chars): {aad_string[:20]}...")
        
        # Check if key is 32 bytes when base64 decoded
        try:
            key_bytes = base64.b64decode(encryption_key)
            print(f"Key bytes length: {len(key_bytes)}")
            if len(key_bytes) == 32:
                print("✅ Key is 32 bytes")
            else:
                print(f"❌ Key is {len(key_bytes)} bytes, expected 32")
        except Exception as e:
            print(f"❌ Failed to decode key: {e}")
            
    except Exception as e:
        print(f"❌ Key generation test failed: {e}")

if __name__ == "__main__":
    test_key_generation()
    test_encryption()
