# 📱 Civic Issue Reporter - Mobile App Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Screens & Features](#screens--features)
4. [Components](#components)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Authentication & Security](#authentication--security)
8. [Data Models](#data-models)
9. [User Flows](#user-flows)
10. [Technology Stack](#technology-stack)
11. [Current Status](#current-status)

---

## 🎯 Overview

The Civic Issue Reporter Mobile App is a Flutter-based mobile application that allows citizens to:
- **Report** civic issues with photos, GPS location, and descriptions
- **View** all reported issues on an interactive map
- **Track** their own reported issues
- **Receive** real-time notifications
- **Manage** their profile and trust score

### Key Features
- ✅ Issue reporting with camera/gallery photo upload
- ✅ GPS location detection with reverse geocoding
- ✅ Interactive map view with issue markers
- ✅ Real-time notifications via WebSocket
- ✅ Encrypted authentication
- ✅ Profile management with trust score
- ✅ Social sharing integration
- ✅ AI-powered issue detection (planned)

---

## 🏗️ Architecture

### Project Structure
```
frontend/apps/mobile/lib/
├── main.dart                 # App entry point
├── core/                     # Core utilities
│   ├── api/                  # API client (Dio)
│   ├── services/             # Services (encryption, storage, websocket)
│   └── theme/                # Theme configuration
├── data/                     # Data layer
│   └── models/               # Data models (Issue, User, Token)
├── features/                 # Feature modules
│   ├── auth/                 # Authentication
│   ├── home/                 # Home screen
│   ├── issue_map/            # Map view
│   ├── issues/               # Issue reporting
│   ├── my_reports/           # User's reported issues
│   ├── notifications/        # Notifications
│   ├── profile/              # User profile
│   ├── settings/             # Settings
│   └── shell/                # App shell (bottom nav)
└── assets/                   # Images, icons
```

### Technology Stack
- **Framework**: Flutter 3.6.0+
- **Language**: Dart 3.6.0+
- **State Management**: StatefulWidget (no external state management)
- **HTTP Client**: Dio 5.4.3
- **Storage**: Flutter Secure Storage + SharedPreferences
- **Maps**: Flutter Map 6.1.0
- **Location**: Geolocator 12.0.0
- **Camera**: Camera 0.11.0, Image Picker 1.1.2
- **Encryption**: PointyCastle 3.7.3

---

## 📄 Screens & Features

### 1. **LoginScreen** (`features/auth/presentation/login_screen.dart`)
**Purpose**: User authentication

**Features**:
- Phone number and password login
- Encrypted password transmission (AES-GCM)
- Google Sign-In button (placeholder)
- "Remember me" checkbox
- "Forgot Password" link (placeholder)
- Navigation to Signup screen
- Error handling with SnackBar

**UI Elements**:
- Blue gradient header
- White login card
- Google Sign-In button
- Phone/password input fields
- Login button with loading state

**Navigation**:
- On success → `AppShell` (main app)
- On "Sign Up" → `SignupScreen`

**API Calls**:
- `POST /auth/login` - Login with encrypted credentials

---

### 2. **SignupScreen** (`features/auth/presentation/signup_screen.dart`)
**Purpose**: New user registration

**Features**:
- Full name, phone number, password registration
- Form validation
- Password visibility toggle
- Google Sign-Up button (placeholder)
- Error handling
- Auto-navigation to login on success

**UI Elements**:
- Blue gradient header
- White signup card
- Form fields with validation
- Sign up button

**API Calls**:
- `POST /auth/register` - Register new user

---

### 3. **AppShell** (`features/shell/presentation/app_shell.dart`)
**Purpose**: Main app container with bottom navigation

**Features**:
- Bottom navigation bar with 4 tabs:
  1. **Map** - Issue map view
  2. **Home** - Issue feed
  3. **Add** - Report issue
  4. **Know your Neta** - Profile
- IndexedStack for tab persistence
- State management for selected tab

**Navigation Structure**:
```dart
_pages = [
  IssueMapScreen(),      // Tab 0
  HomeScreen(),          // Tab 1 (default)
  ReportIssueScreen(),   // Tab 2
  ProfileScreen(),       // Tab 3
]
```

---

### 4. **HomeScreen** (`features/home/presentation/home_screen.dart`)
**Purpose**: Main feed showing all public issues

**Features**:
- **Custom Header**:
  - Profile avatar (navigates to ProfileScreen)
  - Search bar (placeholder)
  - Notification bell (navigates to NotificationScreen)
- **Filter Pills**:
  - "My locality" (default)
  - "highly voted"
  - "India"
- **Issue List**:
  - Scrollable list of all public issues
  - Uses `IssueCard` widget
  - Pull-to-refresh (via FutureBuilder)
  - Loading and error states

**Data Source**:
- `GET /issues` - Fetches all public issues

**Components Used**:
- `IssueCard` - Individual issue display card

---

### 5. **IssueMapScreen** (`features/issue_map/presentation/issue_map_screen.dart`)
**Purpose**: Interactive map showing all issues

**Features**:
- **Flutter Map Integration**:
  - OpenStreetMap tiles
  - Interactive zoom/pan
  - Center on Mumbai by default (19.0760, 72.8777)
- **Issue Markers**:
  - Red location pins for each issue
  - Tap marker to see issue details in SnackBar
  - Shows issue ID and description
- **Loading States**:
  - Loading spinner while fetching
  - Error message on failure
  - Empty state message

**Data Source**:
- `GET /issues` - Fetches all public issues

**Map Library**: Flutter Map 6.1.0 with OpenStreetMap

---

### 6. **ReportIssueScreen** (`features/issues/presentation/report_issue_screen.dart`)
**Purpose**: Report new civic issues

**Features**:
- **Location Detection**:
  - Automatic GPS location fetch
  - Reverse geocoding (coordinates → address)
  - Display readable address
  - Tap to refresh location
  - Location permission handling
- **Image Upload**:
  - "Add from gallery" button
  - "Take photo" button
  - Image preview with remove option
  - Image compression (80% quality)
- **Issue Details**:
  - Description text field (multi-line)
  - AI Suggestion button (placeholder - "AI AUTO DETECT")
  - Category dropdown:
    - Pothole
    - Streetlight
    - Garbage
    - Water Leakage
  - Urgency dropdown:
    - High
    - Medium
    - Low
- **Social Sharing**:
  - "Share on" dropdown (placeholder)
  - Share to social media (via share_plus)
- **Privacy Options**:
  - "Post anonymously" toggle
- **Form Validation**:
  - Description required
  - Image required
  - Location required
- **Submit Flow**:
  1. Get presigned upload URL
  2. Upload image to MinIO/S3
  3. Create issue in database
  4. Show success message
  5. Navigate back

**API Calls**:
- `POST /issues/initiate-upload` - Get upload URL
- `PUT /{upload_url}` - Upload image
- `POST /issues` - Create issue

**Permissions Required**:
- Camera
- Location (Fine & Coarse)
- Storage (for gallery)

---

### 7. **MyReportsScreen** (`features/my_reports/presentation/my_reports_screen.dart`)
**Purpose**: View user's reported issues

**Features**:
- **Issue List**:
  - Shows only issues reported by current user
  - Uses `IssueListCard` widget
  - Loading and error states
  - Empty state message
- **Issue Information**:
  - Category with icon
  - Status badge (New, In Progress, Resolved)
  - Description
  - Reported date

**Data Source**:
- `GET /users/me/issues` - Fetches user's issues (requires auth)

**Components Used**:
- `IssueListCard` - Reusable issue card widget

---

### 8. **ProfileScreen** (`features/profile/presentation/profile_screen.dart`)
**Purpose**: User profile and statistics

**Features**:
- **User Information**:
  - Profile avatar (network image)
  - Full name
  - Handle/username
- **Statistics**:
  - Issues Reported count
  - Followers count
  - Following count
- **Trust Score**:
  - Circular progress indicator
  - Percentage display
  - Visual gauge (0-100%)
- **Navigation**:
  - Settings button in app bar
  - Navigates to SettingsScreen

**Current Implementation**:
- Uses mock data (hardcoded values)
- Needs API integration for real user data

**Planned API Calls**:
- `GET /users/me` - Get user profile
- `PATCH /users/me` - Update profile

---

### 9. **NotificationScreen** (`features/notifications/presentation/notification_screen.dart`)
**Purpose**: View all notifications

**Features**:
- **Tabbed Interface**:
  - "Recent activity" tab
  - "Unread" tab
- **Notification Types**:
  - Issue resolved
  - Issue reposted
  - Issue upvoted
  - Status update
- **Notification Display**:
  - Actor avatar (initials)
  - Notification message
  - Time ago (e.g., "2 hours ago")
  - List separator
- **Footer Message**:
  - "That's all your notification from last 30 days"

**Current Implementation**:
- Uses mock data
- Needs WebSocket integration for real-time updates

**Planned Features**:
- Real-time notifications via WebSocket
- Mark as read functionality
- Notification settings

---

### 10. **SettingsScreen** (`features/settings/presentation/settings_screen.dart`)
**Purpose**: App settings and preferences

**Features**:
- **Sections**:
  - General
    - Username/handle
  - Account
    - Account Information
    - Privacy and safety
  - Content & Display
    - Notifications
    - Content preferences
    - Display and sound
    - Data usage
    - Accessibility
  - About
    - About Civic Reporter

**Current Implementation**:
- UI only (no functionality)
- Placeholder onTap handlers

**Planned Features**:
- Account management
- Privacy settings
- Notification preferences
- Theme customization

---

## 🧩 Components

### Core Components

#### 1. **IssueCard** (`features/home/presentation/widgets/issue_card.dart`)
**Purpose**: Display issue in home feed

**Features**:
- Issue description
- Category icon (dynamic based on category)
- Image display (if available)
- Upvote count with icon
- Share count with icon
- Category badge
- Share button
- Status indicator (if resolved)
- Tap to view details (placeholder)

**Props**:
- `issue` - Issue model object

---

#### 2. **IssueListCard** (`features/my_reports/presentation/widgets/issue_list_card.dart`)
**Purpose**: Display issue in "My Reports" list

**Features**:
- Category icon and label
- Status badge (color-coded)
- Description (truncated to 2 lines)
- Reported date (formatted)
- Card design with elevation
- Tap to view details (placeholder)

**Props**:
- `issue` - Issue model object

---

#### 3. **BottomNavBar** (`features/shell/presentation/widgets/bottom_nav_bar.dart`)
**Purpose**: Bottom navigation bar

**Features**:
- 4 navigation items:
  1. Map (LucideIcons.map)
  2. Home (LucideIcons.house)
  3. Add (LucideIcons.circlePlus)
  4. Know your Neta (LucideIcons.info)
- Active state highlighting
- Icon + label design
- White background with shadow

**Props**:
- `currentIndex` - Currently selected tab
- `onTap` - Tab selection callback

---

### Theme Components

#### 1. **AppColors** (`core/theme/app_colors.dart`)
**Color Palette**:
```dart
primary: #4A90E2 (Blue)
secondary: #50E3C2 (Teal)
background: #F4F6F8 (Light Gray)
textDark: #2D3748
textLight: #718096
error: #E53E3E (Red)
success: #38A169 (Green)
warning: #D69E2E (Yellow)
```

---

#### 2. **AppTheme** (`core/theme/app_theme.dart`)
**Theme Configuration**:
- Material 3 design
- Light theme only
- Custom AppBar theme
- Custom button styles
- Custom input field styles
- Rounded corners (12px radius)

---

## 🔌 API Integration

### API Client (`core/api/api_client.dart`)

**Configuration**:
```dart
baseUrl: 'https://bnc51nt1-8585.inc1.devtunnels.ms/'
connectTimeout: 15 seconds
receiveTimeout: 30 seconds
sendTimeout: 30 seconds
```

**Features**:
- Dio HTTP client
- LogInterceptor for debugging
- Automatic request/response logging
- Error handling

**Logging**:
- Request URL, headers, body
- Response status, body
- Error details

---

### API Endpoints Used

#### Authentication

**POST /auth/login**
```dart
Request: {
  "phone_number": "string",
  "password": "encrypted_base64_string"
}
Response: {
  "access_token": "jwt_token",
  "refresh_token": "jwt_token",
  "token_type": "bearer"
}
```

**POST /auth/register**
```dart
Request: {
  "full_name": "string",
  "phone_number": "string",
  "password": "encrypted_base64_string",
  "fp_check": "encrypted_base64_string"
}
Response: User object
```

---

#### Issues

**GET /issues**
- Fetches all public issues
- No authentication required
- Returns: `List<Issue>`

**GET /users/me/issues**
- Fetches current user's issues
- Requires authentication
- Returns: `List<Issue>`

**POST /issues/initiate-upload**
- Gets presigned upload URL for image
- Query: `filename`
- Returns: `{ "url": "presigned_url" }`

**PUT /{upload_url}**
- Uploads image to MinIO/S3
- Headers: `Content-Length`, `Content-Type`
- Body: Image bytes stream

**POST /issues**
- Creates new issue
- Requires authentication
- Body:
```dart
{
  "description": "string",
  "category": "string",
  "latitude": 0.0,
  "longitude": 0.0,
  "image_url": "string",
  "is_anonymous": false
}
```
- Returns: `Issue` object

---

## 🗄️ State Management

### Current Approach
- **No external state management** (Redux, Bloc, Provider)
- Uses **StatefulWidget** for local state
- Uses **FutureBuilder** for async data
- Uses **StorageService** for persistent data

### State Storage

#### 1. **StorageService** (`core/services/storage_service.dart`)
**Purpose**: Secure token storage

**Methods**:
- `saveToken(String token)` - Save JWT token
- `getToken()` - Retrieve JWT token
- `deleteToken()` - Remove token (logout)

**Implementation**:
- **Mobile**: Flutter Secure Storage (encrypted)
- **Web**: SharedPreferences (fallback)

---

#### 2. **Local State**
Each screen manages its own state:
- Form controllers
- Loading states
- Selected filters
- Image data
- Location data

---

## 🔐 Authentication & Security

### Authentication Flow

1. **User Login**:
   - User enters phone number and password
   - Frontend encrypts password using AES-GCM
   - Encrypted data sent to `/auth/login`
   - Backend decrypts and verifies
   - JWT tokens returned
   - Access token saved in secure storage

2. **Token Management**:
   - Token stored in Flutter Secure Storage
   - Automatically included in API requests
   - Header: `Authorization: Bearer {token}`

3. **Route Protection**:
   - Login screen checks for existing token
   - If token exists → Navigate to AppShell
   - If no token → Show login screen

### Encryption

**Client-Side** (`core/services/encryption_service.dart`):
- AES-GCM encryption for passwords
- Same encryption keys as backend/web
- Packed format: `base64(nonce || ciphertext)`

**Features**:
- `encryptJson()` - Encrypt JSON payload
- `packPasswordB64()` - Pack for transmission
- `decryptToJson()` - Decrypt response
- `unpackPasswordB64()` - Unpack received data

---

## 📊 Data Models

### Issue Model (`data/models/issue.dart`)

```dart
class Issue {
  final int id;
  final String description;
  final String status;           // "new", "in_progress", "resolved", "spam"
  final String category;
  final double latitude;
  final double longitude;
  final String? imageUrl;
  final DateTime createdAt;
  final int upvoteCount;
  final int shareCount;
  final User user;
}
```

**Status Values**:
- `new` - Newly reported
- `in_progress` - Being worked on
- `resolved` - Fixed/resolved
- `spam` - Marked as spam

**Category Values**:
- Pothole
- Streetlight
- Garbage
- Water Leakage
- (Others from backend)

---

### User Model (`data/models/user.dart`)

```dart
class User {
  final String name;
  final String? handle;
  final String? avatarUrl;
}
```

---

### Token Model (`data/models/token.dart`)

```dart
class Token {
  final String accessToken;
  final String tokenType;  // Usually "bearer"
}
```

---

## 🔄 User Flows

### Citizen Flow

#### 1. **First Time User**

1. **Launch App**:
   - App opens to LoginScreen
   - No token found → Show login

2. **Registration**:
   - Tap "Sign Up"
   - Enter: Full name, Phone, Password
   - Submit → Account created
   - Navigate back to login

3. **Login**:
   - Enter phone and password
   - Submit → Token received
   - Navigate to AppShell (Home tab)

4. **Explore**:
   - View issues in Home feed
   - View issues on Map
   - Check profile

---

#### 2. **Report Issue Flow**

1. **Navigate to Report**:
   - Tap "Add" tab in bottom nav
   - Opens ReportIssueScreen

2. **Location**:
   - App requests location permission
   - Fetches GPS coordinates
   - Reverse geocodes to address
   - Displays readable address

3. **Add Photo**:
   - Tap "Take photo" or "Add from gallery"
   - Select/capture image
   - Preview shown
   - Can remove and retake

4. **Fill Details**:
   - Enter description
   - (Optional) Tap "AI Suggestion"
   - Select category
   - Select urgency
   - Toggle "Post anonymously" if desired

5. **Submit**:
   - Tap submit button
   - App gets presigned URL
   - Uploads image to storage
   - Creates issue in database
   - Shows success message
   - Navigates back to Home

---

#### 3. **View My Reports**

1. **Navigate**:
   - Tap profile avatar in HomeScreen
   - Opens ProfileScreen
   - (Or access via "My Reports" if implemented)

2. **View Issues**:
   - See list of reported issues
   - View status, category, date
   - Tap to view details (if implemented)

---

#### 4. **View Map**

1. **Navigate**:
   - Tap "Map" tab in bottom nav
   - Opens IssueMapScreen

2. **Interact**:
   - See all issues as markers
   - Zoom/pan map
   - Tap marker to see issue details

---

## 🛠️ Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| flutter | SDK | UI Framework |
| dio | ^5.4.3 | HTTP Client |
| flutter_secure_storage | ^9.2.2 | Secure token storage |
| shared_preferences | ^2.2.3 | Local storage (web fallback) |
| geolocator | ^12.0.0 | GPS location |
| geocoding | ^3.0.0 | Reverse geocoding |
| camera | ^0.11.0 | Camera access |
| image_picker | ^1.1.2 | Image selection |
| flutter_map | ^6.1.0 | Map display |
| web_socket_channel | ^2.4.0 | WebSocket (for notifications) |
| pointycastle | ^3.7.3 | AES-GCM encryption |
| google_fonts | ^6.2.1 | Custom fonts |
| flutter_svg | ^2.0.10+1 | SVG icons |
| lucide_flutter | any | Icon library |
| percent_indicator | ^4.2.3 | Progress indicators |
| timeago | ^3.6.1 | Relative time display |
| share_plus | ^9.0.0 | Social sharing |
| intl | ^0.19.0 | Internationalization |

---

## ✅ Current Status

### Working Features ✅

1. **Authentication**:
   - ✅ Login with encrypted credentials
   - ✅ Registration
   - ✅ Token storage (secure)
   - ✅ Auto-navigation on login

2. **Issue Reporting**:
   - ✅ GPS location detection
   - ✅ Reverse geocoding
   - ✅ Camera/gallery image picker
   - ✅ Image upload to storage
   - ✅ Issue creation
   - ✅ Anonymous posting option
   - ✅ Form validation

3. **Issue Viewing**:
   - ✅ Home feed (all public issues)
   - ✅ Map view with markers
   - ✅ My Reports (user's issues)
   - ✅ Issue cards with images

4. **Navigation**:
   - ✅ Bottom navigation bar
   - ✅ Tab switching
   - ✅ Screen navigation

5. **UI/UX**:
   - ✅ Custom theme
   - ✅ Loading states
   - ✅ Error handling
   - ✅ SnackBar notifications

---

### Partially Implemented ⚠️

1. **Profile Screen**:
   - ⚠️ UI complete, but uses mock data
   - ⚠️ Needs API integration for real user data
   - ⚠️ Trust score calculation needed

2. **Notifications**:
   - ⚠️ UI complete, but uses mock data
   - ⚠️ WebSocket service exists but not integrated
   - ⚠️ Needs real-time notification updates

3. **Settings**:
   - ⚠️ UI complete, but no functionality
   - ⚠️ All buttons are placeholders

4. **Search**:
   - ⚠️ Search bar exists but no functionality
   - ⚠️ Needs API integration

5. **Issue Details**:
   - ⚠️ Tap on issue shows placeholder
   - ⚠️ Needs detail screen implementation

---

### Not Implemented ❌

1. **AI Features**:
   - ❌ AI auto-detection (button exists but placeholder)
   - ❌ AI description generation
   - ❌ AI category suggestion

2. **Social Features**:
   - ❌ Upvote functionality
   - ❌ Share/Reshare functionality
   - ❌ Follow/Followers system

3. **Real-time Features**:
   - ❌ WebSocket notifications (service exists but not used)
   - ❌ Real-time issue updates
   - ❌ Chat system (if planned)

4. **Advanced Features**:
   - ❌ Issue filtering by location
   - ❌ Issue sorting
   - ❌ Issue search
   - ❌ Issue details screen
   - ❌ Edit/Delete own issues

5. **Profile Features**:
   - ❌ Edit profile
   - ❌ Change password
   - ❌ Upload avatar
   - ❌ View trust score history

---

## 📝 API Integration Details

### Authentication Repository (`features/auth/data/auth_repository.dart`)

**Methods**:
- `login(String phoneNumber, String password)` - Login with encryption
- `register({fullName, phoneNumber, password})` - Register with encryption

**Encryption Flow**:
1. Encrypt password: `encryptJson({'secret': password})`
2. Pack: `packPasswordB64(nonce, ciphertext)`
3. Send packed password to backend
4. Backend decrypts and verifies

---

### Issue Repository (`features/issues/data/issue_repository.dart`)

**Methods**:
- `createIssue({description, category, latitude, longitude, imageBytes, isAnonymous})` - Report issue
- `getMyIssues()` - Get user's issues
- `getPublicIssues()` - Get all public issues

**Image Upload Flow**:
1. Get presigned URL from `/issues/initiate-upload`
2. Upload image bytes to presigned URL (PUT request)
3. Extract permanent file URL
4. Create issue with file URL

---

## 🔧 Services

### 1. **EncryptionService** (`core/services/encryption_service.dart`)
**Purpose**: AES-GCM encryption for sensitive data

**Methods**:
- `encryptJson(Map<String, dynamic>)` - Encrypt JSON
- `decryptToJson(String, String)` - Decrypt JSON
- `packPasswordB64(String, String)` - Pack for transmission
- `unpackPasswordB64(String)` - Unpack received data

**Encryption Details**:
- Algorithm: AES-256-GCM
- Key: 32 bytes (from obfuscated key manager)
- Nonce: 12 bytes (random)
- AAD: Additional authenticated data

---

### 2. **StorageService** (`core/services/storage_service.dart`)
**Purpose**: Secure token storage

**Methods**:
- `saveToken(String token)` - Save JWT
- `getToken()` - Get JWT
- `deleteToken()` - Remove JWT

**Implementation**:
- Mobile: Flutter Secure Storage (encrypted)
- Web: SharedPreferences (fallback)

---

### 3. **WebSocketService** (`mobile/lib/core/services/websocket_service.dart`)
**Purpose**: Real-time notifications (exists but not fully integrated)

**Features**:
- WebSocket connection management
- Auto-reconnect on disconnect
- Message stream
- User ID extraction from JWT

**Status**: Service exists but not actively used in current screens

---

## 🎨 UI/UX Features

### Design System

**Colors**:
- Primary: Blue (#4A90E2)
- Secondary: Teal (#50E3C2)
- Background: Light Gray (#F4F6F8)
- Text Dark: Dark Gray (#2D3748)
- Text Light: Medium Gray (#718096)
- Success: Green (#38A169)
- Error: Red (#E53E3E)
- Warning: Yellow (#D69E2E)

**Typography**:
- Google Fonts (Poppins)
- Material 3 design system

**Components**:
- Rounded corners (12px default)
- Card elevation
- Consistent spacing
- Icon + text combinations

---

### Navigation Patterns

1. **Bottom Navigation**:
   - 4 main tabs
   - Persistent state (IndexedStack)
   - Visual feedback on selection

2. **Modal Navigation**:
   - Profile from avatar
   - Notifications from bell
   - Settings from profile

3. **Form Navigation**:
   - Report issue → Submit → Back to home
   - Signup → Success → Back to login

---

## 📱 Permissions

### Android Permissions (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
```

**Permission Handling**:
- Location: Requested at runtime
- Camera: Requested when needed
- Storage: Requested when needed

---

## 🔍 Current Limitations

### Known Issues

1. **Profile Data**:
   - Uses hardcoded mock data
   - Needs API integration

2. **Notifications**:
   - Uses mock data
   - WebSocket not connected

3. **Search**:
   - UI exists but no functionality

4. **Issue Details**:
   - Tap on issue doesn't navigate
   - No detail screen

5. **Social Features**:
   - Upvote/share buttons are placeholders

6. **AI Features**:
   - AI suggestion button is placeholder

---

## 🚀 Planned Enhancements

### Short Term

1. **API Integration**:
   - Connect ProfileScreen to real API
   - Connect NotificationScreen to WebSocket
   - Implement search functionality

2. **Issue Details**:
   - Create IssueDetailScreen
   - Navigate from cards/markers
   - Show full issue information

3. **Real-time Updates**:
   - Integrate WebSocket service
   - Show real-time notifications
   - Update issue status in real-time

---

### Long Term

1. **AI Integration**:
   - Image detection (YOLOv8)
   - Auto-categorization
   - Description generation

2. **Social Features**:
   - Upvote system
   - Share/Reshare
   - Follow system

3. **Advanced Features**:
   - Offline support
   - Push notifications
   - Issue editing
   - Comment system
   - Issue verification

---

## 📋 File Structure Summary

### Key Files

**Entry Point**:
- `main.dart` - App initialization

**Core**:
- `core/api/api_client.dart` - HTTP client
- `core/services/encryption_service.dart` - Encryption
- `core/services/storage_service.dart` - Storage
- `core/theme/app_theme.dart` - Theme

**Features**:
- `features/auth/` - Login/Signup
- `features/home/` - Home feed
- `features/issue_map/` - Map view
- `features/issues/` - Issue reporting
- `features/my_reports/` - User's issues
- `features/profile/` - Profile
- `features/notifications/` - Notifications
- `features/settings/` - Settings
- `features/shell/` - App container

**Data**:
- `data/models/issue.dart` - Issue model
- `data/models/user.dart` - User model
- `data/models/token.dart` - Token model

---

## 🔗 Backend Integration

### Base URL Configuration

**Current**: `https://bnc51nt1-8585.inc1.devtunnels.ms/`

**Configuration Options**:
- Android Emulator: `http://10.0.2.2:8585/`
- iOS Simulator: `http://127.0.0.1:8585/`
- Physical Device: Dev tunnel URL or `localhost` with ADB
- Production: Backend production URL

---

### Authentication Headers

All authenticated requests include:
```
Authorization: Bearer {access_token}
```

Token retrieved from secure storage automatically.

---

## 📊 Data Flow

### Issue Reporting Flow

```
User Input
  ↓
Form Validation
  ↓
Get Location (GPS)
  ↓
Reverse Geocode
  ↓
Select/Capture Image
  ↓
Get Presigned URL
  ↓
Upload Image
  ↓
Create Issue
  ↓
Success → Navigate Back
```

---

### Issue Viewing Flow

```
App Launch
  ↓
Check Auth Token
  ↓
If Authenticated → AppShell
  ↓
Fetch Issues (GET /issues)
  ↓
Display in List/Map
  ↓
User Interaction
```

---

## 🎯 User Experience

### Loading States

- **CircularProgressIndicator** for async operations
- **FutureBuilder** for data fetching
- **Loading overlay** during form submission

### Error Handling

- **SnackBar** for error messages
- **Try-catch** blocks around API calls
- **User-friendly error messages**

### Success Feedback

- **SnackBar** for success messages
- **Navigation** after successful actions
- **Visual confirmation** (e.g., checkmarks)

---

## 📝 Development Notes

### Code Organization

- **Feature-based structure** - Each feature in its own folder
- **Separation of concerns** - Data, presentation, widgets
- **Reusable components** - Cards, buttons, etc.
- **Service layer** - API, storage, encryption

### Best Practices

- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Secure storage
- ✅ Encrypted authentication
- ⚠️ Needs: State management solution (for complex state)
- ⚠️ Needs: Dependency injection
- ⚠️ Needs: Error recovery strategies

---

## 🧪 Testing Status

### Current Testing

- ❌ No unit tests
- ❌ No widget tests
- ❌ No integration tests

### Recommended Tests

1. **Unit Tests**:
   - Encryption service
   - Storage service
   - Data models
   - Repositories

2. **Widget Tests**:
   - Login screen
   - Issue cards
   - Form validation

3. **Integration Tests**:
   - Complete user flows
   - API integration
   - Navigation

---

## 📚 Additional Resources

### Configuration Files

- `pubspec.yaml` - Dependencies
- `analysis_options.yaml` - Linting rules
- `android/app/src/main/AndroidManifest.xml` - Android config
- `ios/Runner/Info.plist` - iOS config (if exists)

### Documentation Files

- `README.md` - Project overview
- Various fix/setup guides in root

---

## 🎯 Summary

### What's Working ✅

- ✅ Complete authentication flow
- ✅ Issue reporting with image upload
- ✅ Issue viewing (list and map)
- ✅ User's reported issues
- ✅ Basic navigation
- ✅ Secure token storage
- ✅ Encrypted password transmission

### What Needs Work ⚠️

- ⚠️ Profile API integration
- ⚠️ Real-time notifications
- ⚠️ Search functionality
- ⚠️ Issue details screen
- ⚠️ Social features (upvote, share)
- ⚠️ AI features
- ⚠️ Settings functionality

### Architecture Strengths

- ✅ Clean feature-based structure
- ✅ Separation of concerns
- ✅ Reusable components
- ✅ Secure by default
- ✅ Good error handling

### Architecture Improvements Needed

- ⚠️ State management (for complex state)
- ⚠️ Dependency injection
- ⚠️ Better error recovery
- ⚠️ Offline support
- ⚠️ Caching strategy

---

**Last Updated**: December 2025
**Version**: 1.0.0
**Status**: Core Features Working ✅

---

*This documentation covers all features, screens, components, and functionality of the mobile application. Use this as a reference for understanding the app architecture and planning future enhancements.*

