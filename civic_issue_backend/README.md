# 🏛️ Civic Issue Management System - Complete Full-Stack Solution

A comprehensive civic issue reporting and management system with a complete frontend interface, database integration, and advanced admin dashboard capabilities.

## 🎉 **Complete System Features**

### **🌐 Full-Stack Web Application**
- ✅ **Complete HTML/CSS/JavaScript Frontend** - Ready-to-use web interface
- ✅ **SQLite Database** - Easy-to-use database (no setup required)
- ✅ **RESTful API** - Complete backend with all endpoints
- ✅ **Real-time Updates** - WebSocket support for live notifications
- ✅ **File Upload System** - Secure photo upload with presigned URLs

### **👥 Citizen Features**
- ✅ **User Registration & Login** - JWT-based authentication
- ✅ **Issue Reporting** - Two-step photo upload process
- ✅ **Location Services** - GPS coordinates and nearby issue discovery
- ✅ **Issue Upvoting** - Crowdsourcing for priority identification
- ✅ **Personal Dashboard** - Track your reported issues
- ✅ **Real-time Notifications** - Live status updates

### **⚙️ Admin Dashboard**
- ✅ **Advanced Filtering** - Filter by status, ward, category, date
- ✅ **Issue Management** - Update status, assign departments, add notes
- ✅ **User Management** - View and manage all users
- ✅ **Analytics Dashboard** - Real-time KPIs and statistics
- ✅ **Heatmap Visualization** - Geographic issue distribution
- ✅ **Bulk Operations** - Mass update and delete capabilities

---

## 🚀 **Quick Start Guide**

### **1. Install Dependencies**
```bash
cd civic_issue_backend
pip install -r requirements.txt
```

### **2. Start the Application (Easy Way)**
```bash
python start.py
```
This will automatically initialize the database and start the server.

### **3. Alternative: Manual Start**
```bash
# Initialize database
python init_db.py

# Start server
uvicorn app.main:app --reload --port 8585
```

### **4. Access the Application**
- **🌐 Web Interface:** http://localhost:8585/frontend
- **📚 API Documentation:** http://localhost:8585/docs
- **🔧 Alternative Docs:** http://localhost:8585/redoc
- **❤️ Health Check:** http://localhost:8585/

---

## 🎯 **Demo Credentials**

The system comes with pre-populated sample data:

### **Citizen Users:**
- **Phone:** 9876543210 | **Password:** password123
- **Phone:** 9876543211 | **Password:** password123
- **Phone:** 9876543213 | **Password:** password123
- **Phone:** 9876543214 | **Password:** password123

### **Admin User:**
- **Phone:** 9876543212 | **Password:** admin123

---

## 🖥️ **Frontend Interface Overview**

### **📱 Login/Register Tab**
- Clean authentication interface
- User registration with validation
- Secure login with JWT tokens
- Auto-login persistence

### **📝 Report Issues Tab**
- Two-step photo upload process
- Location input with GPS detection
- Category and ward selection
- Personal issue tracking

### **🗺️ View Issues Tab**
- Interactive issue map/list
- Advanced filtering options
- Real-time upvoting system
- Location-based discovery

### **⚙️ Admin Dashboard Tab**
- Comprehensive issue management
- Advanced filtering and sorting
- Bulk operations interface
- User management tools

### **📊 Analytics Tab**
- Real-time KPI dashboard
- Interactive heatmap visualization
- Performance metrics
- Category and ward analysis

---

## 🗄️ **Database Schema**

### **Users Table**
```sql
- id (Primary Key)
- full_name
- phone_number (Unique)
- password_hash
- role (citizen/admin)
- trust_score
- is_active
- created_at, updated_at
```

### **Issues Table**
```sql
- id (Primary Key)
- reporter_id (Foreign Key)
- category
- description
- status (new/in_progress/resolved)
- lat, lng (coordinates)
- ward
- media_urls (Array)
- assigned_department
- internal_notes
- upvote_count
- created_at, updated_at
```

### **Upvotes Table**
```sql
- id (Primary Key)
- user_id (Foreign Key)
- issue_id (Foreign Key)
- created_at
```

