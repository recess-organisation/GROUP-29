<div align="center">

# UG Scholar — Adaptive Learning Platform

[![React](https://img.shields.io/badge/React%2018-61DAFB?logo=react&logoColor=000)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=fff)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL%208.0-4479A1?logo=mysql&logoColor=fff)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap%205-7952B3?logo=bootstrap&logoColor=fff)](https://getbootstrap.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A full-stack **Learning Management System** with built-in parental controls, quiz/testing engine, assignment submission and grading, and role-based access for students, teachers, parents, and administrators.

</div>

---

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Manage users, courses, categories; platform oversight |
| **Teacher** | Create/edit courses, lessons, assignments, quizzes; upload materials; grade submissions |
| **Student** | Browse/enroll in courses; view lessons; submit assignments; take quizzes |
| **Parent** | Link children, set time-based & daily-usage rules, view activity logs |

## Features

### Core Modules

- **Course Management** — Courses with categories, levels, and durations
- **Lesson System** — Per-course lessons with ordering, content, and file attachments (PDF, DOC, PPT, images)
- **Assignment Workflow** — Teachers create assignments with due dates and max marks; students upload files; teachers grade with marks and feedback
- **Quiz Engine** — MCQ and True/False questions; timed/multi-attempt quizzes with auto-grading and answer review
- **Parental Controls** — Day-of-week time windows (allow/block), daily minute caps, per-activity filtering (GENERAL, LESSON, QUIZ)
- **Enrollment** — Students enroll in active courses with progress tracking
- **Authentication** — JWT-based login with role-based route protection, rate limiting, and token blacklisting

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 8, Bootstrap 5, React Router 6 |
| Backend | Node.js, Express, JWT authentication |
| Database | MySQL 8.0 |
| Storage | Local filesystem via Multer |

## Prerequisites

- Node.js 20+
- MySQL 8.0

## Getting Started

```bash
# 1. Clone
git clone https://github.com/akankwatsakevin0-ctrl/UG_Scholar_AdaptiveLearning_platform.git
cd UG_Scholar_AdaptiveLearning_platform

# 2. Set up database
cd backend
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node migrations/migrate.js

# 3. Install backend dependencies
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# 5. Install frontend dependencies
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

Open **http://localhost:5173** in your browser.

## Default Accounts (Development Only)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@learnhub.test | Password123! |
| Teacher | grace.teacher@learnhub.test | Password123! |
| Student | brian.student@learnhub.test | Password123! |
| Parent | akankwatsakevin0@gmail.com | Password123! |

> **Warning:** Default credentials are for development only. Change all passwords and never commit real credentials to version control for production use.

## API Overview

| Prefix | Auth | Purpose |
|--------|------|---------|
| `POST /api/auth` | No | Login/register |
| `GET /api/courses` | No | Public course list |
| `/api/enrollments` | Yes | Student enrollment |
| `/api/assignments` | Yes | Assignment CRUD |
| `/api/submissions` | Yes | Submit and grade |
| `/api/lessons` | Yes | Lesson CRUD + materials |
| `/api/quizzes` | Yes | Quiz engine |
| `/api/parent` | Parent | Rules and usage |
| `/api/admin` | Admin | User/course management |

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

| Usage | Color |
|-------|-------|
| Backgrounds | `#FFFFFF`, `#F8F9FA` |
| Text & Sidebar | `#1E293B`, `#0F172A` |
| Accent (coral) | `#FF6B6B` |
| Accent (teal) | `#0D9488` |

---

<div align="center">Built with React, Express, and MySQL</div>
