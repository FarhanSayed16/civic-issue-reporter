#!/usr/bin/env python3
"""Script to restart server and test functionality"""

import subprocess
import time
import requests
import sys
import os

def kill_python_processes():
    """Kill all Python processes"""
    try:
        if os.name == 'nt':  # Windows
            subprocess.run(['taskkill', '/f', '/im', 'python.exe'], capture_output=True)
        else:  # Unix/Linux
            subprocess.run(['pkill', '-f', 'python'], capture_output=True)
        print("Killed existing Python processes")
    except Exception as e:
        print(f"Error killing processes: {e}")

def start_server():
    """Start the server"""
    try:
        # Change to the correct directory
        os.chdir(r'D:\civicmain\civicmain\civic_issue_backend')
        
        # Start server
        process = subprocess.Popen([
            'python', '-m', 'uvicorn', 'app.main:app', 
            '--host', '0.0.0.0', '--port', '8585', '--reload'
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        print("Started server process")
        return process
    except Exception as e:
        print(f"Error starting server: {e}")
        return None

def test_server():
    """Test if server is working"""
    max_attempts = 10
    for attempt in range(max_attempts):
        try:
            response = requests.get('http://localhost:8585/docs', timeout=5)
            if response.status_code == 200:
                print("✓ Server is running")
                return True
        except Exception as e:
            print(f"Attempt {attempt + 1}: Server not ready yet...")
            time.sleep(2)
    
    print("✗ Server failed to start")
    return False

def test_login():
    """Test login functionality"""
    try:
        login_data = {'phone_number': '9876543212', 'password': 'admin123'}
        response = requests.post('http://localhost:8585/auth/login-simple', json=login_data, timeout=10)
        print(f"Login test - Status: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get("access_token")
            print(f"✓ Login successful, got token: {token[:20]}...")
            
            # Test admin issues
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get('http://localhost:8585/admin/my-issues', headers=headers, timeout=10)
            print(f"Admin issues - Status: {response.status_code}")
            if response.status_code == 200:
                issues = response.json()
                print(f"✓ Got {len(issues)} issues")
                return True
            else:
                print(f"✗ Admin issues failed: {response.text}")
        else:
            print(f"✗ Login failed: {response.text}")
    except Exception as e:
        print(f"✗ Login test failed: {e}")
    
    return False

def main():
    print("Restarting server and testing...")
    
    # Kill existing processes
    kill_python_processes()
    time.sleep(2)
    
    # Start server
    process = start_server()
    if not process:
        print("Failed to start server")
        return
    
    # Wait for server to start
    if not test_server():
        process.terminate()
        return
    
    # Test login and issues
    if test_login():
        print("✓ All tests passed!")
    else:
        print("✗ Tests failed")
    
    # Keep server running
    print("Server is running. Press Ctrl+C to stop.")
    try:
        process.wait()
    except KeyboardInterrupt:
        process.terminate()
        print("\nServer stopped.")

if __name__ == "__main__":
    main()
