# ⚡ SwachhCity - Quick Start (5 Minutes)

**For complete setup, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

---

## 🚀 Quick Commands

### Backend
```bash
cd civic_issue_backend
pip install -r requirements.txt
python init_db.py
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
- Activate virtual environment
- Install dependencies: `pip install -r requirements.txt`

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

