#!/usr/bin/env python3
"""
DEMO DATA SEED SCRIPT - Environmental Issues
============================================
This script inserts realistic environmental/garbage issues for DEMO purposes only.
Use this for hackathon presentations and video recordings.

⚠️  WARNING: This is DEMO DATA only. Do NOT run in production.
⚠️  This script can be safely run multiple times (checks for existing demo issues).

Usage:
    python seed_demo_environmental_issues.py

To remove demo data:
    DELETE FROM issues WHERE description LIKE '%[DEMO]%';
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import SessionLocal
from app.models.user import User
from app.models.issue import Issue
from datetime import datetime, timedelta
import random
import json

# ============================================================
# DEMO IMAGE URLs - Realistic garbage/waste images from Unsplash
# ============================================================
# These are publicly available images that show real environmental issues
DEMO_IMAGE_URLS = [
    # Garbage dumps and waste piles
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80",
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80",
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
    
    # Plastic pollution
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80",
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
    
    # Water pollution
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80",
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    
    # Construction waste
    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80",
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
    
    # Overflowing bins
    "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80",
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&q=80",
    
    # Illegal dumping
    "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80",
    "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&q=80",
]

# ============================================================
# REALISTIC ENVIRONMENTAL ISSUE DESCRIPTIONS
# ============================================================
DEMO_ISSUES = [
    {
        "category": "Illegal Dumping / Litter",
        "description": "[DEMO] Large pile of household waste illegally dumped near residential area. Plastic bags, food waste, and other garbage scattered across the roadside. Foul smell and health hazard for nearby residents.",
        "priority": "high",
        "severity": 0.85
    },
    {
        "category": "Open Garbage Dump",
        "description": "[DEMO] Massive open garbage dump site accumulating for weeks. Mixed waste including organic matter, plastic, and hazardous materials. Attracting stray animals and causing environmental pollution.",
        "priority": "high",
        "severity": 0.90
    },
    {
        "category": "Plastic Pollution",
        "description": "[DEMO] Extensive plastic waste covering the area. Plastic bags, bottles, and packaging materials scattered everywhere. Threatening local wildlife and blocking drainage systems.",
        "priority": "high",
        "severity": 0.80
    },
    {
        "category": "Garbage Overflow",
        "description": "[DEMO] Municipal garbage bins overflowing with waste. Garbage spilling onto the street, creating unsanitary conditions. Bins haven't been emptied in days.",
        "priority": "medium",
        "severity": 0.70
    },
    {
        "category": "Illegal Dumping / Litter",
        "description": "[DEMO] Construction debris and household waste dumped illegally on vacant land. Concrete blocks, broken tiles, and mixed garbage creating eyesore and health risk.",
        "priority": "medium",
        "severity": 0.75
    },
    {
        "category": "Water Body Pollution",
        "description": "[DEMO] Local pond contaminated with waste and plastic. Visible garbage floating on water surface. Foul smell and potential health hazard for nearby community.",
        "priority": "high",
        "severity": 0.88
    },
    {
        "category": "Open Burning",
        "description": "[DEMO] Open burning of waste causing toxic smoke. Plastic and other materials being burned illegally, releasing harmful pollutants into the air.",
        "priority": "high",
        "severity": 0.82
    },
    {
        "category": "Plastic Pollution",
        "description": "[DEMO] Plastic waste accumulation near water drainage. Plastic bags and bottles blocking water flow, causing potential flooding during rains.",
        "priority": "medium",
        "severity": 0.68
    },
    {
        "category": "Garbage Overflow",
        "description": "[DEMO] Multiple garbage bins overflowing in commercial area. Waste spreading onto footpaths, affecting pedestrian movement and local businesses.",
        "priority": "medium",
        "severity": 0.72
    },
    {
        "category": "Illegal Dumping / Litter",
        "description": "[DEMO] Roadside dumping of mixed waste including electronic items and household garbage. Creating visual pollution and attracting pests.",
        "priority": "medium",
        "severity": 0.70
    },
    {
        "category": "Open Garbage Dump",
        "description": "[DEMO] Large open dump site near residential colony. Waste accumulating for months, causing severe odor and health concerns. Urgent cleanup required.",
        "priority": "high",
        "severity": 0.92
    },
    {
        "category": "Water Pollution / Contaminated Water",
        "description": "[DEMO] Contaminated water source with visible waste and pollutants. Foul smell and discolored water indicating serious contamination. Health risk for residents.",
        "priority": "high",
        "severity": 0.88
    },
    {
        "category": "Plastic Pollution",
        "description": "[DEMO] Plastic waste accumulation in park area. Plastic bags, wrappers, and bottles scattered across green space, harming local ecosystem.",
        "priority": "medium",
        "severity": 0.65
    },
    {
        "category": "Garbage Overflow",
        "description": "[DEMO] Overflowing garbage bins near school area. Waste spilling onto playground, creating unsafe environment for children.",
        "priority": "high",
        "severity": 0.78
    },
    {
        "category": "Illegal Dumping / Litter",
        "description": "[DEMO] Illegal dumping of industrial and household waste on roadside. Mixed materials including hazardous waste creating environmental hazard.",
        "priority": "high",
        "severity": 0.85
    },
    {
        "category": "Open Garbage Dump",
        "description": "[DEMO] Unauthorized garbage dump site growing daily. Organic waste decomposing, attracting flies and creating breeding ground for diseases.",
        "priority": "high",
        "severity": 0.87
    },
    {
        "category": "Drainage Blockage",
        "description": "[DEMO] Drainage system blocked by plastic waste and garbage. Waterlogging during rains, causing inconvenience and health risks.",
        "priority": "medium",
        "severity": 0.73
    },
    {
        "category": "Plastic Pollution",
        "description": "[DEMO] Plastic waste accumulation near beach area. Marine pollution threat with plastic items washing into water during high tide.",
        "priority": "high",
        "severity": 0.80
    },
    {
        "category": "Garbage Overflow",
        "description": "[DEMO] Multiple garbage collection points overflowing. Waste management system overwhelmed, requiring immediate attention.",
        "priority": "medium",
        "severity": 0.70
    },
    {
        "category": "Illegal Dumping / Litter",
        "description": "[DEMO] Systematic illegal dumping in residential area. Waste dumped during night hours, creating persistent environmental problem.",
        "priority": "medium",
        "severity": 0.75
    },
    {
        "category": "Open Garbage Dump",
        "description": "[DEMO] Large-scale garbage dump near industrial area. Mixed industrial and municipal waste creating severe environmental pollution.",
        "priority": "high",
        "severity": 0.90
    },
    {
        "category": "Water Body Pollution",
        "description": "[DEMO] River/stream contaminated with waste and plastic. Visible pollution affecting water quality and aquatic life.",
        "priority": "high",
        "severity": 0.85
    },
    {
        "category": "Plastic Pollution",
        "description": "[DEMO] Plastic waste accumulation in residential colony. Single-use plastics scattered everywhere, requiring community cleanup drive.",
        "priority": "medium",
        "severity": 0.68
    },
    {
        "category": "Garbage Overflow",
        "description": "[DEMO] Garbage bins in market area overflowing. Commercial waste mixed with household garbage, creating unsanitary conditions.",
        "priority": "medium",
        "severity": 0.72
    },
    {
        "category": "Illegal Dumping / Litter",
        "description": "[DEMO] Roadside dumping of construction and household waste. Debris blocking pedestrian pathways and creating traffic hazards.",
        "priority": "medium",
        "severity": 0.70
    }
]

# ============================================================
# MUMBAI LOCATIONS (Realistic coordinates)
# ============================================================
MUMBAI_LOCATIONS = [
    {"name": "Andheri West", "lat": 19.1197, "lng": 72.8467, "address": {"line1": "123 MG Road", "line2": "Andheri West", "street": "MG Road", "landmark": "Near Metro Station", "pincode": "400058"}},
    {"name": "Bandra West", "lat": 19.0596, "lng": 72.8295, "address": {"line1": "456 Linking Road", "line2": "Bandra West", "street": "Linking Road", "landmark": "Near Bandra Station", "pincode": "400050"}},
    {"name": "Dadar East", "lat": 19.0176, "lng": 72.8562, "address": {"line1": "789 Dadar Station Road", "line2": "Dadar East", "street": "Station Road", "landmark": "Near Dadar Station", "pincode": "400014"}},
    {"name": "Mumbai Central", "lat": 18.9700, "lng": 72.8190, "address": {"line1": "321 CST Road", "line2": "Mumbai Central", "street": "CST Road", "landmark": "Near CST Station", "pincode": "400001"}},
    {"name": "Thane West", "lat": 19.2183, "lng": 72.9781, "address": {"line1": "654 Thane Station Road", "line2": "Thane West", "street": "Station Road", "landmark": "Near Thane Station", "pincode": "400601"}},
    {"name": "Powai", "lat": 19.1183, "lng": 72.9067, "address": {"line1": "987 Powai Lake Road", "line2": "Powai", "street": "Lake Road", "landmark": "Near IIT Mumbai", "pincode": "400076"}},
    {"name": "Juhu", "lat": 19.1000, "lng": 72.8267, "address": {"line1": "147 Juhu Beach Road", "line2": "Juhu", "street": "Beach Road", "landmark": "Near Juhu Beach", "pincode": "400049"}},
    {"name": "Worli", "lat": 19.0176, "lng": 72.8267, "address": {"line1": "258 Worli Sea Face", "line2": "Worli", "street": "Sea Face", "landmark": "Near Worli Fort", "pincode": "400018"}},
    {"name": "Kurla", "lat": 19.0750, "lng": 72.8777, "address": {"line1": "369 Kurla Station Road", "line2": "Kurla East", "street": "Station Road", "landmark": "Near Kurla Station", "pincode": "400070"}},
    {"name": "Chembur", "lat": 19.0550, "lng": 72.9000, "address": {"line1": "741 Chembur Road", "line2": "Chembur", "street": "Chembur Road", "landmark": "Near Chembur Station", "pincode": "400071"}},
]

# ============================================================
# DEPARTMENT MAPPING
# ============================================================
def get_department_for_category(category):
    """Map category to appropriate department"""
    mapping = {
        "Open Garbage Dump": "Solid Waste Management",
        "Plastic Pollution": "Pollution Control Board",
        "Open Burning": "Pollution Control Board",
        "Water Body Pollution": "Water Quality Department",
        "Construction Waste": "Municipal Waste Collection",
        "Electronic Waste (E-Waste)": "Hazardous Waste Management",
        "Biomedical Waste": "Hazardous Waste Management",
        "Green Space Degradation": "Green Space Management",
        "Drainage Blockage": "Waste Water Management",
        "Water Pollution / Contaminated Water": "Water Quality Department",
        "Garbage Overflow": "Solid Waste Management",
        "Illegal Dumping / Litter": "Sanitation Department",
    }
    return mapping.get(category, "Environmental Authority")

# ============================================================
# MAIN SEED FUNCTION
# ============================================================
def seed_demo_issues():
    """Seed database with realistic demo environmental issues"""
    print("=" * 60)
    print("DEMO DATA SEED SCRIPT - Environmental Issues")
    print("=" * 60)
    print("⚠️  WARNING: This script inserts DEMO DATA only.")
    print("⚠️  Do NOT run in production environments.")
    print("=" * 60)
    print()
    
    db = SessionLocal()
    
    try:
        # Check for existing demo issues
        existing_demo_issues = db.query(Issue).filter(
            Issue.description.like('%[DEMO]%')
        ).count()
        
        if existing_demo_issues > 0:
            print(f"⚠️  Found {existing_demo_issues} existing demo issues.")
            response = input("Do you want to add more demo issues? (y/n): ").strip().lower()
            if response != 'y':
                print("Aborted. No new demo issues added.")
                return
            print()
        
        # Get existing users
        users = db.query(User).all()
        if not users:
            print("❌ ERROR: No users found in database.")
            print("   Please run init_db.py first to create users.")
            return
        
        # Separate citizens and admins
        citizens = [u for u in users if u.role == "citizen"]
        admins = [u for u in users if u.role == "admin"]
        
        if not citizens:
            print("❌ ERROR: No citizen users found.")
            print("   Please run init_db.py first to create users.")
            return
        
        if not admins:
            print("❌ ERROR: No admin users found.")
            print("   Please run init_db.py first to create users.")
            return
        
        print(f"✓ Found {len(citizens)} citizen users and {len(admins)} admin users")
        print()
        
        # Status distribution for realistic demo
        statuses = ["new", "in_progress", "resolved"]
        status_weights = [0.4, 0.3, 0.3]  # 40% new, 30% in progress, 30% resolved
        
        # Create demo issues
        created_issues = []
        print("Creating demo environmental issues...")
        print()
        
        for i, issue_data in enumerate(DEMO_ISSUES, 1):
            # Select random location
            location = random.choice(MUMBAI_LOCATIONS)
            
            # Add small random offset to coordinates for variety
            lat = location["lat"] + random.uniform(-0.02, 0.02)
            lng = location["lng"] + random.uniform(-0.02, 0.02)
            
            # Random creation date (last 30 days)
            days_ago = random.randint(0, 30)
            created_at = datetime.utcnow() - timedelta(days=days_ago)
            
            # Random status based on weights
            status = random.choices(statuses, weights=status_weights)[0]
            
            # If resolved, set updated_at to after creation
            if status == "resolved":
                updated_at = created_at + timedelta(hours=random.randint(2, 72))
            elif status == "in_progress":
                updated_at = created_at + timedelta(hours=random.randint(1, 24))
            else:
                updated_at = created_at
            
            # Select 1-3 random images
            num_images = random.randint(1, 3)
            media_urls = random.sample(DEMO_IMAGE_URLS, min(num_images, len(DEMO_IMAGE_URLS)))
            
            # Get department
            department = get_department_for_category(issue_data["category"])
            
            # Assign admin based on department
            assigned_admin = None
            for admin in admins:
                if admin.department == department:
                    assigned_admin = admin
                    break
            
            # If no matching admin, assign random admin
            if not assigned_admin:
                assigned_admin = random.choice(admins)
            
            # Random reporter
            reporter = random.choice(citizens)
            
            # Random upvotes
            upvote_count = random.randint(0, 25)
            
            # Create issue
            issue = Issue(
                reporter_id=reporter.id,
                category=issue_data["category"],
                description=issue_data["description"],
                status=status,
                priority=issue_data["priority"],
                severity_score=issue_data["severity"],
                lat=lat,
                lng=lng,
                media_urls=json.dumps(media_urls),
                is_anonymous=False,
                is_verified=True,
                assigned_department=department,
                assigned_admin_id=assigned_admin.id if assigned_admin else None,
                address_line1=location["address"]["line1"],
                address_line2=location["address"]["line2"],
                street=location["address"]["street"],
                landmark=location["address"]["landmark"],
                pincode=location["address"]["pincode"],
                upvote_count=upvote_count,
                created_at=created_at,
                updated_at=updated_at
            )
            
            db.add(issue)
            created_issues.append(issue)
            
            print(f"  [{i}/{len(DEMO_ISSUES)}] Created issue #{issue.id if hasattr(issue, 'id') else 'pending'}: {issue_data['category']} in {location['name']}")
        
        # Commit all issues
        db.commit()
        
        # Refresh to get IDs
        for issue in created_issues:
            db.refresh(issue)
        
        print()
        print("=" * 60)
        print("✓ SUCCESS: Demo issues created!")
        print("=" * 60)
        print(f"Total demo issues: {len(created_issues)}")
        print()
        print("Status breakdown:")
        status_counts = {}
        for issue in created_issues:
            status_counts[issue.status] = status_counts.get(issue.status, 0) + 1
        for status, count in status_counts.items():
            print(f"  - {status}: {count}")
        print()
        print("Category breakdown:")
        category_counts = {}
        for issue in created_issues:
            category_counts[issue.category] = category_counts.get(issue.category, 0) + 1
        for category, count in sorted(category_counts.items()):
            print(f"  - {category}: {count}")
        print()
        print("📍 Locations: Issues distributed across Mumbai areas")
        print("🖼️  Images: Each issue has 1-3 realistic waste/garbage images")
        print()
        print("=" * 60)
        print("TO REMOVE DEMO DATA:")
        print("=" * 60)
        print("Run this SQL command:")
        print("  DELETE FROM issues WHERE description LIKE '%[DEMO]%';")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_demo_issues()