---

## 🔧 **API Endpoints Reference**

### **🔐 Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token

### **👤 User Management**
- `GET /users/me` - Get current user profile
- `GET /users/me/issues` - Get user's reported issues

### **📝 Issue Management**
- `POST /issues/initiate-upload` - Get photo upload URL
- `POST /issues` - Create new issue
- `GET /issues` - Get issues with filtering
- `GET /issues/{id}` - Get specific issue
- `POST /issues/{id}/upvote` - Upvote issue
- `PATCH /issues/{id}/status` - Update issue status

### **⚙️ Admin Operations**
- `GET /admin/issues` - Get all issues (admin)
- `PATCH /admin/issues/{id}` - Update issue (admin)
- `DELETE /admin/issues/{id}` - Delete issue (admin)
- `GET /admin/users` - Get all users (admin)

### **📊 Analytics**
- `GET /analytics/stats` - Get KPI statistics
- `GET /analytics/heatmap` - Get heatmap data

### **🔌 Real-time**
- `WS /ws/updates/{user_id}` - User-specific updates
- `WS /notifications/updates/{issue_id}` - Issue updates

---

## 🎨 **Frontend Features**

### **🎯 Modern UI/UX**
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Clean Interface** - Intuitive navigation and user experience
- **Real-time Updates** - Live status changes and notifications
- **Interactive Elements** - Smooth animations and transitions

### **📱 Mobile-First Design**
- Touch-friendly interface
- Optimized for mobile devices
- GPS location detection
- Camera integration for photos

### **🔧 Advanced Functionality**
- **Auto-save** - Form data persistence
- **Validation** - Client-side and server-side validation
- **Error Handling** - User-friendly error messages
- **Loading States** - Visual feedback for all operations

---

## 🛠️ **Technical Stack**

### **Backend**
- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - Python SQL toolkit and ORM
- **SQLite** - Easy-to-use database (no setup required)
- **JWT** - Secure authentication
- **WebSocket** - Real-time communication

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Modern JavaScript features
- **Fetch API** - HTTP client
- **WebSocket API** - Real-time updates

### **Additional Tools**
- **Pydantic** - Data validation
- **bcrypt** - Password hashing
- **Alembic** - Database migrations
- **Uvicorn** - ASGI server

---

## 📊 **Sample Data Included**

The system comes with 20+ sample issues including:
- **Various Categories** - Potholes, streetlights, garbage, water issues
- **Multiple Wards** - Andheri, Bandra, Dadar, Mumbai Central, Thane
- **Different Statuses** - New, in-progress, resolved issues
- **Realistic Data** - Mumbai coordinates, timestamps, descriptions
- **Upvote Data** - Sample upvotes and user interactions

---

## 🔒 **Security Features**

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Input Validation** - Pydantic schemas
- **CORS Protection** - Cross-origin request handling
- **SQL Injection Prevention** - SQLAlchemy ORM protection

---

## 🚀 **Deployment Ready**

### **Production Considerations**
- Environment variable configuration
- Database connection pooling
- Static file serving
- CORS configuration
- Error handling and logging

### **Scalability Features**
- Database indexing
- Efficient queries
- Pagination support
- WebSocket connection management
- Background task support

---

## 🎯 **Perfect for Hackathons**

This complete system provides:
- ✅ **Full-stack solution** - No need for separate frontend/backend setup
- ✅ **Demo-ready** - Pre-populated with sample data
- ✅ **Professional UI** - Impressive visual presentation
- ✅ **Advanced features** - Analytics, real-time updates, admin dashboard
- ✅ **Scalable architecture** - Ready for production deployment
- ✅ **Complete documentation** - Easy to understand and extend

## 🏆 **Ready to Win!**

Your civic issue management system is now complete with:
- **Complete web interface** for testing all features
- **Full database integration** with sample data
- **All API endpoints** working and tested
- **Real-time features** for live updates
- **Admin dashboard** for management
- **Analytics and reporting** for insights

**Start the application with `python start.py` and begin testing immediately!** 🚀
