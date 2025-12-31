# ⚡ SwachhCity - Quick Start (5 Minutes)

**For complete setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🚀 Quick Commands

### Backend
```bash
# Make sure you're in project root directory
# (where README.md and civic_issue_backend folder are located)

# Create virtual environment at root (.venv folder)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/Mac:
# source .venv/bin/activate

# Navigate to backend directory
cd civic_issue_backend

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start server
python start.py
```
✅ Backend: http://localhost:8585

### Frontend Web
```bash
cd frontend/apps/web
npm install
npm run dev
```
✅ Web: http://localhost:5173

### Mobile App
```bash
cd frontend/apps/mobile
flutter pub get
flutter run
```

---

## 🔌 VS Code Port Forwarding

If you're using VS Code with remote development or containers, forward port 8585:

### Method 1: Command Palette
1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Type: `Forward a Port`
3. Enter: `8585`
4. Click "Open in Browser" or access at `http://localhost:8585`

### Method 2: Ports Tab
1. Open VS Code's **Ports** tab (bottom panel)
2. Click **"Forward a Port"** or **"+"** button
3. Enter: `8585`
4. Port will appear in the list - click the globe icon to open in browser


IMPORTANT
            MAKE THE PORT PUBLIC
IMPORTANT
```

---

## 🔑 Demo Credentials

**Admin:** Phone `9876543212` | Password `admin123`  
**Citizen:** Phone `9876543219` | Password `password123`

---

## 📍 Access Points

- **Web Dashboard:** http://localhost:5173
- **API Docs:** http://localhost:8585/docs
- **Health Check:** http://localhost:8585/

---

## ⚠️ Troubleshooting

**Backend not starting?**
- Check Python 3.8+ installed
- Create `.venv` at project root: `python -m venv .venv`
- Activate virtual environment: `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (Linux/Mac)
- Install dependencies: `cd civic_issue_backend && pip install -r requirements.txt`
- If using VS Code remote: Forward port 8585 (see VS Code Port Forwarding section above)

**Frontend not loading?**
- Check Node.js 16+ installed
- Delete `node_modules`, run `npm install`
- Check backend is running

**Mobile app errors?**
- Check Flutter 3.6+ installed
- Run `flutter clean && flutter pub get`
- For API connection: Use `10.0.2.2:8585` (Android) or your computer's IP

---

**Full Guide:** [SETUP_GUIDE.md](./SETUP_GUIDE.md)


