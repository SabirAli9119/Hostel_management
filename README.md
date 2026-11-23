# Hostel Desk
## Hostel Management System — MERN Stack

Hostel Desk is a full-stack hostel management system built using the MERN stack (MongoDB, Express.js, React.js, and Node.js).

The application provides separate portals for administrators and residents, enabling efficient hostel administration, room allocation, resident management, and maintenance request tracking.

**Project Status:** Frontend and backend implementation completed.

---

## 1. Key Features

### Resident Portal
- Secure registration and authentication
- Resident dashboard with room and request statistics
- Profile management
- Room details and occupancy information
- Submit, edit, view, and cancel requests
- Track request status and administrative responses
- Change password and reset forgotten password

### Admin Portal
- Admin dashboard with hostel statistics
- Manage resident accounts
- Create, update, and deactivate rooms
- Allocate and reassign residents to rooms
- Monitor room capacity and bed availability
- Manage resident requests
- Update request status and provide responses
- View resident and room details

### Security and Reliability
- JWT authentication using HttpOnly cookies
- Role-based access control
- Password hashing with bcrypt
- API rate limiting
- Input validation and sanitization
- Secure room allocation
- Protected administrative endpoints

---

## 2. Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, HttpOnly Cookies |
| Password Security | bcryptjs |
| API Communication | Axios |
| Development | Vite, Nodemon |

---

## 3. Project Structure

```text
hostel-management-system/
│
├── client/                         # React + Vite frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.example
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── assets/
│       │   └── styles.css
│       │
│       ├── components/
│       │   ├── Button
│       │   ├── FormField
│       │   ├── DataTable
│       │   ├── Modal
│       │   ├── BedMeter
│       │   └── RoomTag
│       │
│       ├── context/
│       │   ├── AuthContext
│       │   └── ToastContext
│       │
│       ├── hooks/
│       │   ├── useAuth
│       │   ├── useFetch
│       │   ├── useForm
│       │   ├── useListQuery
│       │   ├── useDebounce
│       │   └── useToast
│       │
│       ├── layouts/
│       │   ├── AuthLayout
│       │   ├── DashboardLayout
│       │   └── navigation.js
│       │
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login
│       │   │   ├── Register
│       │   │   └── ResetPassword
│       │   │
│       │   ├── user/
│       │   │   ├── UserDashboard
│       │   │   ├── UserProfile
│       │   │   ├── RoomDetails
│       │   │   ├── SubmitRequest
│       │   │   ├── MyRequests
│       │   │   ├── UserRequestDetails
│       │   │   └── ChangePassword
│       │   │
│       │   └── admin/
│       │       ├── AdminDashboard
│       │       ├── ManageUsers
│       │       ├── UserDetails
│       │       ├── ManageRooms
│       │       ├── RoomForm
│       │       ├── AdminRoomDetails
│       │       ├── RoomAllocation
│       │       ├── ManageRequests
│       │       ├── AdminRequestDetails
│       │       └── AdminProfile
│       │
│       ├── routes/
│       │   ├── AppRoutes
│       │   └── ProtectedRoute
│       │
│       ├── services/
│       │   ├── api (Axios)
│       │   ├── auth services
│       │   ├── user services
│       │   ├── room services
│       │   ├── request services
│       │   └── admin services
│       │
│       └── utils/
│           ├── constants
│           ├── validators
│           └── format
│
├── server/                         # Express + MongoDB backend
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── constants.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   └── Request.js
│   │
│   ├── controllers/
│   │   ├── auth
│   │   ├── user
│   │   ├── room
│   │   ├── request
│   │   ├── adminUser
│   │   ├── adminRoom
│   │   ├── adminRequest
│   │   └── adminDashboard
│   │
│   ├── routes/
│   │   ├── authRoutes
│   │   ├── userRoutes
│   │   ├── roomRoutes
│   │   ├── requestRoutes
│   │   └── adminRoutes
│   │
│   ├── middleware/
│   │   ├── auth (protect, authorize)
│   │   ├── errorHandler
│   │   ├── rateLimiters
│   │   ├── sanitize
│   │   ├── security
│   │   └── validateObjectId
│   │
│   ├── utils/
│   │   ├── validators
│   │   ├── roomAllocation
│   │   ├── generateToken
│   │   ├── pagination
│   │   ├── query
│   │   └── AppError
│   │
│   └── scripts/
│       └── seedAdmin.js
│
└── README.md
```

---

## 4. Installation and Setup

### Prerequisites

Ensure the following software is installed:

