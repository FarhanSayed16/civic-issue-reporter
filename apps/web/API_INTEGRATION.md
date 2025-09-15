# API Integration Guide

This document describes the API integration between the frontend and backend for the Civic Issue Reporter application.

## API Structure

The frontend now includes comprehensive API slices that connect to all backend endpoints:

### Authentication API (`auth.api.js`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Token refresh

### User API (`user.api.js`)
- `GET /users/me` - Get current user profile
- `GET /users/me/issues` - Get user's reported issues

### Issues API (`issues.api.js`)
- `POST /issues/initiate-upload` - Get presigned URL for file upload
- `POST /issues` - Create new issue
- `GET /issues` - Get all issues with filtering
- `GET /issues/{id}` - Get specific issue
- `POST /issues/{id}/upvote` - Upvote an issue
- `PATCH /issues/{id}/status` - Update issue status

### Admin API (`admin.api.js`)
- `GET /admin/issues` - Get all issues for admin dashboard
- `PATCH /admin/issues/{id}` - Update issue details
- `DELETE /admin/issues/{id}` - Delete issue
- `GET /admin/users` - Get all users for admin

### Analytics API (`analytics.api.js`)
- `GET /analytics/stats` - Get dashboard statistics
- `GET /analytics/heatmap` - Get heatmap data

### Notifications API (`notifications.api.js`)
- WebSocket connections for real-time updates

## Configuration

Set the API URL in your environment:
```bash
VITE_API_URL=http://localhost:8000
```

## Usage Examples

### Authentication
```javascript
import { useLoginMutation, useRegisterMutation } from '../features/api/auth.api';

const [login] = useLoginMutation();
const [register] = useRegisterMutation();

// Login
await login({ username: "phone_number", password: "password" });

// Register
await register({ full_name: "John Doe", phone_number: "1234567890", password: "password" });
```

### Issues
```javascript
import { useGetIssuesQuery, useCreateIssueMutation } from '../features/api/issues.api';

const { data: issues } = useGetIssuesQuery();
const [createIssue] = useCreateIssueMutation();

// Create issue
await createIssue({
  category: "road_issues",
  description: "Pothole on Main Street",
  lat: 12.9716,
  lng: 77.5946,
  media_urls: ["https://example.com/image.jpg"]
});
```

### Analytics
```javascript
import { useGetStatsQuery } from '../features/api/analytics.api';

const { data: stats } = useGetStatsQuery();
// stats contains: total_issues, resolved_today, pending, in_progress, etc.
```

## Authentication Flow

1. User logs in with phone number and password
2. Backend returns JWT tokens (access_token, refresh_token)
3. Frontend stores tokens in Redux state and localStorage
4. All subsequent API calls include the access token in Authorization header
5. On 401 errors, frontend automatically attempts token refresh
6. If refresh fails, user is logged out

## Error Handling

All API calls include proper error handling:
- Network errors are caught and displayed to users
- 401 errors trigger automatic token refresh
- Validation errors are shown with specific field messages
- Server errors are logged and user-friendly messages are displayed

## Real-time Updates

WebSocket connections are available for:
- User-specific notifications
- Issue-specific updates
- Real-time status changes

## Testing

To test the API integration:

1. Start the backend server: `cd Backend && python start.py`
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to `http://localhost:3000`
4. Try registering a new user or logging in
5. Test issue reporting and browsing

## Notes

- All API calls are properly typed with TypeScript
- Caching is handled by RTK Query
- Authentication state is persisted across browser sessions
- The frontend gracefully handles loading and error states
