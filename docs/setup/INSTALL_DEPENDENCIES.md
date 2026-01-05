# 📦 Install Dependencies - Quick Fix

## ⚡ Quick Command

```bash
# Make sure you're in the project root with venv activated
cd E:\civic-issue-reporter
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# Install all dependencies
cd civic_issue_backend
pip install --upgrade pip
pip install -r requirements.txt
```

## ✅ What Gets Installed

### Required Dependencies
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - Database ORM
- `python-jose` - JWT handling
- `passlib[bcrypt]` - Password hashing
- `pydantic` - Data validation
- `python-multipart` - File uploads
- `cryptography` - Encryption
- `python-dotenv` - Environment variables
- `boto3` - AWS S3 support
- `redis` - Caching (optional)
- `celery` - Background tasks (optional)

### Optional Dependencies
- `ultralytics` - YOLO AI model (optional)
- `torch` - PyTorch (optional, for AI)
- `hcaptcha` - Not required (verification is disabled)

## 🔍 Verify Installation

```bash
# Check if packages are installed
pip list | grep fastapi
pip list | grep python-dotenv

# Should show the packages
```

## 🐛 If Installation Fails

### Windows Issues

```powershell
# If pip is not recognized
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### Permission Issues

```bash
# Use --user flag if needed
pip install --user -r requirements.txt
```

### Specific Package Issues

```bash
# Install packages one by one to identify the issue
pip install fastapi
pip install uvicorn
pip install sqlalchemy
# etc...
```

## ✅ After Installation

Run the server:
```bash
python start.py
```

Should see:
```
🚀 Starting Civic Issue Management System...
✅ Database initialized successfully!
INFO:     Uvicorn running on http://0.0.0.0:8585
```

---

**All dependencies should now be installed! 🎉**

