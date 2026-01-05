# 🚀 Quick Start Guide - SwachhCity

**Time Required**: 5 minutes  
**Platform**: Environmental & Waste Monitoring Platform

---

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- Flutter 3.6+ (for mobile app - optional)

---

## ⚡ Quick Setup (5 Minutes)

### **Step 1: Backend Setup** (2 minutes)

```bash
# Navigate to backend
cd civic_issue_backend

# Install dependencies
pip install -r requirements.txt

# Initialize database with sample data
python init_db.py

# Start backend server
python start.py
```

✅ **Backend running at**: `http://localhost:8585`  
✅ **API Docs available at**: `http://localhost:8585/docs`

---

### **Step 2: Frontend Web Setup** (1 minute)

```bash
# Navigate to web frontend
cd frontend/apps/web

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ **Frontend running at**: `http://localhost:5173`

---

### **Step 3: Mobile App Setup** (Optional, 2 minutes)

```bash
# Navigate to mobile app
cd frontend/apps/mobile

# Get dependencies
flutter pub get

# Run on connected device/emulator
flutter run
```

✅ **Mobile app ready**

---

## 🔑 Demo Credentials

### **Admin Account**
- **Phone**: `9876543210`
- **Password**: `admin123`
- **Department**: Various environmental departments

### **Citizen Account**
- **Phone**: `9876543215`
- **Password**: `password123`

---

## 🎥 Demo Mode (For Smooth Presentations)

To enable demo mode for smooth hackathon demos:

**Frontend**:
1. Create `.env` file in `frontend/apps/web/`
2. Add: `VITE_DEMO_MODE=true`
3. Restart dev server

**Backend**:
1. Set environment variable: `DEMO_MODE=true`
2. Restart backend server

**See**: `docs/demo/DEMO_MODE.md` for detailed guide

---

## ✅ Verify Installation

1. **Backend**: Visit `http://localhost:8585/docs` - Should see API documentation
2. **Frontend**: Visit `http://localhost:5173` - Should see login page
3. **Login**: Use demo credentials above
4. **Test**: Try reporting an environmental issue

---

## 🐛 Troubleshooting

### **Backend Issues**
- **Port already in use**: Change port in `start.py` or kill existing process
- **Database errors**: Delete `civic_issue.db` and run `init_db.py` again
- **Module not found**: Run `pip install -r requirements.txt` again

### **Frontend Issues**
- **Port already in use**: Change port in `vite.config.js` or kill existing process
- **Module not found**: Run `npm install` again
- **API connection errors**: Check backend is running on port 8585

### **Mobile Issues**
- **Flutter not found**: Install Flutter SDK and add to PATH
- **Device not detected**: Check USB debugging enabled (Android) or device trusted (iOS)

**More help**: See `docs/fixes/` folder for detailed troubleshooting

---

## 📚 Next Steps

1. **Explore Features**: 
   - Report environmental issues
   - View analytics dashboard
   - Track cleanup progress

2. **Read Documentation**:
   - [Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)
   - [Project Overview](../overview/PROJECT_OVERVIEW.md)
   - [Demo Script](../demo/DEMO_SCRIPT.md)

3. **Prepare for Demo**:
   - Enable demo mode
   - Practice demo script
   - Test all features

---

## 🎯 Quick Test Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads login page
- [ ] Can login with demo credentials
- [ ] Can view environmental reports
- [ ] Can submit new environmental report
- [ ] Analytics dashboard loads
- [ ] Demo mode works (if enabled)

---

**Document Status**: ✅ Complete  
**Last Updated**: December 2025  
**Project**: SwachhCity - Environmental & Waste Monitoring Platform
