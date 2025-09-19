
# 🏛️ Civic Issue Management System – Full-Stack Documentation

A robust civic issue reporting and management platform with a modern frontend, RESTful backend, real-time features, and advanced admin tools.

---

## 🚀 Project Overview

- **Frontend:** React + Vite, modular component-based UI, real-time updates, map integration, and admin dashboard.
- **Backend:** FastAPI, SQLite, SQLAlchemy ORM, JWT authentication, WebSocket notifications, and RESTful APIs.
- **Database:** SQLite (easy to set up, portable).
- **Dev Experience:** Hot reload, modular code, clear separation of concerns, and demo credentials for quick testing.

---

## 🗂️ Project Structure

```
civic_issue_backend/
	app/
		api/         # All API route definitions (auth, issues, admin, analytics, etc.)
		core/        # Core utilities (db, config, security, websocket manager)
		models/      # SQLAlchemy models (User, Issue, Upvote)
		schemas/     # Pydantic schemas for request/response validation
		services/    # Business logic (auth, issues, analytics, notifications, storage)
		workers/     # Background tasks (media optimization, notifications)
		static/      # Static files for frontend
	start.py       # Main entry point
	init_db.py     # DB initialization script
	requirements.txt
web/
	src/
		pages/       # Main pages (Home, Login, Signup, Profile)
		components/  # UI components (Header, Footer, IssueList, MapView, etc.)
		features/    # Redux slices, API logic, customization flows
		layouts/     # Layout wrappers (MainLayout, AuthLayout)
		store/       # Redux store and slices
		utils/       # Utility functions
		hooks/       # Custom React hooks
		conf/        # App configuration
```

---

## 🌐 Backend (FastAPI)

### Key Features

- **Authentication:** JWT-based, with registration, login, and token refresh endpoints.
- **Issue Reporting:** Two-step process (photo upload, then issue creation), location support, upvoting.
- **Admin Dashboard:** Advanced filtering, issue/user management, analytics, and heatmap data.
- **Notifications:** Real-time via WebSockets, push notification simulation.
- **Analytics:** KPIs, heatmap, and statistics endpoints.
- **Database Models:** User, Issue, Upvote (with relationships and constraints).

### Main API Endpoints

- `/auth/register` – Register a new user (citizen)
- `/auth/login` – Login and receive JWT tokens
- `/auth/refresh` – Refresh JWT tokens
- `/users/me` – Get current user profile
- `/users/me/issues` – Get issues reported by the current user
- `/issues/initiate-upload` – Get presigned URL for photo upload
- `/issues` – Create new issue, list issues (with filters)
- `/admin/issues` – Admin: list, filter, update, and delete issues
- `/admin/users` – Admin: list and manage users
- `/analytics/stats` – Get dashboard KPIs
- `/analytics/heatmap` – Get data for map heatmap
- `/notifications/ws/updates/{user_id}` – WebSocket for real-time user notifications

### Database Schema (Simplified)

- **User:** id, full_name, phone_number, password_hash, role, trust_score, is_active, created_at, updated_at
- **Issue:** id, reporter_id, category, description, status, lat, lng, ward, media_urls, assigned_department, upvote_count, created_at, updated_at
- **Upvote:** id, user_id, issue_id, created_at

---

## 💻 Frontend (React + Vite)

### Main Pages

- **HomePage:** Dashboard with stats, map view, and recent issues.
- **LoginPage:** User login form, error handling, redirects.
- **SignupPage:** User registration form, validation, and navigation.
- **ProfilePage:** User profile, personal info, reported issues, and activity.

### Key Components

- **Header:** Navigation bar, user menu, search, and role-based links.
- **Footer:** App info, quick links, social media.
- **Sidebar:** (Admin) Navigation for dashboard, issues, users, analytics, settings.
- **IssueList:** Lists issues, clickable for details.
- **IssueDetailsPanel:** Shows full details of a selected issue.
- **MapView:** Interactive map (Leaflet), shows issues as markers.
- **Login/Signup:** Forms with validation, error display, and API integration.
- **Loader, ErrorBoundary, Button, Input, etc.:** Reusable UI elements.

### Features

- **Authentication:** JWT-based, persistent login, Redux state management.
- **Issue Reporting:** Photo upload, location selection, category/ward, and description.
- **Map Integration:** View issues on a map, filter by location/category/status.
- **Upvoting:** Users can upvote issues to prioritize them.
- **Admin Dashboard:** Advanced filtering, bulk operations, user management, analytics, and heatmap.
- **Analytics:** Real-time stats, heatmap visualization, performance metrics.
- **Notifications:** Real-time updates via WebSockets.
- **Customization Flow:** (If enabled) Multi-step garment customization (for tailoring use-case).

### State Management

- **Redux Toolkit:** Slices for auth, UI, customization, etc.
- **API Integration:** RTK Query for all backend endpoints.
- **Hooks:** Custom hooks for debounce, mobile detection, etc.

---

## 🛠️ Setup & Usage

### Backend

```bash
cd civic_issue_backend
pip install -r requirements.txt
python start.py
```
- Or, for manual start:
	- `python init_db.py`
	- `uvicorn app.main:app --reload --port 8585`

### Frontend

```bash
cd web
npm install
npm run dev
```

---

## 👥 Demo Credentials

- **Citizen:** Phone: 9876543210 | Password: password123
- **Admin:** Phone: 9876543212 | Password: admin123

---

## 📝 Additional Notes

- **Security:** Passwords are hashed, JWT tokens are used for all protected endpoints.
- **Extensibility:** Easily add new features, endpoints, or UI components.
- **Testing:** Sample data and demo credentials included for quick testing.
- **Customization:** The project can be adapted for other civic or community reporting use-cases.

---

If you need a more granular breakdown of any specific page, feature, or code section, let me know!
