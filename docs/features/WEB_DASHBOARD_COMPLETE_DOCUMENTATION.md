# 📊 Civic Issue Reporter - Web Dashboard Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Pages & Features](#pages--features)
4. [Components](#components)
5. [API Endpoints](#api-endpoints)
6. [State Management](#state-management)
7. [Authentication & Security](#authentication--security)
8. [Data Models](#data-models)
9. [User Flows](#user-flows)
10. [Technology Stack](#technology-stack)
11. [Current Status](#current-status)

---

## 🎯 Overview

The Civic Issue Reporter Web Dashboard is a comprehensive civic issue management system that allows:
- **Citizens** to report civic issues with photos, location, and details
- **Admins** to manage, assign, and resolve issues within their departments
- **Real-time** communication between admins and citizens
- **Analytics** and reporting for department performance

### Key Features
- ✅ Issue reporting with GPS location and media upload
- ✅ AI-powered issue detection and categorization
- ✅ Real-time notifications via WebSocket
- ✅ Admin dashboard with analytics
- ✅ Issue filtering, sorting, and search
- ✅ Chat system for admin-citizen communication
- ✅ Trust score system for users
- ✅ Department-based issue assignment
- ✅ Encrypted authentication

---

## 🏗️ Architecture

### Frontend Structure
```
frontend/apps/web/src/
├── pages/              # Page components
├── components/         # Reusable UI components
├── features/           # Feature modules (API, auth)
├── layouts/           # Layout wrappers
├── store/              # Redux store configuration
├── hooks/              # Custom React hooks
├── lib/                # Utilities (crypto, key_manager)
├── router.jsx         # React Router configuration
└── main.jsx           # Application entry point
```

### Backend Structure
```
civic_issue_backend/
├── app/
│   ├── api/           # API route handlers
│   ├── core/           # Core utilities (db, security, encryption)
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic services
│   └── main.py         # FastAPI application
```

### Technology Stack
- **Frontend**: React 18, Redux Toolkit, React Router, TailwindCSS
- **Backend**: FastAPI, SQLAlchemy, SQLite
- **Real-time**: WebSocket (FastAPI WebSocket)
- **Authentication**: JWT tokens with encrypted payloads
- **Encryption**: AES-GCM for sensitive data
- **AI**: YOLOv8 for image detection, TextBlob for NLP
- **Maps**: Leaflet/React-Leaflet for map visualization

---

## 📄 Pages & Features

### 1. **HomePage** (`/home`)
**Purpose**: Main dashboard for viewing all issues with map and list view

**Features**:
- Interactive map showing all issues with markers
- Real-time issue list with pagination
- Statistics cards (New Issues, In Progress, Resolved, Pending)
- Filtering by:
  - Status (All, New, In Progress, Resolved)
  - Category (Potholes, Road Cracks, Manholes, etc.)
  - Sort by (Date, Priority, Status)
- Issue clustering on map for overlapping locations
- Click issue to view details

**Components Used**:
- `MapView` - Leaflet map component
- `IssueList` - List of issues
- `StatCard` - Statistics display cards
- `FilterButton` - Filter controls

**API Calls**:
- `GET /issues` - Fetch all issues
- `GET /analytics/stats` - Get dashboard statistics

---

### 2. **AdminDashboardPage** (`/admin`)
**Purpose**: Department-specific admin dashboard with analytics

**Features**:
- **Analytics Stats Cards**:
  - Total Issues
  - Resolved Today
  - Pending Issues
  - Average Resolution Time (hours)
- **Filtering**:
  - Status filter (New, In Progress, Resolved, Spam)
  - Category filter (All categories)
  - Priority filter (High, Medium, Low)
- **Department Issues List**:
  - Shows all issues from admin's department
  - Displays: Issue ID, Status, Priority, Category, Department, Reporter, Assigned Admin, Location, Upvotes, Description, Address, Created/Updated dates
  - "View Details" button for each issue
- **Notifications**:
  - Notification bell with unread count
  - Modal showing all notifications
  - Mark as read functionality
- **Issue Details Modal**:
  - Full issue information
  - Media files display
  - Status and priority badges

**API Calls**:
- `GET /admin/issues` - Get department issues
- `GET /analytics/stats` - Get analytics
- `GET /analytics/heatmap` - Get heatmap data
- `GET /admin/notifications` - Get notifications

**User Role**: Admin only

---

### 3. **UserDashboardPage** (`/my-issues`)
**Purpose**: Admin's personal dashboard for assigned issues

**Features**:
- **My Assigned Issues List**:
  - Shows only issues assigned to current admin
  - Filter by Status, Category, Priority
  - Real-time WebSocket updates
- **Issue Actions**:
  - **Start Work** - Change status from "new" to "in_progress"
  - **Resolve** - Mark issue as resolved (with confirmation)
  - **Mark Spam** - Mark issue as spam
  - **Reopen** - Reopen resolved issue
  - **Restore** - Restore spam issue
  - **Chat** - Open chat modal with citizen
  - **View Details** - View full issue details
- **Chat System**:
  - Real-time messaging via WebSocket
  - Message history
  - Auto-scroll to latest message
  - Connection status indicator
- **Notifications**:
  - Real-time WebSocket notifications
  - Toast notifications for new messages
  - Notification modal with mark as read
- **WebSocket Status**:
  - Live connection indicator
  - Click to reconnect

**API Calls**:
- `GET /admin/my-issues` - Get assigned issues
- `PATCH /admin/issues/{id}` - Update issue status
- `GET /messages/{issue_id}` - Get chat messages
- `POST /messages/{issue_id}` - Send message
- `PATCH /messages/{issue_id}/read` - Mark messages as read
- `GET /admin/notifications` - Get notifications
- `PATCH /admin/notifications/{id}/read` - Mark notification as read

**User Role**: Admin only

---

### 4. **AllIssuesAdminPage** (`/issues`)
**Purpose**: Read-only view of all department issues

**Features**:
- **Department Issues List** (Read-only):
  - Shows all issues from admin's department
  - Filter by Status, Category
  - Sort by Created Date or Upvotes
  - View details modal
- **Issue Information**:
  - Issue ID, Status, Category, Department
  - Reporter name, Upvotes, Created date
  - Address, Media files count
  - Assigned admin indicator

**API Calls**:
- `GET /issues` - Get all issues (filtered by department)

**User Role**: Admin only

---

### 5. **LoginPage** (`/login`)
**Purpose**: User authentication

**Features**:
- Phone number and password login
- Encrypted password transmission (AES-GCM)
- hCaptcha integration (optional)
- JWT token authentication
- Auto-redirect if already authenticated
- Error handling and validation

**API Calls**:
- `POST /auth/login` - Login with encrypted credentials
- `GET /encryption/config` - Get encryption keys
- `GET /auth/hcaptcha/site-key` - Get hCaptcha site key

**Security**:
- Password encrypted client-side before transmission
- Phone number optionally encrypted
- JWT tokens stored in Redux (persisted)
- Token refresh mechanism

---

### 6. **SignupPage** (`/signup`)
**Purpose**: New user registration

**Features**:
- Full name, phone number, password registration
- Role selection (citizen/admin)
- Department selection (for admins)
- Encrypted data transmission
- Validation and error handling

**API Calls**:
- `POST /auth/register` - Register new user

---

### 7. **ProfilePage** (`/profile`)
**Purpose**: User profile management

**Features**:
- View user information
- Update profile details
- Change password
- View trust score
- View reported issues

**API Calls**:
- `GET /users/me` - Get current user
- `PATCH /users/me` - Update profile

---

### 8. **IssueDetailsPanel** (`/issueDetailsPanel/:id`)
**Purpose**: Detailed view of a single issue

**Features**:
- Complete issue information
- Status and priority badges
- Category and department
- Reporter and assigned admin
- Location coordinates
- Address details
- Media files gallery
- Verification status
- Created/Updated timestamps

**API Calls**:
- `GET /issues/{id}` - Get issue details

---

### 9. **ReportsPage** (`/reports`)
**Purpose**: Analytics and reporting (if implemented)

**Features**:
- Department performance metrics
- Issue resolution trends
- Category-wise statistics
- Time-based analytics

---

### 10. **HelpSettingsPage** (`/help-settings`)
**Purpose**: Help and settings page

**Features**:
- Help documentation
- Settings configuration
- Contact information

---

## 🧩 Components

### Core Components

#### 1. **Header** (`components/Header.jsx`)
**Features**:
- Logo and branding
- Global search with autocomplete
- User dropdown menu
- Mobile responsive menu
- Search suggestions from issues

**Functionality**:
- Debounced search (300ms)
- Search results dropdown
- User profile access
- Logout functionality

---

#### 2. **MapView** (`components/MapView.jsx`)
**Features**:
- Interactive Leaflet map
- Issue markers with popups
- Zoom controls
- OpenStreetMap tiles
- Marker clustering for overlapping locations

**Props**:
- `issues` - Array of issue objects with lat/lng

---

#### 3. **IssueList** (`components/IssueList.jsx`)
**Features**:
- List of issues with status badges
- Click to view details
- Reporter information
- Assigned admin display
- Status color coding

**Props**:
- `issues` - Array of issue objects

---

#### 4. **IssueDetailsPanel** (`components/IssueDetailsPanel.jsx`)
**Features**:
- Complete issue information display
- Media gallery
- Status and priority badges
- Address formatting
- Error handling

---

#### 5. **Login** (`components/Login.jsx`)
**Features**:
- Login form with encryption
- hCaptcha integration
- Error handling
- Loading states

---

#### 6. **Signup** (`components/Signup.jsx`)
**Features**:
- Registration form
- Role selection
- Department selection
- Validation

---

### UI Components (shadcn/ui)

Located in `components/ui/`:
- `button.jsx` - Button component
- `card.jsx` - Card container
- `input.jsx` - Input field
- `select.jsx` - Select dropdown
- `badge.jsx` - Badge component
- `tabs.jsx` - Tab navigation
- `modal.jsx` - Modal dialog
- `skeleton.jsx` - Loading skeleton
- `toast.jsx` - Toast notifications (Sonner)

---

## 🔌 API Endpoints

### Authentication (`/auth`)

#### `POST /auth/login`
**Description**: User login with encrypted credentials

**Request Body**:
```json
{
  "phone_number": "encrypted_base64_string",
  "password": "encrypted_base64_string",
  "hcaptcha_token": "token_string"
}
```

**Response**:
```json
{
  "access_token": "jwt_token",
  "refresh_token": "jwt_token",
  "token_type": "bearer"
}
```

---

#### `POST /auth/register`
**Description**: Register new user

**Request Body**:
```json
{
  "full_name": "string",
  "phone_number": "encrypted_base64_string",
  "password": "encrypted_base64_string",
  "role": "citizen" | "admin",
  "department": "string" // optional, for admins
}
```

---

#### `POST /auth/refresh`
**Description**: Refresh JWT token

**Request Body**:
```json
{
  "refresh_token": "jwt_token"
}
```

---

#### `GET /encryption/config`
**Description**: Get encryption configuration

**Response**:
```json
{
  "key_b64": "base64_encryption_key",
  "aad": "additional_authenticated_data"
}
```

---

#### `GET /auth/hcaptcha/site-key`
**Description**: Get hCaptcha site key

**Response**:
```json
{
  "site_key": "hcaptcha_site_key"
}
```

---

### Issues (`/issues`)

#### `GET /issues`
**Description**: Get all issues with optional filters

**Query Parameters**:
- `lat` - Latitude (optional)
- `lng` - Longitude (optional)
- `radius` - Radius in meters (optional)
- `category` - Category filter (optional)
- `status` - Status filter (optional)
- `ward` - Ward filter (optional)
- `search` - Search query (optional)
- `sort` - Sort field (optional)

**Response**: Array of `IssueOut` objects

---

#### `GET /issues/{id}`
**Description**: Get single issue by ID

**Response**: `IssueOut` object

---

#### `POST /issues`
**Description**: Create new issue

**Request Body**:
```json
{
  "description": "string",
  "category": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "address_line1": "string",
  "address_line2": "string",
  "street": "string",
  "landmark": "string",
  "pincode": "string",
  "media_urls": ["url1", "url2"]
}
```

**Response**: `IssueOut` object

---

#### `POST /issues/{id}/upvote`
**Description**: Upvote an issue

**Response**: Updated issue

---

#### `PATCH /issues/{id}/status`
**Description**: Update issue status

**Request Body**:
```json
{
  "status": "new" | "in_progress" | "resolved" | "spam"
}
```

---

#### `GET /issues/my-issues`
**Description**: Get current user's reported issues

**Response**: Array of `IssueOut` objects

---

#### `POST /issues/initiate-upload`
**Description**: Get presigned URL for media upload

**Query Parameters**:
- `filename` - File name

**Response**:
```json
{
  "upload_url": "presigned_s3_url",
  "file_url": "final_file_url"
}
```

---

### Admin (`/admin`)

#### `GET /admin/issues`
**Description**: Get all issues from admin's department

**Query Parameters**:
- `status` - Status filter
- `category` - Category filter
- `priority` - Priority filter
- `sort_by` - Sort field (default: "created_at")
- `sort_order` - Sort order (default: "desc")
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset (default: 0)

**Response**: Array of `IssueOut` objects

---

#### `PATCH /admin/issues/{id}`
**Description**: Update issue (only assigned issues)

**Request Body**:
```json
{
  "status": "new" | "in_progress" | "resolved" | "spam",
  "priority": "high" | "medium" | "low",
  "assigned_admin_id": 0,
  "assigned_department": "string"
}
```

**Response**: Updated `IssueOut` object

---

#### `DELETE /admin/issues/{id}`
**Description**: Delete issue

**Response**: Success message

---

#### `GET /admin/my-issues`
**Description**: Get issues assigned to current admin

**Query Parameters**: Same as `/admin/issues`

**Response**: Array of `IssueOut` objects

---

#### `GET /admin/users`
**Description**: Get all users

**Query Parameters**:
- `role` - Role filter
- `limit` - Number of results
- `offset` - Pagination offset

**Response**: Array of `UserOut` objects

---

#### `GET /admin/notifications`
**Description**: Get admin notifications

**Response**: Array of `NotificationOut` objects

---

#### `PATCH /admin/notifications/{id}/read`
**Description**: Mark notification as read

**Response**: Updated notification

---

#### `PATCH /admin/notifications/mark-all-read`
**Description**: Mark all notifications as read

**Response**: Success message

---

### Analytics (`/analytics`)

#### `GET /analytics/stats`
**Description**: Get dashboard statistics

**Query Parameters**:
- `start_date` - Start date (optional)
- `end_date` - End date (optional)

**Response**:
```json
{
  "total_issues": 0,
  "resolved_today": 0,
  "pending": 0,
  "avg_resolution_time_hours": 0.0,
  "new_issues": 0,
  "in_progress": 0,
  "total_pending": 0
}
```

---

#### `GET /analytics/heatmap`
**Description**: Get heatmap data for issue locations

**Query Parameters**:
- `status` - Status filter (optional)
- `category` - Category filter (optional)

**Response**: Array of heatmap points with lat/lng and count

---

### Messages (`/messages`)

#### `GET /messages/{issue_id}`
**Description**: Get messages for an issue

**Response**: Array of message objects

---

#### `POST /messages/{issue_id}`
**Description**: Send message for an issue

**Request Body**:
```json
{
  "message": "string"
}
```

**Response**: Created message object

---

#### `PATCH /messages/{issue_id}/read`
**Description**: Mark messages as read

**Response**: Success message

---

### Users (`/users`)

#### `GET /users/me`
**Description**: Get current user profile

**Response**: `UserOut` object

---

#### `PATCH /users/me`
**Description**: Update current user profile

**Request Body**:
```json
{
  "full_name": "string",
  "phone_number": "string"
}
```

**Response**: Updated `UserOut` object

---

### AI (`/ai`)

#### `POST /ai/detect`
**Description**: Detect objects in image using YOLOv8

**Request Body**:
```json
{
  "image_url": "string",
  "image_data_url": "data:image/..." // base64 data URL
}
```

**Response**:
```json
{
  "detections": [
    {
      "class": "string",
      "confidence": 0.0,
      "bbox": [x1, y1, x2, y2]
    }
  ]
}
```

---

#### `POST /ai/analyze-text`
**Description**: Analyze text for sentiment and keywords

**Request Body**:
```json
{
  "text": "string"
}
```

**Response**:
```json
{
  "sentiment": "positive" | "negative" | "neutral",
  "keywords": ["keyword1", "keyword2"],
  "priority": "high" | "medium" | "low"
}
```

---

#### `POST /ai/check-duplicate`
**Description**: Check for duplicate issues

**Request Body**:
```json
{
  "description": "string",
  "latitude": 0.0,
  "longitude": 0.0
}
```

**Response**:
```json
{
  "is_duplicate": true,
  "similar_issues": [/* issue objects */]
}
```

---

## 🗄️ State Management

### Redux Store Structure

```javascript
{
  auth: {
    user: UserObject,
    token: "jwt_token",
    refreshToken: "jwt_token",
    isAuthenticated: boolean
  },
  customization: {
    // Theme and customization settings
  },
  ui: {
    selectedIssue: number | null
  },
  api: {
    // RTK Query cache
    queries: {},
    mutations: {}
  }
}
```

### Redux Slices

#### 1. **authSlice** (`features/auth/authSlice.js`)
**State**:
- `user` - Current user object
- `token` - JWT access token
- `refreshToken` - JWT refresh token
- `isAuthenticated` - Authentication status

**Actions**:
- `setCredentials` - Set user and tokens
- `logout` - Clear authentication
- `updateUser` - Update user data

**Persistence**: Yes (redux-persist)

---

#### 2. **uiSlice** (`store/slices/uiSlice.js`)
**State**:
- `selectedIssue` - Currently selected issue ID

**Actions**:
- `setSelectedIssue` - Set selected issue

---

#### 3. **CustomizationSlice** (`features/CustomizationSlice.js`)
**State**:
- Theme settings
- UI preferences

---

### RTK Query API Slices

#### 1. **apiSlice** (`features/api/apiSlice.js`)
**Base API slice** with:
- Base URL configuration
- Authentication headers
- Error handling
- Tag-based cache invalidation

**Tags**:
- `Issue` - Issue-related data
- `User` - User-related data
- `Auth` - Authentication data
- `Notification` - Notification data
- `Analytics` - Analytics data

---

#### 2. **issuesApi** (`features/api/issues.api.js`)
**Endpoints**:
- `getIssues` - Get all issues
- `getIssue` - Get single issue
- `getUserIssues` - Get user's issues
- `createIssue` - Create new issue
- `upvoteIssue` - Upvote issue
- `updateIssueStatus` - Update status
- `searchIssues` - Search issues
- `initiateUpload` - Get upload URL

---

#### 3. **adminApi** (`features/api/admin.api.js`)
**Endpoints**:
- `getAdminIssues` - Get department issues
- `getMyAssignedIssues` - Get assigned issues
- `updateIssue` - Update issue
- `deleteIssue` - Delete issue
- `getAdminUsers` - Get users
- `getNotifications` - Get notifications
- `markNotificationRead` - Mark as read
- `markAllNotificationsRead` - Mark all as read

---

#### 4. **analyticsApi** (`features/api/analytics.api.js`)
**Endpoints**:
- `getAnalyticsStats` - Get statistics
- `getAnalyticsHeatmap` - Get heatmap data

---

#### 5. **authApi** (`features/api/auth.api.js`)
**Endpoints**:
- `login` - Login mutation
- `register` - Register mutation
- `refresh` - Refresh token mutation

---

#### 6. **messagesApi** (`features/api/messages.api.js`)
**Endpoints**:
- `getIssueMessages` - Get messages
- `sendMessage` - Send message
- `markMessagesAsRead` - Mark as read

---

## 🔐 Authentication & Security

### Authentication Flow

1. **User Login**:
   - User enters phone number and password
   - Frontend encrypts password using AES-GCM
   - Encrypted data sent to `/auth/login`
   - Backend decrypts and verifies
   - JWT tokens returned
   - Tokens stored in Redux (persisted)

2. **Token Management**:
   - Access token: 60 minutes expiry
   - Refresh token: 7 days expiry
   - Auto-refresh on expiry
   - Token included in Authorization header

3. **Route Protection**:
   - `AuthLayout` component checks authentication
   - Redirects to `/login` if not authenticated
   - Role-based access control (admin routes)

### Encryption

**Client-Side** (`lib/crypto.js`):
- AES-GCM encryption for passwords
- Encryption key from `/encryption/config`
- Packed format: `base64(nonce || ciphertext)`

**Backend** (`app/core/encryption.py`):
- AES-GCM decryption
- Key derivation from SECRET_KEY
- AAD (Additional Authenticated Data) for integrity

### Security Features

- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Encrypted password transmission
- ✅ CORS configuration
- ✅ Role-based access control
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS protection (React auto-escaping)
- ✅ hCaptcha integration (optional)

---

## 📊 Data Models

### Issue Model

```typescript
interface Issue {
  id: number
  description: string
  category: string
  status: "new" | "in_progress" | "resolved" | "spam"
  priority: "high" | "medium" | "low"
  latitude: number
  longitude: number
  address_line1?: string
  address_line2?: string
  street?: string
  landmark?: string
  pincode?: string
  media_urls: string[]
  reporter_id: number
  reporter_name?: string
  assigned_admin_id?: number
  assigned_admin_name?: string
  assigned_department?: string
  upvote_count: number
  is_verified: boolean
  created_at: string
  updated_at: string
}
```

### User Model

```typescript
interface User {
  id: number
  full_name: string
  phone_number: string
  role: "citizen" | "admin"
  department?: string
  trust_score: number
  created_at: string
}
```

### Notification Model

```typescript
interface Notification {
  id: number
  user_id: number
  message: string
  read: boolean
  created_at: string
}
```

### Message Model

```typescript
interface Message {
  id: number
  issue_id: number
  message: string
  is_admin_message: boolean
  sender_name?: string
  created_at: string
}
```

---

## 🔄 User Flows

### Citizen Flow

1. **Registration**:
   - Visit `/signup`
   - Enter name, phone, password
   - Select "citizen" role
   - Submit → Account created

2. **Login**:
   - Visit `/login`
   - Enter phone and password
   - Submit → Redirected to `/home`

3. **Report Issue**:
   - Click "Report Issue" (if implemented)
   - Fill form: description, category, location
   - Upload photos
   - Submit → Issue created

4. **View Issues**:
   - Browse `/home` dashboard
   - See map and list of issues
   - Filter and search
   - Click issue for details

---

### Admin Flow

1. **Login**:
   - Visit `/login`
   - Enter admin credentials
   - Submit → Redirected to `/admin`

2. **Dashboard**:
   - View analytics stats
   - See department issues
   - Filter by status/category/priority
   - View issue details

3. **Manage Assigned Issues** (`/my-issues`):
   - View assigned issues
   - Start work on new issues
   - Chat with citizens
   - Resolve issues
   - Mark spam if needed

4. **View All Issues** (`/issues`):
   - Browse all department issues
   - View details (read-only)
   - Monitor department activity

5. **Notifications**:
   - Receive real-time notifications
   - View notification modal
   - Mark as read

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Redux Toolkit | Latest | State management |
| React Router | 6.x | Routing |
| RTK Query | Latest | API data fetching |
| TailwindCSS | Latest | Styling |
| Leaflet | Latest | Maps |
| React-Leaflet | Latest | React map components |
| Sonner | Latest | Toast notifications |
| shadcn/ui | Latest | UI component library |
| FontAwesome | Latest | Icons |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.95.2 | Web framework |
| SQLAlchemy | 2.0.15 | ORM |
| SQLite | Built-in | Database |
| Uvicorn | 0.21.1 | ASGI server |
| Pydantic | 1.10.9 | Data validation |
| JWT | python-jose | Authentication |
| Bcrypt | 3.2.0 | Password hashing |
| Cryptography | 42.0.7 | AES-GCM encryption |
| Ultralytics | 8.2.103 | YOLOv8 AI model |
| TextBlob | 0.17.1 | NLP analysis |

### Development Tools

- Vite - Build tool
- ESLint - Linting
- Prettier - Code formatting
- Redux DevTools - State debugging

---

## ✅ Current Status

### Working Features ✅

1. **Authentication**:
   - ✅ Login with encrypted credentials
   - ✅ Registration
   - ✅ JWT token management
   - ✅ Route protection
   - ✅ Auto-redirect on auth

2. **Admin Dashboard**:
   - ✅ Analytics stats display
   - ✅ Department issues list
   - ✅ Filtering (status, category, priority)
   - ✅ Issue details modal
   - ✅ Notifications system

3. **User Dashboard**:
   - ✅ Assigned issues list
   - ✅ Issue status updates
   - ✅ Chat system with WebSocket
   - ✅ Real-time notifications
   - ✅ Issue actions (resolve, spam, reopen)

4. **Home Dashboard**:
   - ✅ Map view with markers
   - ✅ Issue list with pagination
   - ✅ Statistics cards
   - ✅ Filtering and sorting
   - ✅ Issue details panel

5. **Components**:
   - ✅ Header with search
   - ✅ MapView with clustering
   - ✅ IssueList
   - ✅ IssueDetailsPanel
   - ✅ Login/Signup forms

6. **API Integration**:
   - ✅ All API endpoints connected
   - ✅ RTK Query caching
   - ✅ Error handling
   - ✅ Loading states

7. **Real-time Features**:
   - ✅ WebSocket for messages
   - ✅ WebSocket for notifications
   - ✅ Real-time issue updates

### Known Issues / TODO ⚠️

1. **Issue Reporting**:
   - ⚠️ Frontend form not fully implemented
   - ⚠️ Media upload flow needs testing

2. **AI Features**:
   - ⚠️ Image detection integration pending
   - ⚠️ Auto-categorization needs testing

3. **Analytics**:
   - ⚠️ Heatmap visualization not implemented
   - ⚠️ Advanced analytics pending

4. **Mobile Responsiveness**:
   - ⚠️ Some pages need mobile optimization

5. **Error Handling**:
   - ⚠️ Some edge cases need better error messages

---

## 📝 Notes for Future Development

### Planned Enhancements

1. **Issue Reporting Form**:
   - Complete the frontend form
   - Integrate with map for location selection
   - Media upload with preview
   - AI auto-categorization

2. **Advanced Analytics**:
   - Charts and graphs
   - Time-series analysis
   - Department comparison
   - Export reports

3. **Mobile App**:
   - React Native app
   - Push notifications
   - Offline support
   - Camera integration

4. **Additional Features**:
   - Email notifications
   - SMS notifications
   - Issue verification workflow
   - Trust score gamification
   - Citizen leaderboard

---

## 🔗 Important Files Reference

### Frontend Key Files

- `router.jsx` - All routes configuration
- `store/store.js` - Redux store setup
- `features/api/apiSlice.js` - Base API configuration
- `lib/crypto.js` - Encryption utilities
- `layouts/AuthLayout.jsx` - Route protection
- `layouts/MainLayout.jsx` - Main app layout

### Backend Key Files

- `app/main.py` - FastAPI app initialization
- `app/core/db.py` - Database configuration
- `app/core/security.py` - JWT authentication
- `app/core/encryption.py` - AES-GCM encryption
- `app/api/` - All API route handlers
- `app/services/` - Business logic services

---

## 📚 Additional Resources

- **Backend API Docs**: `http://localhost:8585/docs` (Swagger UI)
- **Frontend Dev Server**: `http://localhost:5173`
- **Backend Server**: `http://localhost:8585`

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Admin Dashboard Working ✅

---

*This documentation covers all working features of the web dashboard. Use this as a reference for understanding the system architecture, features, and implementation details.*