- Node.js and npm
- MongoDB Community Server or a MongoDB Atlas account
- Git (optional)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd hostel-management-system
```

### Step 2: Configure the Backend

Open a terminal and navigate to the server directory.

```powershell
cd hostel-management-system\server
npm install
```

Create the environment configuration file:

```powershell
copy .env.example .env
notepad .env
```

Configure the required environment variables:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/hostel_desk

JWT_SECRET=your_secure_random_secret

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_FULL_NAME=Hostel Administrator
ADMIN_DOB=2000-01-01
```

Use the exact variable names provided in `server/.env.example`. Additional environment variables may be required by your implementation.

Generate a secure JWT secret using PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Replace the example credentials with secure values before running the application.

### Step 3: Create the Administrator Account

Run the admin seed script:

```powershell
npm run seed:admin
```

This creates the initial administrator account using the configured environment variables.

To reset the administrator password later:

```powershell
npm run seed:admin -- --reset
```

### Step 4: Start the Backend

```powershell
npm run dev
```

The backend API will be available at:

- API Base URL: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

Ensure MongoDB is running before starting the backend.

---

## 5. Frontend Setup

Open a second terminal and navigate to the client directory.

```powershell
cd hostel-management-system\client
npm install
npm run dev
```

The frontend will be available at:

**http://localhost:5173**

The Vite development server proxies API requests from `/api` to `http://localhost:5000`.

If the backend is not running, pages that require API data will display a server connection error.

### Production Build

To generate the production frontend build:

```bash
npm run build
```

The generated files will be available in:

```text
client/dist/
```

To preview the production build locally:

```bash
npm run preview
```

---

## 6. Application Access

| Portal | URL |
|---|---|
| Resident Portal | `http://localhost:5173` |
| Administrator Portal | `http://localhost:5173/admin/dashboard` |
| Backend API | `http://localhost:5000/api` |
| API Health Check | `http://localhost:5000/api/health` |

Residents can register through the application.

Administrators must sign in using the credentials configured in the backend environment file.

---

## 7. Testing and Validation

Use the following checklist to verify the application's core functionality.

### Authentication and Registration

1. Register a resident with the room type `2 Sharing`.
2. Sign in using the resident credentials.
3. Verify that the dashboard displays **No room assigned yet**.

### Room Management and Allocation

4. Sign in as an administrator.
5. Navigate to Rooms and create a room with:
   - Room Number: `101`
   - Floor: `1`
   - Room Type: `2 Sharing`
6. Open Room Allocation and locate residents waiting for a room.
7. Assign room 101 to the first resident.
8. Verify that the resident dashboard displays room 101 with one occupied bed.
9. Register additional residents and assign them to the same room.
10. Verify that assigning a resident beyond the room's capacity fails with the message:

   `Room 101 is full`

11. Create another room of the same type and verify that additional residents can be allocated.
12. Move a resident to another room and confirm that:
    - The previous room's occupancy decreases.
    - The new room's occupancy increases.
    - The resident has only one room assignment.

### Resident Requests

13. Submit a resident request.
14. Edit the request while it is pending.
15. Sign in as an administrator and update the request status to:
    - In Progress
    - Resolved
    - Rejected
16. When rejecting a request, provide a rejection reason.
17. Verify that the resident can view the administrative response and request history.

### Password Reset

18. Open the Forgot Password page.
19. Submit the username, date of birth, and new password.
20. Verify that an incorrect date of birth returns a generic error.
21. Verify that five unsuccessful attempts trigger a 15-minute rate limit.

### Account and Authorization

22. Deactivate a resident account from the admin portal.
23. Verify that the resident can no longer sign in.
24. Verify that requests from an inactive resident are rejected.
25. Attempt to access the administrator dashboard as a resident:

    `http://localhost:5173/admin/dashboard`

26. Verify that the frontend redirects the resident.
27. Call an `/api/admin/...` endpoint using a resident session and verify that the backend returns **403 Forbidden**.

---

## 8. Security Implementation

The application incorporates the following security measures.

### Authentication and Session Management

- JWT authentication is implemented using HttpOnly cookies.
- Cookies use `SameSite=Lax` by default.
- Cookies use the `Secure` flag in production.
- Password changes and password resets invalidate previously issued authentication tokens.

### Authorization

- Role-based access control separates administrators and residents.
- Roles and account status are never accepted from request bodies.
- Administrator accounts can only be created through the admin seed script.
- Resident APIs do not expose administrator accounts.
- Password reset using date of birth is not permitted for administrator accounts.
- Backend authorization is enforced independently of frontend route protection.

