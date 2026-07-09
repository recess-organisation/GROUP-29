# UG Scholar — Backend

UG Scholar Backend is a REST API for an adaptive Learning Management System (LMS). It is built with Node.js, Express, MariaDB/MySQL, JWT authentication, bcrypt password hashing, Multer file uploads, Zod validation, Stripe payments, and Nodemailer.

## What This Backend Does

- Registers, logs in, and manages users.
- Protects routes with JWT tokens and role-based access.
- Supports four roles: `admin`, `teacher`, `student`, and `parent`.
- Lets teachers create courses, lessons, materials, assignments, quizzes, and announcements.
- Lets students enroll in courses, view lessons, submit assignments, and take quizzes.
- Lets parents link children, set usage rules, and view activity logs.
- Lets admins manage users, courses, categories, and subscription plans.
- Sends email notifications for welcome, password reset, and grading.
- Processes subscription payments via Stripe with a manual admin fallback.
- Gates premium features (course limits, enrollment limits, parental rule limits) behind subscription tiers.

## Tech Stack

- **Node.js** runtime
- **Express.js** web framework
- **MariaDB / MySQL** (`mysql2/promise`)
- **JSON Web Tokens** (`jsonwebtoken`)
- **bcrypt** for password hashing
- **Zod** for request validation
- **Multer** for file uploads
- **Stripe** for payment processing
- **Nodemailer** for email sending
- **Helmet, CORS, express-rate-limit, Morgan** for security and logging

## Requirements

- Node.js 18 or newer
- npm
- MariaDB or MySQL

## Folder Structure

```text
backend/
  config/              Database connection setup
  controllers/         Request logic and SQL queries
  middleware/          Auth, role checks, upload, validation,
  |                    parental control, premium gating
  routes/              API route definitions
  services/            Business logic (quiz grading, parental rules,
  |                    email sending, subscription management)
  uploads/materials/   Lesson materials and assignment attachments
  uploads/submissions/ Student submission files
  database/schema.sql  Creates tables and relationships
  database/seed.sql    Adds sample data
  migrations/          Incremental SQL migrations
  server.js            Express app entry point
```

## First-Time Setup

From inside `backend`:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Then edit `.env` to match your database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=learnhub_db
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Optional Environment Variables

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key for payment processing |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | SMTP settings for email sending (logs to console if omitted) |
| `DB_PORT` | Database port (default `3306`) |

## Create and Seed the Database

Run these commands from inside `backend`:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node migrations/migrate.js
```

`schema.sql` creates the `learnhub_db` database and all tables. `seed.sql` inserts sample users, categories, courses, lessons, assignments, enrollments, and submissions. `migrations/migrate.js` applies incremental migrations for newer features.

## Run the Backend

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API runs at:

```text
http://localhost:5000
```

Quick health check:

```bash
curl http://localhost:5000/
```

Expected response:

```json
{"message":"UG Scholar API is running."}
```

## Default Login Accounts

All seeded users use this password:

```text
Password123!
```

| Role | Email |
| --- | --- |
| Admin | `admin@learnhub.test` |
| Teacher | `grace.teacher@learnhub.test` |
| Student | `brian.student@learnhub.test` |
| Parent | `parent@learnhub.test` |

> **Note:** The parent account (`parent@learnhub.test`) is a sample account created in the seed data. For a full list of all 12 seed accounts, see `database/seed.sql`.

## API Routes

| Prefix | Auth | Purpose |
|--------|------|---------|
| `POST /api/auth/login` | No | Login |
| `POST /api/auth/register` | No | Register |
| `POST /api/auth/forgot-password` | No | Request password reset email |
| `POST /api/auth/reset-password` | No | Reset password with token |
| `GET /api/auth/me` | Yes | Get current user |
| `GET /api/courses` | No | Public course list |
| `GET /api/courses/:id` | No | Course details |
| `POST /api/enrollments` | Student | Enroll in course (gated) |
| `GET /api/enrollments/my` | Student | My enrollments |
| `POST /api/assignments` | Teacher | Create assignment |
| `GET /api/assignments/course/:courseId` | Yes | Course assignments |
| `POST /api/submissions` | Student | Submit work |
| `PUT /api/submissions/:id/grade` | Teacher | Grade + send notification |
| `POST /api/lessons` | Teacher | Create lesson |
| `GET /api/lessons/course/:courseId` | Yes | Course lessons |
| `POST /api/quizzes` | Teacher | Create quiz |
| `POST /api/quizzes/:id/attempt` | Student | Start attempt (timed) |
| `PUT /api/users/profile` | Yes | Update name/phone |
| `PUT /api/users/change-password` | Yes | Change password |
| `GET /api/announcements/course/:courseId` | Yes | Course announcements |
| `POST /api/announcements` | Teacher | Create announcement |
| `DELETE /api/announcements/:id` | Teacher | Delete announcement |
| `GET /api/parent/rules` | Parent | Get parental rules (gated) |
| `POST /api/parent/rules` | Parent | Create rule (gated) |
| `GET /api/subscriptions/plans` | No | Public plan list |
| `GET /api/subscriptions/my` | Yes | Current user subscription |
| `POST /api/subscriptions/create-checkout` | Yes | Stripe checkout session |
| `POST /api/subscriptions/cancel` | Yes | Cancel subscription |
| `GET /api/admin/subscriptions` | Admin | List all subscriptions |
| `GET /api/admin/subscriptions/stats` | Admin | Subscription statistics |
| `POST /api/admin/subscriptions/assign` | Admin | Manually assign plan |

## Premium Subscription Plans

| Plan | Code | Price | Limits |
|------|------|-------|--------|
| Free | `free` | $0 | 3 courses, 3 enrollments, 2 parental rules |
| Starter | `starter` | $1.50/mo | 10 courses, 10 enrollments, 5 parental rules, certificates |
| Plus | `plus` | $5.00/mo | Unlimited enrollments, advanced analytics, data export, priority support |
| Teacher Pro | `teacher_pro` | $9.99/mo | Unlimited courses, API access, bulk enrollment |
| Institution | `institution` | $99.99/mo | Everything unlimited, white-label, custom branding |

## Email Notifications

The `emailService.js` sends emails via Nodemailer. In development (no SMTP configured), all emails are logged to the console instead of being sent.

| Event | Email Type |
|-------|-----------|
| User registration | Welcome email |
| Password reset request | Reset link with token |
| Submission graded | Grade notification to student |

## Database Tables (27)

`users`, `courses`, `course_categories`, `enrollments`, `lessons`, `lesson_materials`, `assignments`, `submissions`, `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `parental_rules`, `daily_usage`, `parent_children`, `announcements`, `audit_logs`, `token_blacklist`, `allow2_activity_log`, `allow2_config`, `password_reset_tokens`, `subscription_plans`, `user_subscriptions`, `payment_history`

