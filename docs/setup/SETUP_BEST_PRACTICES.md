# 🎯 Best Practices for Setting Up the Project

## 🔧 Virtual Environment Best Practices

### ❌ **DON'T: Multiple Virtual Environments**

Having multiple `venv` or `.venv` folders in different locations causes confusion and dependency conflicts.

### ✅ **DO: Single Project-Level Virtual Environment**

**Recommended Structure:**
```
civic-issue-reporter/
├── .venv/                    # ✅ ONE virtual environment at project root
├── civic_issue_backend/
├── frontend/
└── README.md
```

## 🚀 Clean Setup Guide

### Step 1: Clean Up Existing Virtual Environments

**Find all venv folders:**
```bash
# Windows PowerShell
Get-ChildItem -Path . -Filter "venv" -Recurse -Directory
Get-ChildItem -Path . -Filter ".venv" -Recurse -Directory

# Linux/Mac
find . -type d -name "venv" -o -name ".venv"
```

**Delete all existing venv folders:**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .\venv, .\.venv, .\civic_issue_backend\venv, .\frontend\apps\api\venv -ErrorAction SilentlyContinue

# Linux/Mac
rm -rf venv .venv civic_issue_backend/venv frontend/apps/api/venv
```

### Step 2: Create ONE Virtual Environment at Project Root

```bash
# Navigate to project root
cd E:\civic-issue-reporter

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate

# Linux/Mac:
source .venv/bin/activate
```

**You should see `(.venv)` in your prompt:**
```
(.venv) PS E:\civic-issue-reporter>
```

### Step 3: Install Backend Dependencies

```bash
# Make sure you're in project root with venv activated
cd civic_issue_backend
pip install -r requirements.txt
```

### Step 4: Fix Missing Module Issue

The `key_manager.py` file was missing. It has been created. If you still see errors:

```bash
# Verify the file exists
ls civic_issue_backend/app/core/key_manager.py

# If it doesn't exist, the file has been created in the codebase
```

### Step 5: Initialize Database

```bash
# Still in civic_issue_backend directory
python init_db.py
```

### Step 6: Start the Server

```bash
python start.py
```

## 📋 Complete Setup Checklist

- [ ] Delete all existing `venv` and `.venv` folders
- [ ] Create ONE `.venv` at project root
- [ ] Activate virtual environment
- [ ] Install backend dependencies: `pip install -r requirements.txt`
- [ ] Verify `key_manager.py` exists in `civic_issue_backend/app/core/`
- [ ] Initialize database: `python init_db.py`
- [ ] Start server: `python start.py`
- [ ] Test: Visit `http://localhost:8585/docs`

## 🔍 Verification Commands

**Check virtual environment:**
```bash
# Should show .venv path
where python
# Windows: C:\...\civic-issue-reporter\.venv\Scripts\python.exe
# Linux/Mac: /path/to/civic-issue-reporter/.venv/bin/python
```

**Check installed packages:**
```bash
pip list
# Should show fastapi, uvicorn, sqlalchemy, etc.
```

**Check Python path:**
```bash
python -c "import sys; print(sys.executable)"
# Should point to .venv
```

## ⚠️ Common Mistakes to Avoid

1. **❌ Creating venv inside civic_issue_backend/**
   - Makes it hard to share with frontend
   - Can cause import path issues

2. **❌ Using system Python**
   - Can pollute system packages
   - Hard to manage dependencies

3. **❌ Multiple venv folders**
   - Confusion about which one is active
   - Dependency conflicts

4. **❌ Forgetting to activate venv**
   - Installing packages globally
   - Import errors

## 🎯 Recommended Workflow

### Daily Development

```bash
# 1. Navigate to project root
cd E:\civic-issue-reporter

# 2. Activate virtual environment
.venv\Scripts\activate  # Windows
# or
source .venv/bin/activate  # Linux/Mac

# 3. Work on backend
cd civic_issue_backend
python start.py

# 4. In another terminal, work on frontend
cd frontend/apps/web
npm run dev
```

### Adding New Dependencies

```bash
# Make sure venv is activated
pip install new-package

# Update requirements.txt
pip freeze > requirements.txt
```

## 🐛 Troubleshooting

### "ModuleNotFoundError" after setup

```bash
# 1. Verify venv is activated
which python  # Should show .venv path

# 2. Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# 3. Check Python path in IDE
# Make sure IDE is using .venv Python interpreter
```

### "Command not found: python"

```bash
# Use python3 instead
python3 -m venv .venv
python3 -m pip install -r requirements.txt
```

### Virtual environment not activating

```bash
# Windows: Check execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
.venv\Scripts\activate
```

## 📝 IDE Configuration

### VS Code

1. Open project root folder
2. Press `Ctrl+Shift+P`
3. Type "Python: Select Interpreter"
4. Choose `.venv\Scripts\python.exe` (Windows) or `.venv/bin/python` (Linux/Mac)

### PyCharm

1. File → Settings → Project → Python Interpreter
2. Click gear icon → Add
3. Select "Existing environment"
4. Point to `.venv\Scripts\python.exe`

## ✅ Success Indicators

You're set up correctly when:

- ✅ `(.venv)` appears in terminal prompt
- ✅ `python --version` shows correct Python version
- ✅ `pip list` shows all required packages
- ✅ `python start.py` starts server without errors
- ✅ `http://localhost:8585/docs` loads successfully

---

**Remember: ONE virtual environment at project root is the best practice! 🎯**