### Password Security

- Passwords are hashed using bcryptjs with 12 salt rounds.
- Password hashes are never included in API responses.
- Passwords must contain:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number

### Rate Limiting

| Endpoint / Operation | Limit |
|---|---|
| Login | 10 attempts per 15 minutes |
| Password Reset | 5 attempts per 15 minutes |
| Registration | 20 requests per hour |
| General API | 600 requests per 15 minutes |

Login limits apply to failed attempts.

### Input Validation and Sanitization

- Request bodies and query parameters are sanitized.
- MongoDB operators and dotted keys are removed from user input.
- Filter values are validated against expected types and allowed values.
- Search strings are escaped before being used in regular expressions.
- MongoDB ObjectIds are validated before database operations.

### Room Allocation Integrity

Room allocation uses atomic conditional database updates to prevent overbooking.

The allocation logic ensures that:

- A room cannot exceed its configured capacity.
- A resident cannot be assigned to multiple rooms simultaneously.
- Concurrent allocation attempts cannot exceed the available bed count.

The implementation avoids requiring database transactions for the supported allocation workflow.

---

## 9. Deployment Configuration

When deploying the application behind a reverse proxy or hosting platform such as Render, Railway, or Nginx, configure the following environment variables as required.

```env
TRUST_PROXY=true
```

When the frontend and backend are hosted on different domains, configure:

```env
COOKIE_SAMESITE=none
```

Cross-site cookies must also use HTTPS and the `Secure` flag.

Ensure that:

- Environment files are not committed to version control.
- Production secrets are stored securely.
- MongoDB access is restricted.
- HTTPS is enabled.
- CORS and cookie settings match the deployed frontend and backend domains.

---

## 10. API Documentation

### Base URL

```text
/api
```

Authentication is maintained through an HttpOnly JWT cookie. The frontend must send requests with credentials enabled.

### Standard Validation Error

Validation failures return HTTP `400 Bad Request`.

```json
{
  "message": "Validation failed",
  "errors": {
    "field": "Invalid field value"
  }
}
```

An incorrect current password must return **400 Bad Request**, not `401 Unauthorized`, so the frontend does not treat the session as expired.

### User Object

Returned by login, `/auth/me`, and profile update operations.

```json
{
  "_id": "user_id",
  "fullName": "Resident Name",
  "username": "resident01",
  "dob": "2000-01-01",
  "gender": "male",
  "phone": "9876543210",
  "roomType": "2 Sharing",
  "role": "user",
  "status": "active",
  "createdAt": "timestamp",
  "assignedRoom": null
}
```

The `assignedRoom` property is populated when a room has been allocated.

### Room Object

```json
{
  "_id": "room_id",
  "roomNumber": "101",
  "floor": 1,
  "roomType": "2 Sharing",
  "capacity": 2,
  "occupancy": 1,
  "availableBeds": 1,
  "status": "active",
  "assignedUsers": [
    {
      "_id": "user_id",
      "fullName": "Resident Name",
      "username": "resident01",
      "phone": "9876543210"
    }
  ]
}
```

For resident access to `GET /rooms/:id`, the `assignedUsers` array only needs to include `_id` and `fullName`.

### Request Object

```json
{
  "_id": "request_id",
  "title": "Water Supply Issue",
  "category": "Maintenance",
  "description": "Water supply is unavailable.",
  "priority": "medium",
  "status": "pending",
  "adminResponse": "",
  "rejectionReason": "",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "resolvedAt": null,
  "user": {
    "_id": "user_id",
    "fullName": "Resident Name",
    "username": "resident01"
  },
  "history": [
    {
      "status": "pending",
      "note": "Request submitted",
      "at": "timestamp"
    }
  ]
}
```

The `user` field is populated for administrator views.

### List Response Format

All paginated list endpoints return:

```json
{
  "users": [],
  "pagination": {
    "page": 1,
    "pages": 1,
    "total": 0
  }
}
```

The collection key varies by endpoint:

- `users`
- `rooms`
- `requests`

Supported pagination and search parameters:

| Parameter | Description |
|---|---|
| `page` | Current page |
| `limit` | Number of records per page |
| `search` | Search query |

Additional filters are documented below.

---

## 11. API Endpoints

### Authentication

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `fullName, username, dob, gender, phone, roomType, password, confirmPassword` | `{ message }` |
| POST | `/auth/login` | `username, password` | `{ user }` |
| POST | `/auth/logout` | None | `{ message }` |
| POST | `/auth/reset-password` | `username, dob, newPassword, confirmPassword` | `{ message }` |
| GET | `/auth/me` | None | `{ user }` |
| POST | `/auth/change-password` | `currentPassword, newPassword, confirmPassword` | `{ message }` |