## How to See the Data

### Option 1: Use MariaDB/MySQL CLI

Open the database:

```bash
mysql -u root -p learnhub_db
```

Enter password:

```text
root
```

Useful queries:

```sql
SHOW TABLES;

SELECT id, full_name, email, role, status FROM users;

SELECT c.id, c.title, u.full_name AS teacher, cat.name AS category, c.status
FROM courses c
JOIN users u ON u.id = c.teacher_id
LEFT JOIN course_categories cat ON cat.id = c.category_id;

SELECT e.id, s.full_name AS student, c.title AS course, e.progress_percentage
FROM enrollments e
JOIN users s ON s.id = e.student_id
JOIN courses c ON c.id = e.course_id;

SELECT s.id, u.full_name AS student, a.title AS assignment, s.marks_awarded, s.feedback, s.status
FROM submissions s
JOIN users u ON u.id = s.student_id
JOIN assignments a ON a.id = s.assignment_id;
```

Exit MySQL:

```sql
EXIT;
```

### Option 2: Use MySQL Workbench, DBeaver, or phpMyAdmin

Connect with:

```text
Host: localhost
User: root
Password: root
Database: learnhub_db
```

Then open these tables:

- `users`
- `course_categories`
- `courses`
- `lessons`
- `lesson_materials`
- `enrollments`
- `assignments`
- `submissions`

### Option 3: Use API Endpoints

Public course data:

```bash
curl http://localhost:5000/api/courses
```

Login and copy the token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@learnhub.test","password":"Password123!"}'
```

Use the token for protected routes:

```bash
curl http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Authentication Explained

1. A user logs in with email and password.
2. The backend compares the password with the bcrypt hash stored in `users.password`.
3. If the password is correct, the backend creates a JWT.
4. The frontend stores that JWT in `localStorage`.
5. Protected API requests send the token in the `Authorization` header.
6. `authMiddleware.js` verifies the token and adds the decoded user to `req.user`.

Example protected request header:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

## Role-Based Access Explained

`roleMiddleware.js` checks whether the logged-in user has the required role.

Examples:

- Students can enroll in courses and submit assignments.
- Teachers can create courses, lessons, and assignments.
- Teachers can only edit their own course records.
- Admins can view and manage all platform records.

Controller functions also check ownership. This is important because role checks alone are not enough. A teacher role should not allow editing another teacher's course.

## File Uploads Explained

Multer handles uploaded files.

- Lesson materials and assignment attachments are saved to `uploads/materials`.
- Student assignment submissions are saved to `uploads/submissions`.

The backend serves the `uploads` folder publicly:

```text
http://localhost:5000/uploads/materials/example.pdf
http://localhost:5000/uploads/submissions/example.pdf
```

## CORS Setup

CORS is configured in `server.js`. The default allowed origins are:

```text
http://localhost:5173
http://127.0.0.1:5173
```

This avoids common browser errors when Vite opens the frontend with `127.0.0.1` but the backend expects `localhost`.

To add more frontend URLs, update `CORS_ORIGINS` in `.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
```

## Main API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Courses

- `GET /api/courses`
- `GET /api/courses/categories`
- `GET /api/courses/:id`
- `GET /api/courses/teacher/my-courses`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`

### Lessons

- `POST /api/lessons`
- `GET /api/lessons/course/:courseId`
- `GET /api/lessons/:id`
- `PUT /api/lessons/:id`
- `DELETE /api/lessons/:id`

### Enrollments

- `POST /api/enrollments/:courseId`
- `GET /api/enrollments/my-courses`
- `GET /api/enrollments/course/:courseId`
- `PUT /api/enrollments/:id/progress`

### Assignments

- `POST /api/assignments`
- `GET /api/assignments/course/:courseId`
- `GET /api/assignments/:id`
- `PUT /api/assignments/:id`
- `DELETE /api/assignments/:id`

### Submissions

- `POST /api/submissions/:assignmentId`
- `GET /api/submissions/my-submissions`
- `GET /api/submissions/assignment/:assignmentId`
- `PUT /api/submissions/:id/grade`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/courses`
- `PUT /api/admin/users/:id/status`
- `PUT /api/admin/courses/:id/status`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`

## Common Problems

### Access denied for user root

Your MySQL password is not `root`, or root login is disabled. Update `.env` and rerun commands with the correct credentials.

### Database does not exist

Run:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### CORS error in browser

Make sure the backend is running and that `.env` includes the frontend URL in `CORS_ORIGINS`.

### Login fails for seeded users

Make sure `database/seed.sql` was imported after `database/schema.sql`.
