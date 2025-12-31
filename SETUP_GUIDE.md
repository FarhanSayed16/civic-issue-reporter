# 🚀 SwachhCity - Complete Setup Guide

**Complete step-by-step guide to set up and run the entire SwachhCity application from scratch.**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Setup](#backend-setup)
3. [Frontend Web Setup](#frontend-web-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Running the Application](#running-the-application)
6. [Demo Data](#demo-data)
7. [Troubleshooting](#troubleshooting)
8. [Quick Reference](#quick-reference)

---

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software

1. **Python 3.8+**
   ```bash
   python --version  # Should show 3.8 or higher
   ```

2. **Node.js 16+ and npm**
   ```bash
   node --version  # Should show v16 or higher
   npm --version
   ```

3. **Flutter 3.6+** (for mobile app)
   ```bash
   flutter --version  # Should show 3.6 or higher
   flutter doctor    # Check for any issues
   ```

4. **Git** (for cloning the repository)

### Optional but Recommended

- **VS Code** or any code editor
- **Postman** (for API testing)
- **Android Studio** (for mobile app development)

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd civic_issue_backend
```

### Step 2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected Output:**
```
Successfully installed fastapi-0.95.2 uvicorn-0.21.1 sqlalchemy-2.0.15 ...
```

**If you encounter errors:**
- **Windows:** You might need to install Visual C++ Build Tools
- **Linux:** Install `python3-dev` and `build-essential`
- **Mac:** Install Xcode Command Line Tools: `xcode-select --install`

### Step 4: Initialize Database

```bash
python init_db.py
```

**Expected Output:**
```
Creating database tables...
Adding sample users...
Adding sample issues...
Database initialized successfully!
Created 11 users (5 admins, 5 citizens)
Created 50 verified issues
```

This creates:
- Database file: `civic_issues.db`
- Sample users (admins and citizens)
- Sample environmental issues

### Step 5: Verify Backend Setup

```bash
python start.py
```

**Expected Output:**
```
🚀 Starting Civic Issue Management System...
📊 Initializing database...
✅ Database initialized successfully!
🌐 Starting web server...
📱 Web Interface: http://localhost:8585/frontend
📚 API Docs: http://localhost:8585/docs
❤️ Health Check: http://localhost:8585/

🎯 Demo Credentials:
     Citizen: Phone: 9876543210 | Password: password123
     Admin: Phone: 9876543212 | Password: admin123
```

**✅ Backend is running if you see:**
- `INFO: Application startup complete.`
- `INFO: Uvicorn running on http://0.0.0.0:8585`

**Test the API:**
- Open browser: `http://localhost:8585/docs` (Interactive API docs)
- Health check: `http://localhost:8585/` (Should return JSON)

**Press `Ctrl+C` to stop the server.**

---

## 🌐 Frontend Web Setup

### Step 1: Navigate to Web Directory

```bash
cd frontend/apps/web
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Output:**
```
added 1234 packages, and audited 1235 packages in 2m
```

**If you encounter errors:**
- **npm ERR! network:** Check your internet connection
- **npm ERR! permission:** Use `sudo` (Linux/Mac) or run as Administrator (Windows)
- **npm ERR! EACCES:** Fix npm permissions or use `npm install --legacy-peer-deps`

### Step 3: Configure Environment Variables (Optional)

Create `.env` file in `frontend/apps/web/` (if not exists):

```env
VITE_API_URL=http://localhost:8585
```

**Note:** The app works without this file (uses default `http://localhost:8585`)

### Step 4: Start Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v6.3.5  ready in 1482 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**✅ Frontend is running if:**
- Browser opens automatically at `http://localhost:5173`
- You see the login page

**Press `Ctrl+C` to stop the server.**

---

## 📱 Mobile App Setup

### Step 1: Navigate to Mobile Directory

```bash
cd frontend/apps/mobile
```

### Step 2: Get Flutter Dependencies

```bash
flutter pub get
```

**Expected Output:**
```
Running "flutter pub get" in mobile...
Resolving dependencies...
Got dependencies!
```

**If you encounter errors:**
- **Flutter not found:** Add Flutter to PATH
- **Pub get failed:** Run `flutter clean` then `flutter pub get`

### Step 3: Configure API URL (Optional)

Edit `lib/core/api/api_client.dart` and update the base URL if needed:

```dart
static const String baseUrl = 'http://localhost:8585';
// For Android emulator, use: 'http://10.0.2.2:8585'
// For iOS simulator, use: 'http://localhost:8585'
// For physical device, use your computer's IP: 'http://192.168.1.X:8585'
```

### Step 4: Run on Emulator/Device

**Android:**
```bash
flutter run
```

**iOS (Mac only):**
```bash
flutter run -d ios
```

**Expected Output:**
```
Launching lib/main.dart on Android SDK built for x86_64 in debug mode...
Running Gradle task 'assembleDebug'...
✓ Built build/app/outputs/flutter-apk/app-debug.apk
Installing build/app/outputs/flutter-apk/app.apk...
Flutter run key commands.
```

**✅ Mobile app is running if:**
- Emulator/device shows the login screen
- No red error screens

**Press `q` to quit the app.**

---

## 🚀 Running the Application

### Complete Startup Sequence

**Terminal 1 - Backend:**
```bash
cd civic_issue_backend
python start.py
```

**Terminal 2 - Frontend Web:**
```bash
cd frontend/apps/web
npm run dev
```

**Terminal 3 - Mobile App (Optional):**
```bash
cd frontend/apps/mobile
flutter run
```

### Access Points

- **Web Dashboard:** http://localhost:5173
- **Backend API:** http://localhost:8585
- **API Documentation:** http://localhost:8585/docs
- **Health Check:** http://localhost:8585/

### Demo Credentials

**Admin Account:**
- Phone: `9876543212`
- Password: `admin123`

**Citizen Account:**
- Phone: `9876543215`
- Password: `password123`

**More accounts available:**
- Admin: `9876543210`, `9876543211`, `9876543213`, `9876543214`
- Citizen: `9876543216`, `9876543217`, `9876543218`, `9876543219`
- All passwords: `admin123` (admins) or `password123` (citizens)

---

## 🌱 Demo Data

### Add More Demo Issues

To add realistic demo environmental issues for presentations:

```bash
cd civic_issue_backend
python seed_demo_environmental_issues.py
```

This creates 25 additional environmental issues with:
- Realistic descriptions
- Images (from Unsplash)
- Proper locations (Mumbai coordinates)
- Department assignments
- Status mix (new, in_progress, resolved)

**To remove demo data:**
```sql
DELETE FROM issues WHERE description LIKE '%[DEMO]%';
```

See `docs/demo/DEMO_DATA_SEED_GUIDE.md` for details.

---

## 🔍 Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'fastapi'`**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Problem: `Port 8585 already in use`**
```bash
# Solution 1: Stop the process using port 8585
# Windows:
netstat -ano | findstr :8585
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8585 | xargs kill -9

# Solution 2: Change port in start.py
```

**Problem: `Database locked`**
```bash
# Solution: Close any database connections and restart
# Or delete civic_issues.db and run init_db.py again
```

**Problem: `bcrypt` installation fails**
```bash
# Windows: Install Visual C++ Build Tools
# Linux: sudo apt-get install python3-dev
# Mac: xcode-select --install
```

### Frontend Web Issues

**Problem: `npm install` fails**
```bash
# Solution 1: Clear npm cache
npm cache clean --force

# Solution 2: Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
npm install

# Solution 3: Use legacy peer deps
npm install --legacy-peer-deps
```

**Problem: `VITE` port 5173 already in use**
```bash
# Solution: Vite will automatically use next available port
# Or specify port: npm run dev -- --port 3000
```

**Problem: `Cannot connect to API`**
```bash
# Solution 1: Ensure backend is running
# Solution 2: Check VITE_API_URL in .env file
# Solution 3: Check CORS settings in backend
```

**Problem: `Blank page or build errors`**
```bash
# Solution: Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Mobile App Issues

**Problem: `flutter pub get` fails**
```bash
# Solution 1: Clean and reinstall
flutter clean
flutter pub get

# Solution 2: Update Flutter
flutter upgrade
flutter pub get
```

**Problem: `Cannot connect to API from mobile`**
```bash
# Android Emulator: Use http://10.0.2.2:8585
# iOS Simulator: Use http://localhost:8585
# Physical Device: Use your computer's IP (e.g., http://192.168.1.100:8585)

# Find your IP:
# Windows: ipconfig
# Linux/Mac: ifconfig or ip addr
```

**Problem: `Gradle build failed`**
```bash
# Solution: Clean build
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

**Problem: `Camera permission denied`**
```bash
# Android: Check AndroidManifest.xml has camera permissions
# iOS: Check Info.plist has camera permissions
# Physical device: Enable camera permission in device settings
```

**Problem: `Location/GPS not working`**
```bash
# Solution: Enable location services
# Android: Settings > Apps > Mobile > Permissions > Location
# iOS: Settings > Privacy > Location Services
```

### Common Issues

**Problem: `CORS errors in browser console`**
```bash
# Solution: Backend CORS is configured, but ensure:
# 1. Backend is running
# 2. Frontend URL is in allowed origins
# 3. Check browser console for specific error
```

**Problem: `401 Unauthorized errors`**
```bash
# Solution: 
# 1. Login again to get fresh token
# 2. Check token is stored in localStorage
# 3. Clear browser cache and cookies
```

**Problem: `Images not loading`**
```bash
# Solution:
# 1. Check image URLs are accessible
# 2. Check CORS for image domains
# 3. Verify media_urls field in database
```

---

## 📝 Quick Reference

### Backend Commands

```bash
# Start backend
cd civic_issue_backend
python start.py

# Initialize database
python init_db.py

# Add demo data
python seed_demo_environmental_issues.py

# Run tests
pytest tests/
```

### Frontend Web Commands

```bash
# Start dev server
cd frontend/apps/web
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Mobile App Commands

```bash
# Run app
cd frontend/apps/mobile
flutter run

# Clean build
flutter clean
flutter pub get

# Build APK (Android)
flutter build apk

# Build iOS (Mac only)
flutter build ios

# Run tests
flutter test
```

### Database Commands

```bash
# View database (SQLite)
sqlite3 civic_issue_backend/civic_issues.db

# SQL commands:
.tables                    # List all tables
SELECT * FROM users;       # View users
SELECT * FROM issues;      # View issues
.exit                      # Exit SQLite
```

---

## 🎯 Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] API docs accessible at `http://localhost:8585/docs`
- [ ] Frontend web loads at `http://localhost:5173`
- [ ] Can login with demo credentials
- [ ] Mobile app runs on emulator/device
- [ ] Can view issues in web dashboard
- [ ] Can view issues in mobile app
- [ ] Map shows issue pins
- [ ] Images load correctly
- [ ] Can create new issue (web or mobile)

---

## 📚 Additional Resources

- **Project Overview:** `docs/overview/PROJECT_OVERVIEW.md`
- **API Documentation:** `http://localhost:8585/docs` (when backend is running)
- **Web Dashboard Docs:** `docs/features/WEB_DASHBOARD_COMPLETE_DOCUMENTATION.md`
- **Mobile App Docs:** `docs/features/MOBILE_APP_COMPLETE_DOCUMENTATION.md`
- **Troubleshooting:** `docs/fixes/` folder

---

## 🆘 Getting Help

If you encounter issues not covered here:

1. **Check the logs:**
   - Backend: Terminal output
   - Frontend: Browser console (F12)
   - Mobile: `flutter logs` or Android Studio logcat

2. **Check documentation:**
   - `docs/` folder for detailed guides
   - `docs/fixes/` for common fixes

3. **Verify prerequisites:**
   - Python 3.8+
   - Node.js 16+
   - Flutter 3.6+

4. **Clean and reinstall:**
   - Backend: Delete `venv`, recreate, reinstall
   - Frontend: Delete `node_modules`, reinstall
   - Mobile: `flutter clean`, `flutter pub get`

---

## ✅ Success!

If everything is working:

- ✅ Backend running on port 8585
- ✅ Frontend web running on port 5173
- ✅ Mobile app running on emulator/device
- ✅ Can login and view issues
- ✅ All features working

**You're all set! 🎉**

---

**Last Updated:** 2024
**Project:** SwachhCity - Environmental & Waste Monitoring Platform


