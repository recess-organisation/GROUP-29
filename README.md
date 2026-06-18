# UG Scholar — Adaptive Learning Platform

A full-stack learning management system with built-in parental controls, quiz/testing engine, assignment submission and grading, and role-based access for students, teachers, parents, and administrators.

## Tech Stack

| Layer  | Technology                     |
| ------ | ------------------------------ |
| Frontend | React 18, Vite 8, Bootstrap 5, React Router 6 |
| Backend  | Node.js, Express, JWT authentication |
| Database | MySQL 8.0 (local)             |
| Storage  | Local filesystem via Multer    |

## Features

### Roles

| Role      | Capabilities |
| --------- | ------------ |
| **Admin** | Manage users, courses, categories; platform oversight |
| **Teacher** | Create/edit courses, lessons, assignments, quizzes; upload lesson materials; grade student submissions |
| **Student** | Browse and enroll in courses; view lessons and download materials; submit assignments; take quizzes and view results |
| **Parent** | Link children, set time-based and daily-usage rules, view activity logs and dashboards |

### Core Modules

- **Course Management** — Teachers create courses with categories, levels, durations
- **Lesson System** — Per-course lessons with order, content, and file attachments (PDF, DOC, PPT, images)
- **Assignment Workflow** — Teachers create assignments with due dates and max marks; students upload files; teachers grade with marks and feedback
- **Quiz Engine** — Teachers build quizzes with MCQ and True/False questions; students take timed/multi-attempt quizzes with auto-grading and answer review
- **Parental Controls** — Built-in (replaces Allow2). Parents define rules per child: day-of-week time windows (allow/block), daily minute caps, per-activity filtering (GENERAL, LESSON, QUIZ)
- **Enrollment** — Students enroll in active courses; progress tracking per course
- **Authentication** — JWT-based login with role-based route protection, rate limiting, token blacklisting

## Default Accounts

| Role    | Email                          | Password      |
| ------- | ------------------------------ | ------------- |
| Admin   | admin@learnhub.test            | Password123!  |
| Teacher | grace.teacher@learnhub.test    | Password123!  |
| Student | brian.student@learnhub.test    | Password123!  |
| Parent  | akankwatsakevin0@gmail.com     | Password123!  |

## Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8.0

### Setup

```bash
# 1. Create the database and run migrations
cd backend
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node migrations/migrate.js

# 2. Install backend dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DB credentials (defaults: root/root on localhost:3306)

# 4. Install frontend dependencies
cd ../frontend
npm install
```

### Running

```bash
# Terminal 1 — Backend (port 5000)
cd backend
node server.js

# Terminal 2 — Frontend (port 5173)
cd frontend
npx vite --host
```

Then open `http://localhost:5173` in your browser.

## API Overview

| Prefix              | Auth Required | Purpose            |
| ------------------- | ------------- | ------------------ |
| `POST /api/auth`    | No            | Login/register     |
| `GET /api/courses`  | No            | Public course list |
| `/api/enrollments`  | Yes           | Student enrollment |
| `/api/assignments`  | Yes           | Assignment CRUD    |
| `/api/submissions`  | Yes           | Submit and grade   |
| `/api/lessons`      | Yes           | Lesson CRUD + materials |
| `/api/quizzes`      | Yes           | Quiz engine        |
| `/api/parent`       | Parent        | Rules and usage    |
| `/api/admin`        | Admin         | User/course mgmt   |

## Project Structure

```
UG_Scholar/
├── backend/
│   ├── config/        — Database connection
│   ├── controllers/   — Route handlers
│   ├── database/      — Schema + seed SQL files
│   ├── middleware/     — Auth, roles, upload, validation, parental control
│   ├── migrations/    — Incremental SQL migrations
│   ├── routes/        — Express routers
│   ├── services/      — Business logic (quiz grading, parental rules)
│   └── uploads/       — Uploaded files (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/  — Shared UI (Navbar, Modal, CourseCard, etc.)
│   │   ├── context/     — AuthContext (JWT state)
│   │   ├── layouts/     — Dashboard and public layouts
│   │   ├── pages/       — Route-level page components
│   │   │   ├── admin/
│   │   │   ├── parent/
│   │   │   ├── public/
│   │   │   ├── student/
│   │   │   └── teacher/
│   │   └── services/    — Axios API wrappers
│   └── index.html
├── .gitignore
└── README.md
```

## Database Tables (22)

`users`, `courses`, `course_categories`, `enrollments`, `lessons`, `lesson_materials`, `assignments`, `submissions`, `quizzes`, `quiz_questions`, `quiz_options`, `quiz_attempts`, `quiz_answers`, `parental_rules`, `daily_usage`, `parent_children`, `announcements`, `audit_logs`, `token_blacklist`, `allow2_activity_log`, `allow2_config`

## Color Palette

| Usage          | Color  |
| -------------- | ------ |
| Backgrounds    | #FFFFFF, #F8F9FA |
| Text & Sidebar | #1E293B, #0F172A |
| Accent (coral) | #FF6B6B |
| Accent (teal)  | #0D9488 |
