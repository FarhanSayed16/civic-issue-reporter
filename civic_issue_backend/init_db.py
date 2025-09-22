#!/usr/bin/env python3
"""
Database initialization script with sample data
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import create_tables, SessionLocal
from app.models.user import User
from app.models.issue import Issue, Upvote
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random
import json

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_database():
    """Initialize database with sample data"""
    print("Creating database tables...")
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        if db.query(User).first():
            print("Database already has data. Skipping initialization.")
            return
        
        print("Adding sample users...")
        # Create sample users
        users = [
            User(
                full_name="John Doe",
                phone_number="9876543210",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=100.0
            ),
            User(
                full_name="Jane Smith",
                phone_number="9876543211",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=95.0
            ),
            User(
                full_name="Admin User",
                phone_number="9876543212",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                trust_score=100.0
            ),
            User(
                full_name="Mike Johnson",
                phone_number="9876543213",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=88.0
            ),
            User(
                full_name="Sarah Wilson",
                phone_number="9876543214",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=92.0
            )
        ]
        
        for user in users:
            db.add(user)
        db.commit()
        
        print("Adding sample issues...")
        # Create sample issues
        categories = ["Pothole", "Streetlight", "Garbage", "Water", "Road", "Other"]
        wards = ["Andheri", "Bandra", "Dadar", "Mumbai Central", "Thane"]
        statuses = ["new", "in_progress", "resolved"]
        
        # Mumbai coordinates (approximate)
        base_lat, base_lng = 19.0760, 72.8777
        
        issues = []
        for i in range(20):
            # Generate random coordinates around Mumbai
            lat = base_lat + random.uniform(-0.1, 0.1)
            lng = base_lng + random.uniform(-0.1, 0.1)
            
            # Random creation date in the last 30 days
            created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
            
            media_urls = [f"https://example.com/photo_{i+1}.jpg"] if random.random() > 0.3 else []
            issue = Issue(
                reporter_id=random.choice([1, 2, 4, 5]),  # Exclude admin user
                category=random.choice(categories),
                description=f"Sample issue description {i+1}. This is a detailed description of the problem that needs to be addressed by the municipal authorities.",
                status=random.choice(statuses),
                lat=lat,
                lng=lng,
                ward=random.choice(wards),
                media_urls=json.dumps(media_urls),
                upvote_count=random.randint(0, 15),
                created_at=created_at,
                updated_at=created_at + timedelta(hours=random.randint(1, 48))
            )
            issues.append(issue)
            db.add(issue)
        
        db.commit()
        
        print("Adding sample upvotes...")
        # Create sample upvotes
        for issue in issues:
            # Random number of upvotes
            num_upvotes = random.randint(0, min(5, issue.upvote_count))
            upvoter_ids = random.sample([1, 2, 4, 5], min(num_upvotes, 4))
            
            for user_id in upvoter_ids:
                upvote = Upvote(
                    user_id=user_id,
                    issue_id=issue.id,
                    created_at=issue.created_at + timedelta(minutes=random.randint(1, 60))
                )
                db.add(upvote)
        
        db.commit()
        
        print("Database initialized successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {len(issues)} issues")
        print(f"Created {db.query(Upvote).count()} upvotes")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

