# 🌱 Demo Data Seed Script Guide

## Overview

The `seed_demo_environmental_issues.py` script creates realistic environmental/garbage issues for **DEMO purposes only**. This is designed for hackathon presentations and video recordings.

## ⚠️ Important Warnings

- **DEMO DATA ONLY**: This script is for demonstration purposes only
- **DO NOT RUN IN PRODUCTION**: Never run this script in a production environment
- **Safe to Run Multiple Times**: The script checks for existing demo issues and asks before adding more

## 📋 Prerequisites

1. **Database must be initialized**: Run `init_db.py` first to create users
   ```bash
   cd civic_issue_backend
   python init_db.py
   ```

2. **Python dependencies**: Ensure all backend dependencies are installed
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 How to Run

### Step 1: Navigate to Backend Directory
```bash
cd civic_issue_backend
```

### Step 2: Run the Seed Script
```bash
python seed_demo_environmental_issues.py
```

### Step 3: Follow Prompts
- If demo issues already exist, you'll be asked if you want to add more
- Type `y` to proceed or `n` to abort

## 📊 What Gets Created

The script creates **25 realistic environmental issues** with:

### Issue Details
- **Categories**: 
  - Illegal Dumping / Litter
  - Open Garbage Dump
  - Plastic Pollution
  - Garbage Overflow
  - Water Body Pollution
  - Water Pollution / Contaminated Water
  - Open Burning
  - Drainage Blockage

- **Status Distribution**:
  - 40% "new" (Reported)
  - 30% "in_progress" (Cleanup In Progress)
  - 30% "resolved" (Cleaned Up)

- **Priorities**: Mix of High, Medium, and Low based on severity

- **Locations**: Distributed across Mumbai areas:
  - Andheri West
  - Bandra West
  - Dadar East
  - Mumbai Central
  - Thane West
  - Powai
  - Juhu
  - Worli
  - Kurla
  - Chembur

### Images
- Each issue has **1-3 realistic images** showing:
  - Garbage dumps and waste piles
  - Plastic pollution
  - Water pollution
  - Overflowing bins
  - Illegal dumping sites

- Images are loaded from **Unsplash** (public URLs)
- Images are properly formatted as JSON array in `media_urls` field

### Departments & Assignments
- Issues are automatically assigned to appropriate departments:
  - Solid Waste Management
  - Pollution Control Board
  - Water Quality Department
  - Sanitation Department
  - Hazardous Waste Management
  - Environmental Authority

- Admins are assigned based on department matching

### Addresses
- Each issue includes complete address information:
  - Address Line 1 & 2
  - Street
  - Landmark
  - Pincode

## ✅ Verification Checklist

After running the script, verify:

- [ ] **Mobile App**: Issues appear in the issue list
- [ ] **Mobile App**: Images load correctly in issue details
- [ ] **Mobile App**: Map shows pins for all issues
- [ ] **Web Dashboard**: Issues appear in All Issues page
- [ ] **Web Dashboard**: Images display correctly in issue details modal
- [ ] **Web Dashboard**: Map/heatmap shows issue clusters
- [ ] **Admin Dashboard**: Assigned issues appear for admins
- [ ] **Status Distribution**: Mix of new, in_progress, and resolved

## 🗑️ How to Remove Demo Data

### Option 1: SQL Command (Recommended)
```sql
DELETE FROM issues WHERE description LIKE '%[DEMO]%';
```

### Option 2: Python Script
```python
from app.core.db import SessionLocal
from app.models.issue import Issue

db = SessionLocal()
demo_issues = db.query(Issue).filter(Issue.description.like('%[DEMO]%')).all()
for issue in demo_issues:
    db.delete(issue)
db.commit()
db.close()
```

### Option 3: Reset Entire Database
```bash
# Delete database file (SQLite)
rm civic_issues.db

# Re-initialize
python init_db.py
```

## 📝 Script Features

### Safety Features
- ✅ Checks for existing demo issues before inserting
- ✅ Asks for confirmation if demo issues already exist
- ✅ All demo issues marked with `[DEMO]` in description
- ✅ Uses existing users (doesn't create new ones)
- ✅ Proper error handling and rollback

### Realistic Data
- ✅ Realistic descriptions of environmental issues
- ✅ Proper location coordinates (Mumbai area)
- ✅ Realistic timestamps (last 30 days)
- ✅ Proper status progression (resolved issues have updated_at > created_at)
- ✅ Realistic upvote counts
- ✅ Proper department assignments
- ✅ Complete address information

## 🔧 Customization

### Adding More Issues
Edit `DEMO_ISSUES` list in `seed_demo_environmental_issues.py`:
```python
DEMO_ISSUES = [
    {
        "category": "Your Category",
        "description": "[DEMO] Your description...",
        "priority": "high",
        "severity": 0.85
    },
    # ... add more
]
```

### Changing Image URLs
Edit `DEMO_IMAGE_URLS` list:
```python
DEMO_IMAGE_URLS = [
    "https://your-image-url.com/image.jpg",
    # ... add more
]
```

### Adding New Locations
Edit `MUMBAI_LOCATIONS` list:
```python
MUMBAI_LOCATIONS = [
    {
        "name": "Your Location",
        "lat": 19.xxxx,
        "lng": 72.xxxx,
        "address": {...}
    },
    # ... add more
]
```

## 🐛 Troubleshooting

### Error: "No users found"
**Solution**: Run `init_db.py` first to create users

### Error: "No citizen users found"
**Solution**: Ensure `init_db.py` created citizen accounts

### Images Not Loading
**Possible Causes**:
- Internet connection required (images from Unsplash)
- CORS issues (check browser console)
- Image URLs expired (update `DEMO_IMAGE_URLS`)

**Solution**: Use local images or update URLs

### Issues Not Appearing on Map
**Check**:
- Coordinates are valid (lat/lng within reasonable range)
- Map component is properly configured
- Issues have valid location data

## 📞 Support

For issues or questions:
1. Check the script output for error messages
2. Verify database connection
3. Ensure all prerequisites are met
4. Check that users exist in database

## 🎯 Demo Best Practices

1. **Before Recording**:
   - Run seed script
   - Verify issues appear in app
   - Test image loading
   - Check map display

2. **During Recording**:
   - Show variety of issues (different statuses, categories)
   - Demonstrate image viewing
   - Show map with multiple pins
   - Highlight department assignments

3. **After Recording**:
   - Remove demo data if needed
   - Document any customizations made

---

**Status**: ✅ Ready for use
**Last Updated**: 2024

