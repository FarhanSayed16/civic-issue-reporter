# 🏛️ Civic Issue Reporter

A comprehensive full-stack platform for reporting and managing civic issues with AI-powered detection, real-time updates, and advanced analytics.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95.2-green.svg)
![React](https://img.shields.io/badge/React-19.0-blue.svg)
![Flutter](https://img.shields.io/badge/Flutter-3.6+-blue.svg)

## 📖 Overview

**Civic Issue Reporter** enables citizens to report civic issues (potholes, streetlights, garbage, water issues, etc.) with photos and location data. Administrators can efficiently manage, track, and resolve these issues through a powerful dashboard with analytics and real-time updates.

### ✨ Key Features

- 🔐 **Secure Authentication** - JWT-based with encrypted payloads
- 📸 **Photo Upload** - Direct-to-storage uploads with presigned URLs
- 🗺️ **Location Services** - GPS-based issue reporting and discovery
- 🤖 **AI Detection** - YOLO model for automatic issue detection
- 💬 **Real-time Updates** - WebSocket notifications and chat
- 📊 **Analytics Dashboard** - KPIs, heatmaps, and insights
- 👥 **Trust Score System** - User reputation tracking
- 📱 **Multi-platform** - Web and mobile applications

## 🚀 Quick Start

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

### Demo Credentials

**Admin:**
- Phone: `9876543210` | Password: `admin123`

**Citizen:**
- Phone: `9876543215` | Password: `password123`

## 📚 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get up and running in 5 minutes
- **[Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md)** - Comprehensive documentation
- **[API Documentation](http://localhost:8585/docs)** - Interactive API docs (when server is running)

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
├── Model_training/          # AI Model Training
└── docker-compose.yml       # Docker setup
```

## 🎯 Features

### For Citizens
- ✅ User registration and login
- ✅ Issue reporting with photos
- ✅ GPS location detection
- ✅ View nearby issues on map
- ✅ Upvote issues
- ✅ Real-time status updates
- ✅ Chat with administrators

### For Administrators
- ✅ Advanced issue filtering
- ✅ Department-based assignment
- ✅ Status management
- ✅ Analytics dashboard
- ✅ Heatmap visualization
- ✅ User management
- ✅ Trust score tracking

### AI Features
- ✅ Automatic issue detection (potholes, cracks, manholes)
- ✅ Severity estimation
- ✅ Duplicate detection
- ✅ Text analysis

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

See [Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md) for detailed schema.

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

See [Complete Setup Guide](./COMPLETE_SETUP_GUIDE.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is provided as-is for demonstration and development purposes.

## 🆘 Support

- Check [Troubleshooting](./COMPLETE_SETUP_GUIDE.md#troubleshooting) section
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

1. **Quick Start:** See [QUICK_START.md](./QUICK_START.md)
2. **Full Documentation:** See [COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)
3. **API Docs:** Visit `http://localhost:8585/docs` (when server is running)

---

**Made with ❤️ for better civic engagement**