### Resident Endpoints

| Method | Endpoint | Request Body / Query | Response |
|---|---|---|---|
| GET | `/users/profile` | None | `{ user }` |
| PUT | `/users/profile` | `fullName, phone, gender` | `{ user }` |
| GET | `/users/dashboard` | None | `{ stats, recentRequests }` |
| GET | `/rooms/:id` | Own room only | `{ room }` |
| POST | `/requests` | `title, category, description, priority` | `{ request }` |
| GET | `/requests/my-requests` | `search, status` | Paginated list |
| GET | `/requests/:id` | Own request only | `{ request }` |
| DELETE | `/requests/:id` | Pending requests only | `{ message }` |

Resident dashboard statistics:

```json
{
  "stats": {
    "totalRequests": 0,
    "pendingRequests": 0,
    "resolvedRequests": 0
  },
  "recentRequests": []
}
```

### Administrator Dashboard

| Method | Endpoint | Request Body / Query | Response |
|---|---|---|---|
| GET | `/admin/dashboard` | None | `{ stats, recentRequests }` |

Dashboard statistics include:

```text
totalUsers
activeUsers
inactiveUsers
totalRooms
occupiedRooms
availableRooms
totalBeds
occupiedBeds
availableBeds
totalRequests
pendingRequests
inProgressRequests
resolvedRequests
rejectedRequests
```

### Administrator — Resident Management

| Method | Endpoint | Request Body / Query | Response |
|---|---|---|---|
| GET | `/admin/users` | `search, status, roomType, allocation` | Paginated list |
| GET | `/admin/users/:id` | None | `{ user, requests }` |
| PUT | `/admin/users/:id` | `fullName, phone, gender, dob, roomType, status` | `{ user }` |
| DELETE | `/admin/users/:id` | None; releases assigned bed | `{ message }` |

The `allocation` filter supports:

```text
assigned
unassigned
```

### Administrator — Room Management

| Method | Endpoint | Request Body / Query | Response |
|---|---|---|---|
| GET | `/admin/rooms` | `search, roomType, status, availability` | Paginated list |
| POST | `/admin/rooms` | `roomNumber, floor, roomType, capacity, status` | `{ room }` |
| GET | `/admin/rooms/:id` | None | `{ room }` |
| PUT | `/admin/rooms/:id` | Room update fields | `{ room }` |
| DELETE | `/admin/rooms/:id` | Empty rooms only | `{ room }` |
| POST | `/admin/rooms/:id/assign-user` | `userId` | `{ room }` |
| POST | `/admin/rooms/:id/remove-user` | `userId` | `{ room }` |

The `availability` filter supports:

```text
available
full
```

Room assignment automatically moves a resident from their previous room when applicable.

### Administrator — Request Management

| Method | Endpoint | Request Body / Query | Response |
|---|---|---|---|
| GET | `/admin/requests` | `search, status, category, priority` | Paginated list |
| GET | `/admin/requests/:id` | None | `{ request }` |
| PUT | `/admin/requests/:id` | `status, adminResponse, rejectionReason` | `{ request }` |

A rejection reason is mandatory when the request status is changed to `Rejected`.

---

## 12. Routing and Access Control

Frontend routes are organized by user role.

### Resident Routes

```text
/user/...
```

Residents can access their own profile, room information, dashboard, and requests.

### Administrator Routes

```text
/admin/...
```

Administrators can access management features for residents, rooms, requests, and dashboard statistics.

Frontend route protection improves the user experience, but **all permissions must also be enforced by backend middleware**.

---

## 13. Validation Rules

### Phone Number

Phone numbers must contain:

- 10 to 13 digits
- An optional leading `+`

### Password

Passwords must contain:

- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Room Allocation

Residents can only be allocated to active rooms that:

- Match the resident's room type
- Have at least one available bed

Room capacity must never be exceeded.

---

## 14. Development Notes

- The frontend is built with React and Vite using JavaScript.
- TypeScript is not used.
- The frontend and backend are developed and run independently.
- The frontend communicates with the backend through the `/api` proxy.
- The application uses MongoDB for persistent storage.
- Administrator accounts are created through the backend seed script.
- Authentication and authorization are handled by the backend.

---

## 15. License

This project is intended for educational and hostel administration purposes.

Add an appropriate license file before distributing the project publicly.
