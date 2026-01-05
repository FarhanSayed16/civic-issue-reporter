# 🏛️ Civic Issue Reporter - Complete Setup & Documentation Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Backend Setup](#backend-setup)
5. [Frontend Web Setup](#frontend-web-setup)
6. [Mobile App Setup](#mobile-app-setup)
7. [Database Setup](#database-setup)
8. [Configuration](#configuration)
9. [Running the Application](#running-the-application)
10. [API Documentation](#api-documentation)
11. [Features Overview](#features-overview)
12. [Demo Credentials](#demo-credentials)
13. [Troubleshooting](#troubleshooting)
14. [Development Guidelines](#development-guidelines)

---

## 📖 Project Overview

**Civic Issue Reporter** is a comprehensive full-stack platform for reporting and managing civic issues (potholes, streetlights, garbage, water issues, etc.). The system enables citizens to report issues with photos and location data, while administrators can manage, track, and resolve these issues efficiently.

### Key Features

- ✅ **User Authentication**: JWT-based secure authentication with encrypted payloads
- ✅ **Issue Reporting**: Photo uploads, GPS location, category selection
- ✅ **AI-Powered Detection**: YOLO model for automatic issue detection in images
- ✅ **Real-time Updates**: WebSocket notifications for live status updates
- ✅ **Admin Dashboard**: Advanced filtering, analytics, and issue management
- ✅ **Trust Score System**: User reputation tracking
- ✅ **Chat System**: Communication between reporters and admins
- ✅ **Analytics & Heatmaps**: Data visualization and insights

### Tech Stack

- **Backend**: FastAPI (Python), SQLAlchemy, SQLite
- **Frontend Web**: React, Vite, Redux Toolkit, Tailwind CSS
- **Mobile**: Flutter (Dart)
- **AI/ML**: YOLOv8 (Ultralytics), PyTorch
- **Real-time**: WebSocket
- **Storage**: S3/MinIO compatible storage

---

## 🔧 Prerequisites

### Required Software

1. **Python 3.8+**
   ```bash
   python --version  # Should be 3.8 or higher
   ```

2. **Node.js 16+ and npm**
   ```bash
   node --version
   npm --version
   ```

3. **Flutter SDK 3.6+** (for mobile app)
   ```bash
   flutter --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### ⚠️ Important: Virtual Environment Best Practice

**Use ONE virtual environment at project root, NOT multiple venv folders!**

See [SETUP_BEST_PRACTICES.md](./SETUP_BEST_PRACTICES.md) for detailed guidance.

### Optional (for production)

- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL** (for production database)
- **Redis** (for caching and background tasks)
- **S3/MinIO** (for file storage)

---

## 📁 Project Structure

```
civic-issue-reporter/
├── civic_issue_backend/          # FastAPI Backend
│   ├── app/
│   │   ├── api/                  # API route handlers
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── issues.py        # Issue management endpoints
│   │   │   ├── admin.py         # Admin dashboard endpoints
│   │   │   ├── analytics.py     # Analytics endpoints
│   │   │   ├── ai.py            # AI detection endpoints
│   │   │   └── messages.py      # Chat endpoints
│   │   ├── core/                 # Core utilities
│   │   │   ├── config.py        # Configuration
│   │   │   ├── db.py            # Database setup
│   │   │   ├── security.py     # JWT security
│   │   │   ├── encryption.py   # AES-GCM encryption
│   │   │   └── websocket.py    # WebSocket manager
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py         # User model
│   │   │   └── issue.py        # Issue, Notification, Message models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── issue_service.py
│   │   │   ├── ai_service.py
│   │   │   └── analytics_service.py
│   │   └── workers/             # Background tasks
│   ├── static/                  # Static frontend files
│   ├── init_db.py              # Database initialization
│   ├── start.py                # Startup script
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   └── apps/
│       ├── web/                 # React Web Application
│       │   ├── src/
│       │   │   ├── pages/       # Page components
│       │   │   ├── components/  # UI components
│       │   │   ├── features/    # Redux slices & API
│       │   │   ├── store/       # Redux store
│       │   │   └── hooks/       # Custom hooks
│       │   ├── package.json
│       │   └── vite.config.js
│       │
│       └── mobile/              # Flutter Mobile App
│           ├── lib/            # Dart source code
│           ├── pubspec.yaml   # Flutter dependencies
│           └── android/       # Android config
│
├── Model_training/              # AI Model Training
│   ├── model_training.py       # YOLO training script
│   └── test_model.py          # Model testing
│
└── docker-compose.yml          # Docker configuration
```

---

## 🚀 Backend Setup

### ⚡ Quick Setup (Automated)

**Windows PowerShell:**
```bash
.\setup_clean.ps1
```

**Linux/Mac:**
```bash
chmod +x setup_clean.sh
./setup_clean.sh
```

### Manual Setup

### Step 1: Clean Up Existing Virtual Environments

**Find and remove all existing venv folders:**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .\venv, .\.venv, .\civic_issue_backend\venv -ErrorAction SilentlyContinue

# Linux/Mac
rm -rf venv .venv civic_issue_backend/venv
```

### Step 2: Create ONE Virtual Environment at Project Root

```bash
# Navigate to project root (NOT civic_issue_backend)
cd E:\civic-issue-reporter  # or your project path

# Create virtual environment
python -m venv .venv

# Activate it
# Windows:
.venv\Scripts\activate

# Linux/Mac:
source .venv/bin/activate
```

**✅ You should see `(.venv)` in your prompt**

### Step 3: Navigate to Backend and Install Dependencies

```bash
cd civic_issue_backend
pip install --upgrade pip
pip install -r requirements.txt
```

**Key Dependencies:**
- `fastapi==0.95.2` - Web framework
- `uvicorn[standard]==0.21.1` - ASGI server
- `sqlalchemy==2.0.15` - ORM
- `python-jose==3.3.0` - JWT handling
- `passlib[bcrypt]==1.7.4` - Password hashing
- `ultralytics==8.2.103` - YOLO model
- `cryptography==42.0.7` - Encryption

### Step 4: Environment Configuration (Optional)

Create a `.env` file in `civic_issue_backend/` directory:

```env
# Database
DATABASE_URL=sqlite:///./civic_issues.db

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256

# Redis (Optional)
REDIS_URL=redis://localhost:6379/0

# Storage (Optional - for S3/MinIO)
S3_BUCKET=civic-issues
S3_ENDPOINT_URL=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# AI Model
YOLO_MODEL_PATH=app/models/yolo/best.pt
AI_ENABLE_AUTOTAG=false

# hCaptcha (Optional)
HCAPTCHA_SECRET_KEY=your-hcaptcha-secret
HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

### Step 5: Initialize Database

```bash
python init_db.py
```

This will:
- Create database tables
- Add sample users (5 admins, 5 citizens)
- Add 50 sample issues
- Add sample upvotes

**Output:**
```
Creating database tables...
Adding sample users...
Adding sample issues...
Database initialized successfully!
Created 10 users (5 admins, 5 citizens)
Created 50 verified issues
```

### Step 6: Verify Setup

Check if `civic_issues.db` file is created in `civic_issue_backend/` directory.

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

**Key Dependencies:**
- `react@^19.0.0` - UI library
- `@reduxjs/toolkit@^2.6.0` - State management
- `react-router-dom@^7.2.0` - Routing
- `axios@^1.8.1` - HTTP client
- `leaflet@^1.9.4` - Map library
- `socket.io-client@^4.8.1` - WebSocket client
- `tailwindcss@^3.3.3` - CSS framework

### Step 3: Configuration

Update API base URL in `src/conf/conf.js` if needed:

```javascript
export const API_BASE_URL = 'http://localhost:8585';
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

**Build for Production:**
```bash
npm run build
npm run preview
```

---

## 📱 Mobile App Setup

### Step 1: Navigate to Mobile Directory

```bash
cd frontend/apps/mobile
```

### Step 2: Install Flutter Dependencies

```bash
flutter pub get
```

**Key Dependencies:**
- `dio@^5.4.3` - HTTP client
- `geolocator@^12.0.0` - GPS location
- `camera@^0.11.0` - Camera access
- `flutter_map@^6.1.0` - Map integration
- `web_socket_channel@^2.4.0` - WebSocket

### Step 3: Configure API Endpoint

Update API base URL in `lib/services/api_service.dart`:

```dart
const String API_BASE_URL = 'http://localhost:8585';
```

For Android emulator, use `http://10.0.2.2:8585`
For iOS simulator, use `http://localhost:8585`

### Step 4: Run on Device/Emulator

**Android:**
```bash
flutter run
```

**iOS:**
```bash
flutter run
```

**Build APK:**
```bash
flutter build apk
```

---

## 🗄️ Database Setup

### SQLite (Default - No Setup Required)

The project uses SQLite by default, which requires no additional setup. The database file `civic_issues.db` is created automatically.

### PostgreSQL (Production)

1. **Update `.env` file:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/civic_db
```

2. **Run migrations:**
```bash
alembic upgrade head
```

### Database Schema

**Users Table:**
- `id` (Primary Key)
- `full_name`
- `phone_number` (Unique)
- `phone_number_hash` (Encrypted)
- `password_hash`
- `role` (citizen/admin)
- `department`
- `ward`
- `trust_score`
- `is_active`
- `profile_picture_url`
- `created_at`, `updated_at`

**Issues Table:**
- `id` (Primary Key)
- `reporter_id` (Foreign Key)
- `category`
- `description`
- `status` (new/in_progress/resolved/spam)
- `priority` (high/medium/low)
- `severity_score` (0-1)
- `lat`, `lng` (coordinates)
- `media_urls` (JSON array)
- `assigned_department`
- `assigned_admin_id` (Foreign Key)
- `upvote_count`
- `address_line1`, `address_line2`, `street`, `landmark`, `pincode`
- `is_anonymous`, `is_verified`
- `created_at`, `updated_at`

**Upvotes Table:**
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `issue_id` (Foreign Key)
- `created_at`

**Notifications Table:**
- `id` (Primary Key)
- `user_id` (Foreign Key)
- `issue_id` (Foreign Key)
- `type`
- `message`
- `read`
- `created_at`

**Messages Table:**
- `id` (Primary Key)
- `issue_id` (Foreign Key)
- `sender_id` (Foreign Key)
- `message`
- `is_admin_message`
- `created_at`

---

## ⚙️ Configuration

### Backend Configuration

**File: `civic_issue_backend/app/core/config.py`**

Key settings:
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `ENCRYPTION_KEY`: AES-GCM encryption key
- `YOLO_MODEL_PATH`: Path to YOLO model file
- `HCAPTCHA_SECRET_KEY`: hCaptcha verification (optional)

### Frontend Configuration

**File: `frontend/apps/web/src/conf/conf.js`**

```javascript
export const API_BASE_URL = 'http://localhost:8585';
export const WS_BASE_URL = 'ws://localhost:8585';
```

### Mobile Configuration

**File: `frontend/apps/mobile/lib/services/api_service.dart`**

```dart
const String API_BASE_URL = 'http://localhost:8585';
const String WS_BASE_URL = 'ws://localhost:8585';
```

---

## 🏃 Running the Application

### Quick Start (Backend Only)

```bash
cd civic_issue_backend
python start.py
```

This will:
- Initialize database (if not exists)
- Start the FastAPI server on `http://localhost:8585`
- Serve static frontend at `http://localhost:8585/frontend`
- API docs at `http://localhost:8585/docs`

### Manual Start (Backend)

```bash
cd civic_issue_backend

# Initialize database
python init_db.py

# Start server
uvicorn app.main:app --reload --port 8585 --host 0.0.0.0
```

### Full Stack (Backend + Frontend)

**Terminal 1 - Backend:**
```bash
cd civic_issue_backend
python start.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend/apps/web
npm run dev
```

**Access:**
- Backend API: `http://localhost:8585`
- API Docs: `http://localhost:8585/docs`
- Frontend Web: `http://localhost:5173`
- Static Frontend: `http://localhost:8585/frontend`

### Docker Deployment

```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Update DATABASE_URL in .env to use PostgreSQL
# Then start backend
cd civic_issue_backend
python start.py
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:8585
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone_number": "9876543210",
  "password": "encrypted_password_base64",
  "fp_check": "encrypted_fp_base64"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "phone_number": "9876543210",
  "password": "encrypted_password_base64"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "token_type": "bearer"
}
```

### Issue Endpoints

#### Get Upload URL
```http
POST /issues/initiate-upload?filename=photo.jpg
Authorization: Bearer {token}
```

#### Create Issue
```http
POST /issues
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Potholes",
  "description": "Large pothole on main road",
  "lat": 19.0760,
  "lng": 72.8777,
  "ward": "Andheri",
  "media_urls": ["https://storage.url/photo.jpg"]
}
```

#### Get Issues
```http
GET /issues?lat=19.0760&lng=72.8777&radius=5&category=Potholes&status=new
```

#### Upvote Issue
```http
POST /issues/{issue_id}/upvote
Authorization: Bearer {token}
```

### Admin Endpoints

#### Get Admin Issues
```http
GET /admin/issues?status=new&category=Potholes&sort_by=created_at&sort_order=desc
Authorization: Bearer {admin_token}
```

#### Update Issue
```http
PATCH /admin/issues/{issue_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### Delete Issue
```http
DELETE /admin/issues/{issue_id}
Authorization: Bearer {admin_token}
```

### Analytics Endpoints

#### Get Statistics
```http
GET /analytics/stats
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "total_issues": 125,
  "resolved_today": 15,
  "pending": 42,
  "in_progress": 23,
  "resolved_this_week": 45,
  "avg_resolution_time_hours": 24.5,
  "top_category": "Potholes",
  "top_ward": "Andheri"
}
```

#### Get Heatmap Data
```http
GET /analytics/heatmap?status=new&category=Potholes
Authorization: Bearer {admin_token}
```

### AI Endpoints

#### Detect Issues in Image
```http
POST /ai/detect
Content-Type: application/json

{
  "image_data_url": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "detections": [
    {
      "label": "pothole",
      "confidence": 0.95,
      "bbox": [100, 200, 300, 400]
    }
  ]
}
```

### WebSocket Endpoints

#### Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:8585/ws/updates/{user_id}?token={jwt_token}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

### Interactive API Documentation

Visit `http://localhost:8585/docs` for Swagger UI with interactive API testing.

---

## ✨ Features Overview

### For Citizens

1. **User Registration & Login**
   - Secure JWT authentication
   - Encrypted password transmission
   - Profile management

2. **Issue Reporting**
   - Photo upload with presigned URLs
   - GPS location detection
   - Category selection
   - Detailed description
   - Address information

3. **Issue Discovery**
   - View nearby issues on map
   - Filter by category/status
   - Upvote issues
   - Track personal reports

4. **Real-time Updates**
   - WebSocket notifications
   - Status change alerts
   - Chat with admins

### For Administrators

1. **Dashboard**
   - KPI statistics
   - Issue filtering and sorting
   - Department-based views
   - Bulk operations

2. **Issue Management**
   - Update status
   - Assign to departments
   - Add internal notes
   - Delete spam reports

3. **Analytics**
   - Real-time statistics
   - Heatmap visualization
   - Category/ward analysis
   - Performance metrics

4. **User Management**
   - View all users
   - Trust score tracking
   - User activity monitoring

### AI Features

1. **Image Detection**
   - Automatic issue detection (potholes, cracks, manholes)
   - Confidence scoring
   - Bounding box coordinates

2. **Severity Estimation**
   - NLP-based severity scoring
   - Priority detection
   - Text analysis

3. **Duplicate Detection**
   - Image similarity checking
   - Location-based duplicate detection
   - Description similarity

---

## 🔑 Demo Credentials

### Admin Accounts

| Name | Phone | Password | Department |
|------|-------|----------|------------|
| Municipal Commissioner | 9876543210 | admin123 | Municipal Corporation |
| Road Department Head | 9876543211 | admin123 | Road Maintenance |
| Water Department Head | 9876543212 | admin123 | Water Department |
| Waste Management Head | 9876543213 | admin123 | Waste Management |
| Traffic Department Head | 9876543214 | admin123 | Traffic Department |

### Citizen Accounts

| Name | Phone | Password | Trust Score |
|------|-------|----------|-------------|
| Rajesh Kumar | 9876543215 | password123 | 95.0 |
| Priya Sharma | 9876543216 | password123 | 92.0 |
| Amit Patel | 9876543217 | password123 | 88.0 |
| Sunita Singh | 9876543218 | password123 | 90.0 |
| Vikram Mehta | 9876543219 | password123 | 85.0 |

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: `ModuleNotFoundError: No module named 'app.core.key_manager'`**
```bash
# Solution: The key_manager.py file should exist in civic_issue_backend/app/core/
# If missing, it has been created. Verify:
ls civic_issue_backend/app/core/key_manager.py

# If still missing, reinstall dependencies:
pip install -r requirements.txt --force-reinstall
```

**Problem: Database not found**
```bash
# Solution: Run database initialization
cd civic_issue_backend
python init_db.py
```

**Problem: Port 8585 already in use**
```bash
# Solution: Use a different port
uvicorn app.main:app --reload --port 8586
```

**Problem: Module not found errors**
```bash
# Solution: Make sure venv is activated and dependencies are installed
# Check which Python you're using:
which python  # Should show .venv path

# Reinstall dependencies:
pip install -r requirements.txt --force-reinstall
```

**Problem: Multiple virtual environments causing confusion**
```bash
# Solution: Delete all venv folders and create ONE at project root
# See SETUP_BEST_PRACTICES.md for details
```

**Problem: YOLO model not found**
```bash
# Solution: Model is optional, AI features will be disabled
# To enable: Place best.pt in app/models/yolo/
```

### Frontend Issues

**Problem: Cannot connect to API**
```bash
# Solution: Check API_BASE_URL in src/conf/conf.js
# Ensure backend is running on correct port
```

**Problem: npm install fails**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: Build errors**
```bash
# Solution: Check Node.js version (should be 16+)
node --version
```

### Mobile Issues

**Problem: API connection fails on Android**
```bash
# Solution: Use 10.0.2.2 instead of localhost
const String API_BASE_URL = 'http://10.0.2.2:8585';
```

**Problem: Camera permission denied**
```bash
# Solution: Add permissions in android/app/src/main/AndroidManifest.xml
<uses-permission android:name="android.permission.CAMERA" />
```

**Problem: Flutter pub get fails**
```bash
# Solution: Update Flutter
flutter upgrade
flutter pub get
```

### Database Issues

**Problem: SQLite locked**
```bash
# Solution: Close all database connections
# Restart the backend server
```

**Problem: Migration errors**
```bash
# Solution: Delete database and reinitialize
rm civic_issues.db
python init_db.py
```

---

## 👨‍💻 Development Guidelines

### Code Structure

1. **Backend**
   - API routes in `app/api/`
   - Business logic in `app/services/`
   - Database models in `app/models/`
   - Schemas in `app/schemas/`

2. **Frontend**
   - Pages in `src/pages/`
   - Components in `src/components/`
   - Redux slices in `src/features/`
   - API calls in `src/features/api/`

### Adding New Features

1. **New API Endpoint:**
   - Add route in `app/api/`
   - Add service method in `app/services/`
   - Add schema in `app/schemas/`
   - Update API documentation

2. **New Frontend Page:**
   - Create component in `src/pages/`
   - Add route in `src/router.jsx`
   - Add navigation link if needed

3. **New Database Model:**
   - Create model in `app/models/`
   - Add to `create_tables()` in `app/core/db.py`
   - Create migration if using Alembic

### Testing

**Backend:**
```bash
# Run tests
pytest tests/
```

**Frontend:**
```bash
# Run tests
npm test
```

### Code Style

- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint configuration
- **Dart**: Follow Dart style guide

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature
```

---

## 📝 Additional Notes

### Security Considerations

1. **Change default passwords** in production
2. **Use strong SECRET_KEY** in production
3. **Enable HTTPS** for production
4. **Configure CORS** properly
5. **Enable hCaptcha** for production
6. **Use environment variables** for sensitive data

### Performance Optimization

1. **Database Indexing**: Add indexes for frequently queried fields
2. **Caching**: Use Redis for caching frequently accessed data
3. **Image Optimization**: Compress images before upload
4. **Pagination**: Use pagination for large datasets
5. **CDN**: Use CDN for static assets

### Deployment

**Backend:**
- Use Gunicorn or uWSGI for production
- Set up reverse proxy (Nginx)
- Use PostgreSQL for production database
- Enable SSL/TLS certificates

**Frontend:**
- Build static files: `npm run build`
- Serve via Nginx or CDN
- Configure API proxy

**Mobile:**
- Build release APK/IPA
- Sign with production keys
- Publish to app stores

---

## 📞 Support

For issues, questions, or contributions:

1. Check existing documentation
2. Review API documentation at `/docs`
3. Check troubleshooting section
4. Review code comments

---

## 📄 License

This project is provided as-is for demonstration and development purposes.

---

## 🎉 Getting Started Checklist

- [ ] Install Python 3.8+
- [ ] Install Node.js 16+
- [ ] Clone the repository
- [ ] Set up backend (install dependencies, initialize database)
- [ ] Set up frontend web (install dependencies)
- [ ] Start backend server
- [ ] Start frontend web server
- [ ] Test login with demo credentials
- [ ] Report a test issue
- [ ] Access admin dashboard
- [ ] Explore API documentation

---

**Happy Coding! 🚀**

