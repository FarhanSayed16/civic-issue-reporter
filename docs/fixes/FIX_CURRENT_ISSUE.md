# 🔧 Quick Fix for Current Issues

## Problem 1: Missing `key_manager.py` Module

**Error:** `ModuleNotFoundError: No module named 'app.core.key_manager'`

**✅ FIXED:** The `key_manager.py` file has been created at `civic_issue_backend/app/core/key_manager.py`

## Problem 2: Missing `hcaptcha` Module

**Error:** `ModuleNotFoundError: No module named 'hcaptcha'`

**✅ FIXED:** 
- Made hCaptcha import optional (it's disabled anyway)
- Added `python-dotenv` to requirements.txt
- Service now works without hCaptcha installed

## Problem 3: Multiple Virtual Environments

**Issue:** Confusion about which venv to use

**Solution:** Use ONE virtual environment at project root

---

## 🚀 Quick Fix Steps (5 minutes)

### Step 1: Stop Current Server
Press `Ctrl+C` to stop the running server

### Step 2: Clean Up Virtual Environments

**Windows PowerShell:**
```powershell
# Navigate to project root
cd E:\civic-issue-reporter

# Remove all existing venv folders
Remove-Item -Recurse -Force .\venv, .\.venv, .\civic_issue_backend\venv -ErrorAction SilentlyContinue
```

**Or use the automated script:**
```powershell
.\setup_clean.ps1
```

### Step 3: Create ONE Virtual Environment at Project Root

```powershell
# Make sure you're at project root (E:\civic-issue-reporter)
python -m venv .venv
```

### Step 4: Activate Virtual Environment

```powershell
.venv\Scripts\activate
```

**You should see `(.venv)` in your prompt:**
```
(.venv) PS E:\civic-issue-reporter>
```

### Step 5: Install Dependencies

```powershell
cd civic_issue_backend
pip install --upgrade pip
pip install -r requirements.txt
```

**This will install:**
- All required packages (FastAPI, SQLAlchemy, etc.)
- `python-dotenv` for .env file support
- Note: `hcaptcha` is optional and not required

### Step 6: Verify key_manager.py Exists

```powershell
# Check if file exists
Test-Path app\core\key_manager.py
# Should return: True
```

### Step 7: Start Server

```powershell
python start.py
```

---

## ✅ Verification

After following the steps above, you should see:

```
🚀 Starting Civic Issue Management System...
📊 Initializing database...
✅ Database initialized successfully!
🌐 Starting web server...
INFO:     Uvicorn running on http://0.0.0.0:8585
```

**Test the server:**
- Visit: `http://localhost:8585/docs`
- Should load the API documentation page

---

## 🎯 Best Practice Going Forward

### Always Work From Project Root

```powershell
# 1. Navigate to project root
cd E:\civic-issue-reporter

# 2. Activate virtual environment
.venv\Scripts\activate

# 3. Work on backend
cd civic_issue_backend
python start.py

# 4. For frontend (in another terminal)
cd frontend\apps\web
npm run dev
```

### Virtual Environment Structure

```
civic-issue-reporter/          # Project root
├── .venv/                     # ✅ ONE venv here
├── civic_issue_backend/
├── frontend/
└── README.md
```

**NOT:**
```
civic-issue-reporter/
├── .venv/                     # ❌ Multiple venvs
├── civic_issue_backend/
│   └── venv/                  # ❌ Don't create here
└── frontend/
    └── venv/                  # ❌ Don't create here
```

---

## 🐛 If Issues Persist

### Check Python Interpreter

```powershell
# Should show .venv path
where python
# Output: E:\civic-issue-reporter\.venv\Scripts\python.exe
```

### Reinstall Dependencies

```powershell
pip install -r requirements.txt --force-reinstall
```

### Check File Exists

```powershell
# Verify key_manager.py exists
Get-ChildItem civic_issue_backend\app\core\key_manager.py
```

### Clear Python Cache

```powershell
# Remove __pycache__ folders
Get-ChildItem -Path . -Filter "__pycache__" -Recurse | Remove-Item -Recurse -Force
```

---

## 📚 Additional Resources

- **Best Practices:** See [SETUP_BEST_PRACTICES.md](./SETUP_BEST_PRACTICES.md)
- **Complete Guide:** See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
- **Quick Start:** See [QUICK_START.md](./QUICK_START.md)

---

**After following these steps, your backend should work perfectly! 🎉**

