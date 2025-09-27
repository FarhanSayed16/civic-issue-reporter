#!/usr/bin/env python3
"""
Database initialization script with comprehensive sample data
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
import base64

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Sample profile pictures (base64 encoded small images)
PROFILE_PICTURES = [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
]

# Sample issue images (base64 encoded)
ISSUE_IMAGES = [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
]

def init_database():
    """Initialize database with comprehensive sample data"""
    print("Creating database tables...")
    create_tables()
    
    db = SessionLocal()
    
    try:
        # Check if database already has data
        existing_users = db.query(User).count()
        existing_issues = db.query(Issue).count()
        
        if existing_users > 0 and existing_issues > 0:
            print(f"Database already initialized with {existing_users} users and {existing_issues} issues. Skipping initialization.")
            return
        
        if existing_users > 0 and existing_issues == 0:
            print(f"Database has {existing_users} users but no issues. Adding issues...")
            # Skip user creation, go directly to issues
            users = db.query(User).all()
        else:
            print("Adding sample users...")
            # Create comprehensive user accounts
            users = [
            # Admin accounts
            User(
                full_name="Municipal Commissioner",
                phone_number="9876543210",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Municipal Corporation",
                ward="Ward 1",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Road Department Head",
                phone_number="9876543211",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Road Maintenance Department",
                ward="Ward 2",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Water Department Head",
                phone_number="9876543212",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Water Department",
                ward="Ward 3",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Waste Management Head",
                phone_number="9876543213",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Waste Management Department",
                ward="Ward 4",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Traffic Department Head",
                phone_number="9876543214",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Traffic Department",
                ward="Ward 5",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            # Citizen accounts
            User(
                full_name="Rajesh Kumar",
                phone_number="9876543215",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=95.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Priya Sharma",
                phone_number="9876543216",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=92.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Amit Patel",
                phone_number="9876543217",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=88.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Sunita Singh",
                phone_number="9876543218",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=90.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Vikram Mehta",
                phone_number="9876543219",
                password_hash=pwd_ctx.hash("password123"),
                role="citizen",
                trust_score=85.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            )
            ]
            
            for user in users:
                db.add(user)
            db.commit()
        
        print("Adding sample issues...")
        # Create comprehensive issues with proper categorization
        categories = ["Potholes", "Road Cracks", "Manholes", "Stagnant Water", "Damaged Signboards", "Garbage Overflow", "Trash", "Street Lights", "Sewer Blockage", "Water Leakage"]
        departments = ["Road Maintenance Department", "Sewer Department", "Water Department", "Traffic Department", "Waste Management Department", "Electrical Department"]
        statuses = ["new", "in_progress", "resolved"]
        priorities = ["high", "medium", "low"]
        
        # Mumbai coordinates (approximate)
        base_lat, base_lng = 19.0760, 72.8777
        
        # Sample addresses in Mumbai
        sample_addresses = [
            {"line1": "123 MG Road", "line2": "Andheri West", "street": "MG Road", "landmark": "Near Metro Station", "pincode": "400058"},
            {"line1": "456 Linking Road", "line2": "Bandra West", "street": "Linking Road", "landmark": "Near Bandra Station", "pincode": "400050"},
            {"line1": "789 Dadar Station Road", "line2": "Dadar East", "street": "Station Road", "landmark": "Near Dadar Station", "pincode": "400014"},
            {"line1": "321 CST Road", "line2": "Mumbai Central", "street": "CST Road", "landmark": "Near CST Station", "pincode": "400001"},
            {"line1": "654 Thane Station Road", "line2": "Thane West", "street": "Station Road", "landmark": "Near Thane Station", "pincode": "400601"},
            {"line1": "987 Powai Lake Road", "line2": "Powai", "street": "Lake Road", "landmark": "Near IIT Mumbai", "pincode": "400076"},
            {"line1": "147 Juhu Beach Road", "line2": "Juhu", "street": "Beach Road", "landmark": "Near Juhu Beach", "pincode": "400049"},
            {"line1": "258 Worli Sea Face", "line2": "Worli", "street": "Sea Face", "landmark": "Near Worli Fort", "pincode": "400018"}
        ]
        
        # Global issues descriptions
        global_issues = [
            "Large pothole causing traffic congestion and vehicle damage. Multiple complaints received from residents.",
            "Severe road crack extending across the entire width of the road. Safety hazard for vehicles.",
            "Manhole cover missing, creating a dangerous open pit. Immediate attention required.",
            "Stagnant water accumulating for over a week, breeding mosquitoes and causing health concerns.",
            "Damaged traffic signboard causing confusion among drivers. Needs immediate replacement.",
            "Garbage overflow from municipal bins, spreading waste on the street and causing foul smell.",
            "Large pile of construction debris blocking pedestrian walkway. Safety hazard for pedestrians.",
            "Street light not working for the past 3 days, making the area unsafe at night.",
            "Sewer blockage causing water backup and foul smell in the area.",
            "Water leakage from municipal pipeline, wasting water and causing road damage."
        ]
        
        issues = []
        citizen_ids = [6, 7, 8, 9, 10]  # Citizen user IDs
        admin_ids = [1, 2, 3, 4, 5]    # Admin user IDs
        
        for i in range(50):  # Create 50 issues
            # Generate random coordinates around Mumbai
            lat = base_lat + random.uniform(-0.1, 0.1)
            lng = base_lng + random.uniform(-0.1, 0.1)
            
            # Random creation date in the last 30 days
            created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
            
            # Random media URLs with actual issue images
            num_images = random.randint(1, 3)
            media_urls = random.sample(ISSUE_IMAGES, min(num_images, len(ISSUE_IMAGES)))
            
            # Select random address
            address = random.choice(sample_addresses)
            
            # Map category to department
            category = random.choice(categories)
            if category in ["Potholes", "Road Cracks"]:
                department = "Road Maintenance Department"
            elif category in ["Manholes", "Sewer Blockage"]:
                department = "Sewer Department"
            elif category in ["Stagnant Water", "Water Leakage"]:
                department = "Water Department"
            elif category in ["Damaged Signboards"]:
                department = "Traffic Department"
            elif category in ["Garbage Overflow", "Trash"]:
                department = "Waste Management Department"
            elif category in ["Street Lights"]:
                department = "Electrical Department"
            else:
                department = "Road Maintenance Department"
            
            # Assign admin based on department
            assigned_admin_id = None
            if department == "Road Maintenance Department":
                assigned_admin_id = 2
            elif department == "Water Department":
                assigned_admin_id = 3
            elif department == "Waste Management Department":
                assigned_admin_id = 4
            elif department == "Traffic Department":
                assigned_admin_id = 5
            elif department == "Sewer Department":
                assigned_admin_id = 2  # Road admin handles sewer too
            elif department == "Electrical Department":
                assigned_admin_id = 1  # Municipal commissioner handles electrical
            
            issue = Issue(
                reporter_id=random.choice(citizen_ids),
                category=category,
                description=random.choice(global_issues),
                status=random.choice(statuses),
                priority=random.choice(priorities),
                lat=lat,
                lng=lng,
                media_urls=json.dumps(media_urls),
                upvote_count=random.randint(0, 35),
                created_at=created_at,
                updated_at=created_at + timedelta(hours=random.randint(1, 48)),
                # New fields
                assigned_department=department,
                is_anonymous=False,  # Show user names, not anonymous
                is_verified=True,    # All issues are verified
                assigned_admin_id=assigned_admin_id,
                address_line1=address['line1'],
                address_line2=address['line2'],
                street=address['street'],
                landmark=address['landmark'],
                pincode=address['pincode']
            )
            issues.append(issue)
            db.add(issue)
        
        db.commit()
        
        print("Adding sample upvotes...")
        # Create sample upvotes
        for issue in issues:
            # Random number of upvotes
            num_upvotes = random.randint(0, min(10, issue.upvote_count))
            upvoter_ids = random.sample(citizen_ids, min(num_upvotes, len(citizen_ids)))
            
            for user_id in upvoter_ids:
                upvote = Upvote(
                    user_id=user_id,
                    issue_id=issue.id,
                    created_at=issue.created_at + timedelta(minutes=random.randint(1, 60))
                )
                db.add(upvote)
        
        db.commit()
        
        print("Database initialized successfully!")
        print(f"Created {len(users)} users (5 admins, 5 citizens)")
        print(f"Created {len(issues)} verified issues")
        print(f"Created {db.query(Upvote).count()} upvotes")
        print("\nAdmin Accounts:")
        print("- Municipal Commissioner (Phone: 9876543210)")
        print("- Road Department Head (Phone: 9876543211)")
        print("- Water Department Head (Phone: 9876543212)")
        print("- Waste Management Head (Phone: 9876543213)")
        print("- Traffic Department Head (Phone: 9876543214)")
        print("\nCitizen Accounts:")
        print("- Rajesh Kumar (Phone: 9876543215)")
        print("- Priya Sharma (Phone: 9876543216)")
        print("- Amit Patel (Phone: 9876543217)")
        print("- Sunita Singh (Phone: 9876543218)")
        print("- Vikram Mehta (Phone: 9876543219)")
        print("\nAll passwords: admin123 (for admins), password123 (for citizens)")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()

