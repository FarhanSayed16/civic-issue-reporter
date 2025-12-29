# 🚀 Quick Start Guide - Civic Issue Reporter

## ⚡ Fast Setup (5 Minutes)

### 1. Backend Setup

```bash
# Navigate to backend
cd civic_issue_backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start server
python start.py
```

✅ Backend running at: `http://localhost:8585`
- API Docs: `http://localhost:8585/docs`
- Frontend: `http://localhost:8585/frontend`

### 2. Frontend Web Setup (Optional)

```bash
# Navigate to frontend
cd frontend/apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: `http://localhost:5173`

---

## 🔑 Quick Login

### Admin Login
- **Phone:** `9876543210`
- **Password:** `admin123`

### Citizen Login
- **Phone:** `9876543215`
- **Password:** `password123`

---

## 📋 What's Included

✅ **5 Admin Accounts** (different departments)
✅ **5 Citizen Accounts**
✅ **50 Sample Issues** (various categories and statuses)
✅ **Sample Upvotes** and interactions
✅ **Complete API** with documentation
✅ **Web Interface** at `/frontend`
✅ **Real-time Updates** via WebSocket

---

## 🎯 Next Steps

1. **Login** with demo credentials
2. **Report an Issue** - Upload photo, add location
3. **View Issues** - Browse and filter issues
4. **Admin Dashboard** - Manage issues and view analytics
5. **Explore API** - Visit `/docs` for interactive API docs

---

## ⚠️ Troubleshooting

**Port already in use?**
```bash
# Use different port
uvicorn app.main:app --reload --port 8586
```

**Database errors?**
```bash
# Reinitialize database
rm civic_issues.db
python init_db.py
```

**Module not found?**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

---

## 📚 Full Documentation

For complete setup instructions, see [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)

---

**That's it! You're ready to go! 🎉**

