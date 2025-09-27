#!/usr/bin/env python3
"""Test script to verify server functionality"""

import requests
import json

def test_server():
    base_url = "http://localhost:8585"
    
    print("Testing server endpoints...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/docs")
        print(f"✓ Server is running (status: {response.status_code})")
    except Exception as e:
        print(f"✗ Server is not running: {e}")
        return
    
    # Test 2: Test login
    try:
        login_data = {"phone_number": "9876543212", "password": "admin123"}
        response = requests.post(f"{base_url}/auth/login", json=login_data)
        print(f"Login status: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print(f"✓ Login successful, got token: {token[:20]}...")
            
            # Test 3: Test admin issues endpoint
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{base_url}/admin/my-issues", headers=headers)
            print(f"Admin issues status: {response.status_code}")
            if response.status_code == 200:
                issues = response.json()
                print(f"✓ Got {len(issues)} issues")
                if issues:
                    print(f"First issue: {issues[0]}")
            else:
                print(f"✗ Admin issues failed: {response.text}")
                
        else:
            print(f"✗ Login failed: {response.text}")
    except Exception as e:
        print(f"✗ Login test failed: {e}")

if __name__ == "__main__":
    test_server()
