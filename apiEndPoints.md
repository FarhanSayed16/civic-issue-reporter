However, to build the full-featured, impressive prototype we planned for the hackathon, we need to expand this blueprint significantly. The provided list is missing crucial endpoints for the **admin dashboard** (like filtering and analytics) and the **crowdsourcing features** (like upvoting) that will win you points.

Here is the revised and enhanced plan, starting with a complete API endpoint blueprint.

---
### ## 🗺️ The Revised API Endpoint Blueprint

This is a more comprehensive list of endpoints that will fully support both the citizen app and the powerful admin dashboard we designed.

#### **Authentication**
* `POST /auth/register` - Register a new citizen user. *(Citizen App)*
* `POST /auth/login` - Authenticate a user (citizen or admin) and receive a JWT. *(Both)*

---
#### **Users (Citizen-Facing)**
* `GET /users/me` - Get the profile of the currently logged-in user. *(Citizen App)*
* `GET /users/me/issues` - Get a list of all issues submitted by the current user. *(Citizen App)*

---
#### **Issues (Citizen-Facing)**
* `POST /issues/initiate-upload` - **(Enhancement)** Step 1 of reporting. The app asks the backend for a secure, one-time URL to upload a photo. This is more scalable. *(Citizen App)*
* `POST /issues` - **(Enhancement)** Step 2 of reporting. After the photo is uploaded, the app sends the issue details (location, description, photo URL) to this endpoint. *(Citizen App)*
* `GET /issues` - Get a list of nearby, public issues to display on the citizen's map. *(Citizen App)*
* `GET /issues/{issue_id}` - Get the detailed information for a single issue. *(Citizen App)*
* `POST /issues/{issue_id}/upvote` - **(Enhancement)** Increment the "same issue" counter for an existing report. *(Citizen App)*

---
#### **Admin / Operations (The Command Center)**
* `GET /admin/issues` - **(Crucial Addition)** Get a list of *all* issues with powerful filtering capabilities. The React dashboard will use this heavily. *(Admin Dashboard)*
    * **Query Parameters:** `?status=new`, `?ward=Andheri`, `?category=Pothole`, `?sort_by=upvote_count`
* `PATCH /admin/issues/{issue_id}` - **(Crucial Addition)** A general endpoint for an admin to update an issue (change status, assign department, add internal notes). *(Admin Dashboard)*
* `DELETE /admin/issues/{issue_id}` - **(Crucial Addition)** For an admin to delete a spam or invalid report. *(Admin Dashboard)*
* `GET /admin/users` - **(Enhancement)** Get a list of all users for user management. *(Admin Dashboard)*

---
#### **Analytics (The "Wow" Factor)**
* `GET /analytics/stats` - **(Crucial Addition)** Get key KPI numbers for the dashboard header (e.g., `{ "total_issues": 125, "resolved_today": 15, "pending": 42 }`). *(Admin Dashboard)*
* `GET /analytics/heatmap` - **(Crucial Addition)** Get a list of all issue coordinates to generate the heatmap visualization. *(Admin Dashboard)*

---
#### **Real-time Updates**
* `WS /ws/updates/{user_id}` - A WebSocket endpoint for the citizen app to receive live status updates for their reported issues.

