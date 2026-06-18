# LearnHub Frontend

LearnHub frontend is a React learning project for an eLearning platform. It connects to the LearnHub Express API and demonstrates routing, authentication, protected pages, role-based dashboards, forms, API calls, loading states, and feedback messages.

## Tech Stack

- ReactJS with normal JavaScript
- React Router for page navigation
- Axios for API requests
- Bootstrap for responsive UI
- Vite for development and builds

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create the environment file:

```bash
cp .env.example .env
```

3. Confirm the backend URL:

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000
```

4. Start the app:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Folder Structure

- `components/` contains reusable UI such as navigation, course cards, alerts, loading spinners, and route guards.
- `context/AuthContext.jsx` stores the current user, JWT token, login, register, and logout functions.
- `layouts/` contains shared page layouts for public pages and dashboards.
- `pages/public/` contains home, about, browsing, details, login, and registration pages.
- `pages/teacher/` contains teacher dashboard, course management, lessons, assignments, and grading pages.
- `pages/student/` contains student dashboard, enrolled courses, learning page, assignment submission, and grades.
- `pages/admin/` contains admin statistics, user management, course management, and category management.
- `services/` contains Axios API functions grouped by backend resource.
- `utils/` contains small helper functions such as date formatting.

## Important React Concepts

### Routing

`App.jsx` uses React Router. Public routes are available to everyone. Dashboard routes are nested so teacher, student, and admin pages share the same `DashboardLayout`.

### AuthContext

`AuthContext.jsx` loads the token from `localStorage`, checks `/api/auth/me`, and exposes the current user to the rest of the app. This lets components know whether a user is logged in and what role they have.

### Protected Routes

`ProtectedRoute.jsx` prevents guests from opening dashboard pages. If no user is logged in, it redirects to `/login`.

### Role-Based Routes

`RoleBasedRoute.jsx` checks whether the current user's role is allowed. This keeps students out of teacher/admin pages and keeps teachers out of admin pages.

### API Calls

`services/api.js` creates one Axios instance. Its interceptor attaches the JWT token to requests, so service functions do not need to repeat authorization code.

### Forms

Form pages keep input values in React state. On submit, they call a service function, show an error if the API rejects the request, or navigate/update the page after success. Upload forms use `FormData` for files.

## Role Features

### Public

- Home page
- About page
- Browse courses
- Search and filter courses
- Course details
- Login and registration

### Teacher/Lecturer

- Dashboard statistics
- Create, edit, and deactivate own courses
- Add lessons and upload materials
- Create assignments
- View submissions
- Grade submissions and add feedback

### Student

- Dashboard statistics
- Enroll in courses
- View enrolled courses
- Open lessons and download materials
- View assignments
- Submit assignment files
- View grades and feedback
- Update course progress

### Admin

- Dashboard statistics
- Activate/deactivate users
- Activate/deactivate courses
- Create and manage categories

## Default Login Accounts

Use the sample accounts from the backend seed data:

- Admin: `admin@learnhub.test`
- Teacher: `grace.teacher@learnhub.test`
- Student: `brian.student@learnhub.test`

Password for all seeded accounts: `Password123!`
