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
                full_name="Solid Waste Management Head",
                phone_number="9876543211",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Solid Waste Management",
                ward="Ward 2",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Water Quality Department Head",
                phone_number="9876543212",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Water Quality Department",
                ward="Ward 3",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Pollution Control Board Head",
                phone_number="9876543213",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Pollution Control Board",
                ward="Ward 4",
                trust_score=100.0,
                profile_picture_url=random.choice(PROFILE_PICTURES)
            ),
            User(
                full_name="Municipal Waste Collection Head",
                phone_number="9876543214",
                password_hash=pwd_ctx.hash("admin123"),
                role="admin",
                department="Municipal Waste Collection",
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
        # Create comprehensive issues with proper environmental categorization
        categories = ["Open Garbage Dump", "Plastic Pollution", "Open Burning", "Water Body Pollution", "Construction Waste", "Electronic Waste (E-Waste)", "Biomedical Waste", "Green Space Degradation", "Drainage Blockage", "Water Pollution / Contaminated Water", "Garbage Overflow", "Illegal Dumping / Litter"]
        departments = ["Solid Waste Management", "Water Quality Department", "Pollution Control Board", "Municipal Waste Collection", "Sanitation Department", "Hazardous Waste Management", "Green Space Management", "Waste Water Management", "Environmental Authority"]
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
        
        # Global environmental issues descriptions
        global_issues = [
            "Large open garbage dump site with waste accumulating for weeks, causing foul smell and health hazards.",
            "Plastic pollution covering the area, with plastic bags and bottles scattered everywhere.",
            "Open burning of waste causing toxic smoke and air pollution affecting nearby residents.",
            "Water body pollution in local pond/lake with contaminated water and visible waste floating.",
            "Construction waste illegally dumped blocking pedestrian walkway and causing safety concerns.",
            "Electronic waste (old batteries, phones) improperly disposed in public area, environmental hazard.",
            "Biomedical waste including used syringes and medical items found in public space, serious health risk.",
            "Green space degradation with trees cut down and land cleared, affecting local ecosystem.",
            "Drainage blockage causing waterlogging and stagnant water, breeding mosquitoes.",
            "Water pollution from contaminated sources, foul smell and health concerns for nearby residents.",
            "Garbage overflow from municipal bins, spreading waste on the street and causing foul smell.",
            "Illegal dumping of waste and litter on roadside, creating unsanitary conditions."
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
            
            # Map category to environmental department
            category = random.choice(categories)
            if category in ["Open Garbage Dump", "Construction Waste"]:
                department = "Municipal Waste Collection"
            elif category in ["Plastic Pollution", "Open Burning", "Water Body Pollution"]:
                department = "Pollution Control Board"
            elif category in ["Electronic Waste (E-Waste)", "Biomedical Waste"]:
                department = "Hazardous Waste Management"
            elif category in ["Green Space Degradation"]:
                department = "Green Space Management"
            elif category in ["Drainage Blockage"]:
                department = "Waste Water Management"
            elif category in ["Water Pollution / Contaminated Water"]:
                department = "Water Quality Department"
            elif category in ["Garbage Overflow"]:
                department = "Solid Waste Management"
            elif category in ["Illegal Dumping / Litter"]:
                department = "Sanitation Department"
            else:
                department = "Environmental Authority"
            
            # Assign admin based on environmental department
            assigned_admin_id = None
            if department == "Solid Waste Management":
                assigned_admin_id = 2
            elif department == "Water Quality Department":
                assigned_admin_id = 3
            elif department == "Pollution Control Board":
                assigned_admin_id = 4
            elif department == "Municipal Waste Collection":
                assigned_admin_id = 5
            elif department == "Sanitation Department":
                assigned_admin_id = 2  # Solid waste admin handles sanitation
            elif department == "Hazardous Waste Management":
                assigned_admin_id = 4  # Pollution control handles hazardous waste
            elif department == "Green Space Management":
                assigned_admin_id = 3  # Water quality handles green spaces
            elif department == "Waste Water Management":
                assigned_admin_id = 3  # Water quality handles waste water
            elif department == "Environmental Authority":
                assigned_admin_id = 1  # Municipal commissioner handles general
            
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

