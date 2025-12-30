# 🌱 SwachhCity - Environmental & Waste Monitoring Platform

A comprehensive full-stack platform for monitoring environmental health, reporting waste and pollution issues, and tracking cleanup progress with AI-powered detection, real-time updates, and advanced analytics.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95.2-green.svg)
![React](https://img.shields.io/badge/React-19.0-blue.svg)
![Flutter](https://img.shields.io/badge/Flutter-3.6+-blue.svg)

## 📖 Overview

**SwachhCity** enables citizens to report environmental issues (waste dumps, pollution, water contamination, illegal dumping, etc.) with photos and location data. Environmental authorities can efficiently monitor, prioritize, and track cleanup progress through a powerful dashboard with analytics and real-time updates.

### ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based with encrypted payloads
- 📸 **Photo Upload** - Direct-to-storage uploads with presigned URLs
- 🗺️ **Location Services** - GPS-based environmental issue reporting and hotspot mapping
- 🤖 **AI Detection** - YOLO model for automatic environmental issue detection (waste, pollution, etc.)
- 💬 **Real-time Updates** - WebSocket notifications and chat
- 📊 **Analytics Dashboard** - Environmental KPIs, pollution heatmaps, and cleanup insights
- 🌿 **Eco-Score System** - User contribution tracking for environmental monitoring
- 📱 **Multi-platform** - Web and mobile applications

## 🚀 Quick Start

> **📖 For complete setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Prerequisites

- Python 3.8+
- Node.js 16+
- Flutter 3.6+ (for mobile app)

### Backend Setup (2 minutes)

```bash
cd civic_issue_backend
pip install -r requirements.txt
python init_db.py
python start.py
```

✅ Server running at `http://localhost:8585`

### Frontend Web Setup (1 minute)

```bash
cd frontend/apps/web
npm install
npm run dev
```

✅ Frontend running at `http://localhost:5173`

### Mobile App Setup

```bash
cd frontend/apps/mobile
flutter pub get
flutter run
```

### Demo Credentials

**Admin:**
- Phone: `9876543210` | Password: `admin123`

**Citizen:**
- Phone: `9876543215` | Password: `password123`

## 📚 Documentation

- **[🚀 Complete Setup Guide](./SETUP_GUIDE.md)** - **START HERE!** Complete step-by-step setup instructions
- **[📖 Project Overview](./docs/overview/PROJECT_OVERVIEW.md)** - Complete project overview and architecture
- **[⚙️ Quick Start Guide](./docs/setup/QUICK_START.md)** - Get up and running in 5 minutes
- **[✨ Web Dashboard Docs](./docs/features/WEB_DASHBOARD_COMPLETE_DOCUMENTATION.md)** - Complete web dashboard documentation
- **[✨ Mobile App Docs](./docs/features/MOBILE_APP_COMPLETE_DOCUMENTATION.md)** - Complete mobile app documentation
- **[🔧 Troubleshooting & Fixes](./docs/fixes/)** - Common issues and solutions
- **[💻 API Reference](./docs/development/apiEndPoints.md)** - API endpoints documentation
- **[API Documentation](http://localhost:8585/docs)** - Interactive API docs (when server is running)

See [docs/README.md](./docs/README.md) for the complete documentation index.

## 🏗️ Architecture

### Backend
- **Framework:** FastAPI (Python)
- **Database:** SQLite (default) / PostgreSQL (production)
- **Authentication:** JWT with AES-GCM encryption
- **Real-time:** WebSocket
- **AI/ML:** YOLOv8 for image detection

### Frontend Web
- **Framework:** React + Vite
- **State Management:** Redux Toolkit
- **UI:** Tailwind CSS + Radix UI
- **Maps:** Leaflet

### Mobile
- **Framework:** Flutter (Dart)
- **Features:** Camera, GPS, Real-time updates

## 📁 Project Structure

```
civic-issue-reporter/
├── civic_issue_backend/     # FastAPI Backend
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Core utilities
│   │   ├── models/          # Database models
│   │   ├── services/        # Business logic
│   │   └── workers/         # Background tasks
│   └── static/              # Static frontend
├── frontend/
│   └── apps/
│       ├── web/             # React Web App
│       └── mobile/          # Flutter Mobile App
├── docs/                    # 📚 All Documentation
│   ├── overview/            # Project overview
│   ├── setup/               # Setup guides
│   ├── fixes/               # Bug fixes & troubleshooting
│   ├── features/            # Feature documentation
│   ├── development/         # Development guides
│   └── status/              # Project status
├── Model_training/          # AI Model Training
└── docker-compose.yml       # Docker setup
```

## 🎯 Features

### For Citizens
- ✅ User registration and login
- ✅ Environmental issue reporting with photos
- ✅ GPS location detection
- ✅ View environmental hotspots on map
- ✅ Upvote urgent issues
- ✅ Real-time cleanup status updates
- ✅ Chat with environmental authorities
- ✅ Track personal environmental impact (Eco-Score)

### For Environmental Authorities
- ✅ Advanced environmental report filtering
- ✅ Department-based assignment (Waste Management, Water Quality, etc.)
- ✅ Cleanup status management
- ✅ Environmental analytics dashboard
- ✅ Pollution heatmap visualization
- ✅ User management
- ✅ Response time tracking

### AI Features
- ✅ Automatic environmental issue detection (garbage dumps, pollution, waste)
- ✅ Severity estimation
- ✅ Duplicate detection
- ✅ Text analysis for category suggestion

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Issues
- `POST /issues/initiate-upload` - Get upload URL
- `POST /issues` - Create issue
- `GET /issues` - List issues (with filters)
- `POST /issues/{id}/upvote` - Upvote issue

### Admin
- `GET /admin/issues` - List all issues
- `PATCH /admin/issues/{id}` - Update issue
- `DELETE /admin/issues/{id}` - Delete issue

### Analytics
- `GET /analytics/stats` - Get KPIs
- `GET /analytics/heatmap` - Get heatmap data

### AI
- `POST /ai/detect` - Detect issues in image

**Full API Documentation:** Visit `http://localhost:8585/docs` when server is running

## 🗄️ Database Schema

- **Users** - User accounts (citizens and admins)
- **Issues** - Reported civic issues
- **Upvotes** - Issue upvotes
- **Notifications** - User notifications
- **Messages** - Chat messages

See [Complete Setup Guide](./docs/setup/COMPLETE_SETUP_GUIDE.md) for detailed schema.

## 🔒 Security

- ✅ JWT token-based authentication
- ✅ AES-GCM encryption for sensitive data
- ✅ Password hashing with bcrypt
- ✅ Phone number encryption
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd civic_issue_backend
pytest tests/

# Frontend tests
cd frontend/apps/web
npm test
```

### Code Style

- **Python:** PEP 8
- **JavaScript:** ESLint
- **Dart:** Dart style guide

## 📦 Deployment

### Backend
- Use Gunicorn/uWSGI for production
- Configure Nginx reverse proxy
- Use PostgreSQL for production database
- Enable SSL/TLS

### Frontend
- Build: `npm run build`
- Serve via Nginx or CDN

### Mobile
- Build release APK/IPA
- Sign with production keys

See [Complete Setup Guide](./docs/setup/COMPLETE_SETUP_GUIDE.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is provided as-is for demonstration and development purposes.

## 🆘 Support

- Check [Troubleshooting](./docs/fixes/) folder for common issues and solutions
- Review API documentation at `/docs`
- Check existing issues

## 🎉 Demo Data

The system comes pre-loaded with:
- ✅ 5 Admin accounts (different departments)
- ✅ 5 Citizen accounts
- ✅ 50 Sample issues
- ✅ Sample upvotes and interactions

## 📊 Tech Stack

**Backend:**
- FastAPI, SQLAlchemy, SQLite/PostgreSQL
- JWT, WebSocket, Celery, Redis
- YOLOv8, PyTorch

**Frontend Web:**
- React, Vite, Redux Toolkit
- Tailwind CSS, Leaflet
- Socket.io

**Mobile:**
- Flutter, Dart
- Dio, Geolocator, Camera

---

## 🚀 Get Started Now!

1. **📖 Complete Setup Guide:** See [SETUP_GUIDE.md](./SETUP_GUIDE.md) - **START HERE!**
2. **Quick Start:** See [docs/setup/QUICK_START.md](./docs/setup/QUICK_START.md)
3. **API Docs:** Visit `http://localhost:8585/docs` (when server is running)
4. **Documentation Index:** See [docs/README.md](./docs/README.md)

---

**Made with ❤️ for better civic engagement**

