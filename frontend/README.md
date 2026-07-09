# UG Scholar — Frontend

UG Scholar Frontend is a React application for an adaptive Learning Management System (LMS). It connects to the UG Scholar Express API and provides routing, authentication, role-based dashboards, premium subscription management, quiz timer, announcements, password reset, and profile management.

## Tech Stack

- **React 18** with modern JavaScript (JSX)
- **React Router 6** for page navigation
- **Axios** for API requests with JWT interceptors
- **Bootstrap 5** for responsive UI
- **Vite 8** for development and production builds

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create the environment file:

```bash
cp .env.example .env
```

3. Confirm the backend URL (default port is 5000, but can be changed in `server.js`):

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

- `components/` — Reusable UI: Navbar, Modal, CourseCard, LoadingSpinner, AlertMessage, ProtectedRoute, RoleBasedRoute, AnnouncementsList, UpgradePrompt, PremiumGate
- `context/` — AuthContext: stores current user, JWT token, login/register/logout functions
- `layouts/` — DashboardLayout (shared sidebar for all roles), PublicLayout
- `pages/public/` — Home, About, Login, Register, BrowseCourses, CourseDetails, ForgotPassword, ResetPassword, Pricing
- `pages/teacher/` — Dashboard, course management, lessons, assignments, submissions/grading
- `pages/student/` — Dashboard, my courses, CourseLearning (with announcements), TakeQuiz (with countdown timer), assignments, grades
- `pages/parent/` — ParentDashboard, ChildActivity
- `pages/admin/` — AdminDashboard, ManageUsers, ManageCourses, ManageCategories, ManageSubscriptions
- `pages/` — Profile, SubscriptionManage (top-level protected routes)
- `services/` — Axios API functions grouped by backend resource
- `utils/` — Helper functions (formatDate, etc.)

## Routing

| Path | Component | Access |
|------|-----------|--------|
| `/` | Home | Public |
| `/about` | About | Public |
| `/courses` | BrowseCourses | Public |
| `/courses/:id` | CourseDetails | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | ForgotPassword | Public |
| `/reset-password` | ResetPassword | Public |
| `/pricing` | Pricing | Public |
| `/profile` | Profile | Authenticated |
| `/subscription` | SubscriptionManage | Authenticated |
| `/teacher/*` | Teacher pages | Teacher role |
| `/student/*` | Student pages | Student role |
| `/parent/*` | Parent pages | Parent role |
| `/admin/*` | Admin pages | Admin role |

## Important React Concepts

### Routing

`App.jsx` uses React Router. Public routes are available to everyone. Dashboard routes are nested so teacher, student, parent, and admin pages share the same `DashboardLayout`.

### AuthContext

`AuthContext.jsx` loads the token from `localStorage`, checks `/api/auth/me`, and exposes the current user to the rest of the app. This lets components know whether a user is logged in and what role they have.

### Protected Routes

`ProtectedRoute.jsx` prevents guests from opening dashboard pages. If no user is logged in, it redirects to `/login`. Accepts an optional `redirectTo` prop.

### Role-Based Routes

`RoleBasedRoute.jsx` checks whether the current user's role is allowed. This keeps students out of teacher/admin pages and keeps teachers out of admin pages.

### API Calls

`services/api.js` creates one Axios instance. Its interceptor attaches the JWT token to requests, so service functions do not need to repeat authorization code.

### Forms

Form pages keep input values in React state. On submit, they call a service function, show an error if the API rejects the request, or navigate/update the page after success. Upload forms use `FormData` for files.

## Role Features

### Public (No Login Required)

- Home page with hero section
- About page
- Browse and search courses
- Filter courses by category
- Course details with lessons preview
- Login and registration
- Forgot/reset password flow
- Pricing page with subscription plan comparison

### Teacher / Lecturer

- Dashboard statistics
- Create, edit, and deactivate own courses (gated by subscription)
- Add lessons and upload materials
- Create assignments and quizzes
- View and grade submissions (grade notifications sent)
- Post and manage course announcements

### Student

- Dashboard statistics
- Browse and enroll in courses (gated by subscription)
- View enrolled courses with progress tracking
- Open lessons and download materials
- Take quizzes with countdown timer and auto-submit
- View and submit assignments
- View grades and feedback
- See course announcements

### Parent

- Dashboard with linked children overview
- Link/unlink children
- Create time-based usage rules (gated by subscription)
- View child activity logs

### Admin

- Dashboard statistics
- Activate/deactivate users and courses
- Create and manage course categories
- View and manage all subscriptions
- Assign/cancel subscription plans manually
- View subscription revenue stats

## Premium Features (Frontend)

| Feature | Implementation |
|---------|---------------|
| **UpgradePrompt** | Inline or full-width banner with lock icon and CTA button |
| **PremiumGate** | Wraps components; fetches plan, checks feature access, renders children or UpgradePrompt |
| **Pricing page** | `/pricing` — public plan comparison with Stripe checkout |
| **Subscription management** | `/subscription` — current plan, features, cancel option |
| **Admin subscription dashboard** | `/admin/subscriptions` — stats, table, assign/cancel modals |

## Default Login Accounts

All seeded accounts use the password: `Password123!`

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@learnhub.test | Password123! |
| Teacher | grace.teacher@learnhub.test | Password123! |
| Student | brian.student@learnhub.test | Password123! |
| Parent | parent@learnhub.test | Password123! |
