#!/usr/bin/env python3
"""
Startup script for the Civic Issue Management System
"""
import sys
import os
import subprocess

def main():
    print("🚀 Starting Civic Issue Management System...")
    
    # Check if we're in the right directory
    if not os.path.exists("app/main.py"):
        print("❌ Please run this script from the civic_issue_backend directory")
        sys.exit(1)
    
    # Initialize database
    print("📊 Initializing database...")
    try:
        from init_db import init_database
        init_database()
        print("✅ Database initialized successfully!")
    except Exception as e:
        print(f"⚠️  Database initialization failed: {e}")
        print("Continuing anyway...")
    
    # Start the server
    print("🌐 Starting web server...")
    print("📱 Web Interface: http://localhost:8585/frontend")
    print("📚 API Docs: http://localhost:8585/docs")
    print("❤️  Health Check: http://localhost:8585/")
    print("\n🎯 Demo Credentials:")
    print("   Citizen: Phone: 9876543210 | Password: password123")
    print("   Admin: Phone: 9876543212 | Password: admin123")
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--port", "8585",
            "--host", "0.0.0.0"
        ])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
