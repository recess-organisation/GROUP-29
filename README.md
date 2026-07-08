# UG Scholar — Build Guide

A step-by-step guide to building a full-stack Learning Management System (LMS) from scratch using **React**, **Express**, **MySQL**, and **Node.js**.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Database Schema](#2-database-schema)
3. [Backend Foundation](#3-backend-foundation)
4. [Authentication System](#4-authentication-system)
5. [Course & Lesson Management](#5-course--lesson-management)
6. [Assignment & Submission Workflow](#6-assignment--submission-workflow)
7. [Quiz Engine with Timer](#7-quiz-engine-with-timer)
8. [Parental Controls](#8-parental-controls)
9. [Announcements Feature](#9-announcements-feature)
10. [Password Reset & Email Notifications](#10-password-reset--email-notifications)
11. [User Profile Management](#11-user-profile-management)
12. [Premium Subscription System](#12-premium-subscription-system)
13. [Frontend Setup & Routing](#13-frontend-setup--routing)
14. [Frontend Components & Pages](#14-frontend-components--pages)
15. [Running the Application](#15-running-the-application)
16. [Optional: Remove Premium Features](#16-optional-remove-premium-features)

---

## 1. Project Setup

### 1.1 Initialize the project structure

```bash
mkdir UG_Scholar
cd UG_Scholar
mkdir -p backend frontend
```

### 1.2 Initialize the backend

```bash
cd backend
npm init -y
npm install express mysql2 jsonwebtoken bcrypt multer cors dotenv helmet morgan express-rate-limit zod stripe nodemailer
npm install --save-dev nodemon
```

Add to `backend/package.json`:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "migrate": "node migrations/migrate.js"
}
```

### 1.3 Initialize the frontend

```bash
cd ../frontend
npm create vite@latest . -- --template react
npm install
npm install axios react-router-dom bootstrap
```

### 1.4 Create the folder structure

```bash
# Backend folders
cd ../backend
mkdir -p config controllers middleware routes services migrations database uploads/materials uploads/submissions __tests__

# Frontend folders
cd ../frontend/src
mkdir -p components context layouts pages/public pages/student pages/teacher pages/admin pages/parent services utils
```

---

## 2. Database Schema

Create `backend/database/schema.sql` with the following tables. Each group builds on the previous ones. Run it with:

```bash
mysql -u root -p < database/schema.sql
```

### 2.1 Users & Authentication

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','teacher','student','parent') DEFAULT 'student',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE token_blacklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2.2 Courses & Lessons

```sql
CREATE TABLE course_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT,
  level ENUM('beginner','intermediate','advanced','all') DEFAULT 'all',
  duration VARCHAR(100),
  image_url VARCHAR(500),
  status ENUM('active','inactive','archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES course_categories(id)
);

CREATE TABLE lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE lesson_materials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  status ENUM('active','completed','dropped') DEFAULT 'active',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE KEY unique_enrollment (student_id, course_id)
);
```

### 2.3 Assignments & Submissions

```sql
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  max_marks DECIMAL(5,2),
  file_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_url VARCHAR(500),
  marks_awarded DECIMAL(5,2),
  feedback TEXT,
  status ENUM('submitted','graded','late') DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)
);
```

### 2.4 Quizzes

```sql
CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit_minutes INT DEFAULT 10,
  max_attempts INT DEFAULT 1,
  pass_percentage DECIMAL(5,2) DEFAULT 50.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type ENUM('multiple_choice','true_false') DEFAULT 'multiple_choice',
  points INT DEFAULT 1,
  order_index INT DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  option_text TEXT NOT NULL,
  is_correct TINYINT(1) DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  student_id INT NOT NULL,
  score DECIMAL(5,2),
  total_marks DECIMAL(5,2),
  percentage DECIMAL(5,2),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  status ENUM('in_progress','completed') DEFAULT 'in_progress',
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE quiz_answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id INT NOT NULL,
  question_id INT NOT NULL,
  selected_option_id INT,
  is_correct TINYINT(1) DEFAULT 0,
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
);
```

### 2.5 Parental Controls

```sql
CREATE TABLE parent_children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  child_id INT NOT NULL,
  relationship VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES users(id),
  UNIQUE KEY unique_parent_child (parent_id, child_id)
);

CREATE TABLE parental_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parent_id INT NOT NULL,
  child_id INT NOT NULL,
  day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday','all') DEFAULT 'all',
  start_time TIME,
  end_time TIME,
  action ENUM('allow','block') DEFAULT 'block',
  daily_minutes INT DEFAULT 0,
  activity_type ENUM('all','general','lesson','quiz') DEFAULT 'all',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES users(id),
  FOREIGN KEY (child_id) REFERENCES users(id)
);

CREATE TABLE daily_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  activity_type ENUM('general','lesson','quiz') DEFAULT 'general',
  minutes_used INT DEFAULT 0,
  usage_date DATE NOT NULL,
  FOREIGN KEY (child_id) REFERENCES users(id)
);
```

### 2.6 Announcements

```sql
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  teacher_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
);
```

### 2.7 Subscriptions (optional — see Step 12)

```sql
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'usd',
  interval ENUM('month','year') DEFAULT 'month',
  stripe_price_id VARCHAR(100),
  features JSON,
  max_courses INT DEFAULT -1,
  max_enrollments INT DEFAULT -1,
  max_parental_rules INT DEFAULT -1,
  tier_level INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO subscription_plans (name, code, price, features, max_courses, max_enrollments, max_parental_rules, tier_level) VALUES
('Free', 'free', 0.00, '{"analytics":false,"certificates":false,"data_export":false,"course_reviews":false,"bulk_enrollment":false,"api_access":false,"priority_support":false,"white_label":false,"custom_branding":false,"unlimited_enrollments":false,"unlimited_courses":false,"email_reports":false}', 3, 3, 2, 0),
('Starter', 'starter', 1.50, '{"analytics":false,"certificates":true,"data_export":false,"course_reviews":true,"bulk_enrollment":false,"api_access":false,"priority_support":false,"white_label":false,"custom_branding":false,"unlimited_enrollments":false,"unlimited_courses":false,"email_reports":false}', 10, 10, 5, 1),
('Plus', 'plus', 5.00, '{"analytics":true,"certificates":true,"data_export":true,"course_reviews":true,"bulk_enrollment":false,"api_access":false,"priority_support":true,"white_label":false,"custom_branding":false,"unlimited_enrollments":true,"unlimited_courses":false,"email_reports":true}', 20, -1, -1, 2),
('Teacher Pro', 'teacher_pro', 9.99, '{"analytics":true,"certificates":true,"data_export":true,"course_reviews":true,"bulk_enrollment":true,"api_access":true,"priority_support":true,"white_label":false,"custom_branding":false,"unlimited_enrollments":true,"unlimited_courses":true,"email_reports":true}', -1, -1, -1, 3),
('Institution', 'institution', 99.99, '{"analytics":true,"certificates":true,"data_export":true,"course_reviews":true,"bulk_enrollment":true,"api_access":true,"priority_support":true,"white_label":true,"custom_branding":true,"unlimited_enrollments":true,"unlimited_courses":true,"email_reports":true}', -1, -1, -1, 4);

CREATE TABLE user_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  status ENUM('active','canceled','expired','past_due','trialing') DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  payment_provider ENUM('stripe','manual') DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE payment_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_id INT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status ENUM('pending','completed','failed','refunded') DEFAULT 'completed',
  stripe_payment_intent_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);
```

### 2.8 Seed Data

Create `backend/database/seed.sql` with sample users:

```sql
-- Password for all: Password123!
INSERT INTO users (full_name, email, password, role, status) VALUES
('Admin User', 'admin@learnhub.test', '$2b$12$...hashed...', 'admin', 'active'),
('Grace Teacher', 'grace.teacher@learnhub.test', '$2b$12$...hashed...', 'teacher', 'active'),
('Brian Student', 'brian.student@learnhub.test', '$2b$12$...hashed...', 'student', 'active'),
('Parent User', 'akankwatsakevin0@gmail.com', '$2b$12$...hashed...', 'parent', 'active');
```

Generate the bcrypt hash using Node.js:

```js
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('Password123!', 12);
console.log(hash);
```

---

## 3. Backend Foundation

### 3.1 Database Connection

Create `backend/config/db.js`:

```js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'learnhub_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

module.exports = pool;
```

### 3.2 Environment File

Create `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=learnhub_db
JWT_SECRET=generate_a_random_secret_here
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Optional: Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional: Email (logs to console if omitted)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=noreply@learnhub.test
```

### 3.3 Express Server

Create `backend/server.js`:

```js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Stripe webhook must use raw body — register before express.json()
if (process.env.STRIPE_WEBHOOK_SECRET) {
  app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    require('./controllers/subscriptionController').handleStripeWebhook(req, res);
  });
}

// Standard middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Health check
app.get('/', (req, res) => res.json({ message: 'API is running.' }));

// Mount routes (add as you build each feature)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/lessons', require('./routes/lessonRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 3.4 Migration Runner

Create `backend/migrations/migrate.js`:

```js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'learnhub_db'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${process.env.DB_NAME || 'learnhub_db'}\``);

  const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
    await connection.query(sql);
  }

  await connection.end();
  console.log('All migrations complete.');
}

migrate().catch(err => { console.error(err); process.exit(1); });
```

---

## 4. Authentication System

### 4.1 Auth Middleware

Create `backend/middleware/authMiddleware.js`:

```js
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = header.split(' ')[1];
  try {
    const [blacklisted] = await pool.query('SELECT id FROM token_blacklist WHERE token = ? AND expires_at > NOW()', [token]);
    if (blacklisted.length > 0) return res.status(401).json({ message: 'Token has been revoked.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = { authenticate };
```

### 4.2 Role Middleware

Create `backend/middleware/roleMiddleware.js`:

```js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { authorize };
```

### 4.3 Auth Controller

Create `backend/controllers/authController.js`:

```js
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

async function register(req, res) {
  const { full_name, email, password, role } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, hashedPassword, role || 'student']
    );

    // Fire-and-forget welcome email
    emailService.sendWelcomeEmail(email, full_name).catch(() => {});

    res.status(201).json({ message: 'Registration successful.', userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed.' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (users[0].status !== 'active') return res.status(403).json({ message: 'Account is inactive or suspended.' });

    const token = jwt.sign(
      { id: users[0].id, role: users[0].role, email: users[0].email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({
      token,
      user: { id: users[0].id, full_name: users[0].full_name, email: users[0].email, role: users[0].role, phone: users[0].phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed.' });
  }
}

async function getMe(req, res) {
  try {
    const [users] = await pool.query(
      'SELECT id, full_name, email, role, phone, avatar_url, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user.' });
  }
}

async function logout(req, res) {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token);
    await pool.query('INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)', [token, new Date(decoded.exp * 1000)]);
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed.' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  try {
    const [users] = await pool.query('SELECT id, full_name FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      await pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [
        users[0].id, hashedToken, new Date(Date.now() + 3600000)
      ]);
      await emailService.sendPasswordResetEmail(email, users[0].full_name, resetToken).catch(() => {});
    }
    // Always return same message to prevent email enumeration
    res.json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process password reset.' });
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;
  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const [tokens] = await pool.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()', [hashedToken]
    );
    if (tokens.length === 0) return res.status(400).json({ message: 'Invalid or expired reset token.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, tokens[0].user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokens[0].id]);

    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password.' });
  }
}

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };
```

### 4.4 Auth Routes

Create `backend/routes/authRoutes.js`:

```js
const router = require('express').Router();
const { register, login, getMe, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', validate('forgotPassword'), forgotPassword);
router.post('/reset-password', validate('resetPassword'), resetPassword);

module.exports = router;
```

### 4.5 Validation Middleware

Create `backend/middleware/validateMiddleware.js`:

```js
const { z } = require('zod');

const schemas = {
  register: z.object({
    full_name: z.string().min(2).max(255),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'Must include uppercase, lowercase, number, and special character'),
    role: z.enum(['student', 'teacher', 'parent']).optional()
  }),
  login: z.object({ email: z.string().email(), password: z.string().min(1) }),
  forgotPassword: z.object({ email: z.string().email() }),
  resetPassword: z.object({ token: z.string().min(1), password: z.string().min(8) }),
  profile: z.object({ full_name: z.string().min(2).max(255).optional(), phone: z.string().max(20).optional() }),
  changePassword: z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8) }),
  course: z.object({ title: z.string().min(2).max(255), description: z.string().optional(), category_id: z.number().optional(), level: z.string().optional(), duration: z.string().optional() }),
  assignment: z.object({ course_id: z.number(), title: z.string().min(2).max(255), description: z.string().optional(), due_date: z.string().optional(), max_marks: z.number().positive().optional() }),
  parentalRule: z.object({ child_id: z.number(), day_of_week: z.string().optional(), start_time: z.string().optional(), end_time: z.string().optional(), action: z.enum(['allow', 'block']), daily_minutes: z.number().optional(), activity_type: z.string().optional() }),
  linkChild: z.object({ child_email: z.string().email() })
};

const validate = (schemaName) => (req, res, next) => {
  const result = schemas[schemaName]?.safeParse(req.body);
  if (!result || !result.success) {
    return res.status(400).json({ message: 'Validation failed.', errors: result.error?.errors || [] });
  }
  req.body = result.data;
  next();
};

module.exports = { validate, schemas };
```

---

## 5. Course & Lesson Management

### 5.1 Course Controller

Create `backend/controllers/courseController.js`:

```js
const pool = require('../config/db');
const subscriptionService = require('../services/subscriptionService');

async function getCourses(req, res) {
  try {
    let query = `SELECT c.*, cat.name as category_name, u.full_name as teacher_name
                 FROM courses c
                 LEFT JOIN course_categories cat ON c.category_id = cat.id
                 JOIN users u ON c.teacher_id = u.id`;
    const params = [];

    if (req.query.category) { query += ' WHERE c.category_id = ?'; params.push(req.query.category); }
    if (req.query.level) { query += (params.length ? ' AND' : ' WHERE') + ' c.level = ?'; params.push(req.query.level); }
    if (req.query.search) { query += (params.length ? ' AND' : ' WHERE') + ' c.title LIKE ?'; params.push(`%${req.query.search}%`); }
    if (req.query.teacher_id) { query += (params.length ? ' AND' : ' WHERE') + ' c.teacher_id = ?'; params.push(req.query.teacher_id); }

    if (!req.user || req.user.role !== 'admin') {
      query += (params.length ? ' AND' : ' WHERE') + ' c.status = ?';
      params.push('active');
    }

    query += ' ORDER BY c.created_at DESC';
    const [courses] = await pool.query(query, params);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses.' });
  }
}

async function getCourseById(req, res) {
  try {
    const [courses] = await pool.query(
      `SELECT c.*, cat.name as category_name, u.full_name as teacher_name
       FROM courses c
       LEFT JOIN course_categories cat ON c.category_id = cat.id
       JOIN users u ON c.teacher_id = u.id
       WHERE c.id = ?`, [req.params.id]
    );
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found.' });
    res.json(courses[0]);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course.' });
  }
}

async function createCourse(req, res) {
  // Check subscription limit
  const allowed = await subscriptionService.canCreateMoreCourses(req.user.id);
  if (!allowed) {
    return res.status(403).json({ message: 'Course creation limit reached. Upgrade to Teacher Pro.', upgradePlan: 'teacher_pro' });
  }

  const { title, description, category_id, level, duration } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (teacher_id, title, description, category_id, level, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, category_id || null, level || 'all', duration || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Course created.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create course.' });
  }
}

async function updateCourse(req, res) {
  const { title, description, category_id, level, duration, status } = req.body;
  try {
    await pool.query(
      'UPDATE courses SET title=COALESCE(?,title), description=COALESCE(?,description), category_id=COALESCE(?,category_id), level=COALESCE(?,level), duration=COALESCE(?,duration), status=COALESCE(?,status) WHERE id=? AND teacher_id=?',
      [title, description, category_id, level, duration, status, req.params.id, req.user.id]
    );
    res.json({ message: 'Course updated.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update course.' });
  }
}

async function deleteCourse(req, res) {
  try {
    await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ message: 'Course deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course.' });
  }
}

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse };
```

### 5.2 Course Routes

Create `backend/routes/courseRoutes.js`:

```js
const router = require('express').Router();
const ctrl = require('../controllers/courseController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', ctrl.getCourses);
router.get('/:id', ctrl.getCourseById);
router.post('/', authenticate, authorize('teacher', 'admin'), ctrl.createCourse);
router.put('/:id', authenticate, authorize('teacher', 'admin'), ctrl.updateCourse);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteCourse);

module.exports = router;
```

### 5.3 Lesson Controller

Create `backend/controllers/lessonController.js`:

```js
const pool = require('../config/db');

async function getLessonsByCourse(req, res) {
  const [lessons] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index', [req.params.courseId]);
  res.json(lessons);
}

async function createLesson(req, res) {
  const { course_id, title, content, order_index } = req.body;
  const [result] = await pool.query(
    'INSERT INTO lessons (course_id, title, content, order_index) VALUES (?, ?, ?, ?)',
    [course_id, title, content, order_index || 0]
  );
  res.status(201).json({ id: result.insertId, message: 'Lesson created.' });
}

async function updateLesson(req, res) {
  const { title, content, order_index } = req.body;
  await pool.query(
    'UPDATE lessons SET title=COALESCE(?,title), content=COALESCE(?,content), order_index=COALESCE(?,order_index) WHERE id=?',
    [title, content, order_index, req.params.id]
  );
  res.json({ message: 'Lesson updated.' });
}

async function deleteLesson(req, res) {
  await pool.query('DELETE FROM lessons WHERE id = ?', [req.params.id]);
  res.json({ message: 'Lesson deleted.' });
}

// Material upload — use multer middleware
async function uploadMaterial(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const { lesson_id } = req.body;
  await pool.query(
    'INSERT INTO lesson_materials (lesson_id, file_name, file_path, file_type, file_size) VALUES (?, ?, ?, ?, ?)',
    [lesson_id, req.file.originalname, req.file.path, req.file.mimetype, req.file.size]
  );
  res.status(201).json({ message: 'Material uploaded.' });
}

async function getMaterials(req, res) {
  const [materials] = await pool.query('SELECT * FROM lesson_materials WHERE lesson_id = ?', [req.params.lessonId]);
  res.json(materials);
}

module.exports = { getLessonsByCourse, createLesson, updateLesson, deleteLesson, uploadMaterial, getMaterials };
```

### 5.4 Lesson Routes

```js
const router = require('express').Router();
const ctrl = require('../controllers/lessonController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/course/:courseId', ctrl.getLessonsByCourse);
router.post('/', authenticate, authorize('teacher', 'admin'), ctrl.createLesson);
router.put('/:id', authenticate, authorize('teacher', 'admin'), ctrl.updateLesson);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), ctrl.deleteLesson);
router.get('/:lessonId/materials', ctrl.getMaterials);
router.post('/upload', authenticate, authorize('teacher', 'admin'), upload.single('material'), ctrl.uploadMaterial);

module.exports = router;
```

### 5.5 File Upload Middleware

Create `backend/middleware/uploadMiddleware.js`:

```js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.fieldname === 'submission' ? 'uploads/submissions' : 'uploads/materials';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|ppt|pptx|jpg|jpeg|png|gif|zip|txt/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });
```

---

## 6. Assignment & Submission Workflow

### 6.1 Assignment Controller

Create `backend/controllers/assignmentController.js`:

```js
const pool = require('../config/db');

async function getAssignmentsByCourse(req, res) {
  const [assignments] = await pool.query('SELECT * FROM assignments WHERE course_id = ? ORDER BY created_at DESC', [req.params.courseId]);
  res.json(assignments);
}

async function createAssignment(req, res) {
  const { course_id, title, description, due_date, max_marks } = req.body;
  const [result] = await pool.query(
    'INSERT INTO assignments (course_id, teacher_id, title, description, due_date, max_marks) VALUES (?, ?, ?, ?, ?, ?)',
    [course_id, req.user.id, title, description, due_date, max_marks]
  );
  res.status(201).json({ id: result.insertId, message: 'Assignment created.' });
}

module.exports = { getAssignmentsByCourse, createAssignment };
```

### 6.2 Submission Controller

Create `backend/controllers/submissionController.js`:

```js
const pool = require('../config/db');
const emailService = require('../services/emailService');

async function submitAssignment(req, res) {
  if (!req.file) return res.status(400).json({ message: 'No file submitted.' });
  const { assignment_id } = req.body;
  const [result] = await pool.query(
    'INSERT INTO submissions (assignment_id, student_id, file_url) VALUES (?, ?, ?)',
    [assignment_id, req.user.id, req.file.path]
  );
  res.status(201).json({ id: result.insertId, message: 'Assignment submitted.' });
}

async function getSubmissionsByAssignment(req, res) {
  const [submissions] = await pool.query(
    `SELECT s.*, u.full_name as student_name, u.email as student_email
     FROM submissions s JOIN users u ON s.student_id = u.id
     WHERE s.assignment_id = ? ORDER BY s.submitted_at DESC`,
    [req.params.assignmentId]
  );
  res.json(submissions);
}

async function gradeSubmission(req, res) {
  const { marks_awarded, feedback } = req.body;
  try {
    await pool.query(
      'UPDATE submissions SET marks_awarded=?, feedback=?, status="graded" WHERE id=?',
      [marks_awarded, feedback, req.params.id]
    );

    // Send grade notification
    const [submissions] = await pool.query(
      `SELECT s.*, u.email, u.full_name as student_name, a.title as assignment_title
       FROM submissions s JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = ?`, [req.params.id]
    );
    if (submissions.length > 0) {
      const sub = submissions[0];
      emailService.sendGradedNotification(sub.email, sub.student_name, sub.assignment_title, marks_awarded, '?').catch(() => {});
    }

    res.json({ message: 'Submission graded.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to grade submission.' });
  }
}

module.exports = { submitAssignment, getSubmissionsByAssignment, gradeSubmission };
```

---

## 7. Quiz Engine with Timer

### 7.1 Quiz Controller

Create `backend/controllers/quizController.js`:

```js
const pool = require('../config/db');

async function getQuizzesByCourse(req, res) {
  const [quizzes] = await pool.query('SELECT id, course_id, title, description, time_limit_minutes, max_attempts, pass_percentage, created_at FROM quizzes WHERE course_id = ?', [req.params.courseId]);
  res.json(quizzes);
}

async function getQuizById(req, res) {
  const [quizzes] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
  if (quizzes.length === 0) return res.status(404).json({ message: 'Quiz not found.' });

  const [questions] = await pool.query('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index', [req.params.id]);

  // Get options for each question (hide correct answer for students)
  for (let q of questions) {
    const [options] = await pool.query(
      req.user?.role === 'teacher' || req.user?.role === 'admin'
        ? 'SELECT * FROM quiz_options WHERE question_id = ?'
        : 'SELECT id, question_id, option_text FROM quiz_options WHERE question_id = ?',
      [q.id]
    );
    q.options = options;
  }

  res.json({ ...quizzes[0], questions });
}

async function startAttempt(req, res) {
  const { id } = req.params;
  // Check max attempts
  const [attempts] = await pool.query('SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ? AND student_id = ?', [id, req.user.id]);
  const [quiz] = await pool.query('SELECT max_attempts FROM quizzes WHERE id = ?', [id]);
  if (quiz.length > 0 && attempts[0].count >= quiz[0].max_attempts) {
    return res.status(400).json({ message: 'Maximum attempts reached.' });
  }

  const [result] = await pool.query(
    'INSERT INTO quiz_attempts (quiz_id, student_id, status) VALUES (?, ?, "in_progress")',
    [id, req.user.id]
  );
  res.status(201).json({ attemptId: result.insertId });
}

async function submitAttempt(req, res) {
  const { attemptId } = req.params;
  const { answers } = req.body; // [{questionId, selectedOptionId}, ...]

  const [attempt] = await pool.query('SELECT * FROM quiz_attempts WHERE id = ? AND student_id = ?', [attemptId, req.user.id]);
  if (attempt.length === 0) return res.status(404).json({ message: 'Attempt not found.' });
  if (attempt[0].status === 'completed') return res.status(400).json({ message: 'Already submitted.' });

  let score = 0;
  let totalMarks = 0;

  for (const answer of answers) {
    const [questions] = await pool.query('SELECT points FROM quiz_questions WHERE id = ?', [answer.questionId]);
    const points = questions[0]?.points || 1;
    totalMarks += points;

    const [options] = await pool.query('SELECT id, is_correct FROM quiz_options WHERE id = ? AND question_id = ?', [answer.selectedOptionId, answer.questionId]);
    const isCorrect = options.length > 0 && options[0].is_correct === 1;
    if (isCorrect) score += points;

    await pool.query(
      'INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES (?, ?, ?, ?)',
      [attemptId, answer.questionId, answer.selectedOptionId, isCorrect ? 1 : 0]
    );
  }

  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  await pool.query(
    'UPDATE quiz_attempts SET score=?, total_marks=?, percentage=?, completed_at=NOW(), status="completed" WHERE id=?',
    [score, totalMarks, percentage, attemptId]
  );

  res.json({ score, totalMarks, percentage, passed: percentage >= attempt[0].pass_percentage });
}

module.exports = { getQuizzesByCourse, getQuizById, startAttempt, submitAttempt };
```

### 7.2 Quiz Timer (Frontend)

In `frontend/src/pages/student/TakeQuiz.jsx`, implement a countdown hook:

```jsx
import { useState, useEffect, useRef } from 'react';

function useCountdown(minutes, onExpire) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (timeLeft <= 0) { onExpireRef.current?.(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return timeLeft;
}

// In the quiz-taking component:
const timeLeft = useCountdown(quiz.time_limit_minutes, handleAutoSubmit);
const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;
// Show red badge when <= 60s, auto-submit on expiry
```

---

## 8. Parental Controls

### 8.1 Parent Controller

Create `backend/controllers/parentController.js`:

```js
const pool = require('../config/db');
const subscriptionService = require('../services/subscriptionService');

async function linkChild(req, res) {
  const { child_email } = req.body;
  const [children] = await pool.query('SELECT id FROM users WHERE email = ? AND role = "student"', [child_email]);
  if (children.length === 0) return res.status(404).json({ message: 'Student not found.' });

  await pool.query('INSERT IGNORE INTO parent_children (parent_id, child_id) VALUES (?, ?)', [req.user.id, children[0].id]);
  res.json({ message: 'Child linked.' });
}

async function getChildren(req, res) {
  const [children] = await pool.query(
    `SELECT u.id, u.full_name, u.email FROM parent_children pc JOIN users u ON pc.child_id = u.id WHERE pc.parent_id = ?`,
    [req.user.id]
  );
  res.json(children);
}

async function createRule(req, res) {
  // Check subscription limit
  const allowed = await subscriptionService.canCreateMoreParentalRules(req.user.id);
  if (!allowed) {
    return res.status(403).json({ message: 'Parental rule limit reached. Upgrade to Plus.', upgradePlan: 'plus' });
  }

  const { child_id, day_of_week, start_time, end_time, action, daily_minutes, activity_type } = req.body;
  const [result] = await pool.query(
    'INSERT INTO parental_rules (parent_id, child_id, day_of_week, start_time, end_time, action, daily_minutes, activity_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, child_id, day_of_week || 'all', start_time, end_time, action, daily_minutes || 0, activity_type || 'all']
  );
  res.status(201).json({ id: result.insertId, message: 'Rule created.' });
}

async function getRules(req, res) {
  const [rules] = await pool.query('SELECT * FROM parental_rules WHERE parent_id = ?', [req.user.id]);
  res.json(rules);
}

async function deleteRule(req, res) {
  await pool.query('DELETE FROM parental_rules WHERE id = ? AND parent_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Rule deleted.' });
}

module.exports = { linkChild, getChildren, createRule, getRules, deleteRule };
```

### 8.2 Parental Control Middleware

Create `backend/middleware/parentalControlMiddleware.js`:

```js
const pool = require('../config/db');

async function checkParentalAccess(req, res, next) {
  // This middleware checks if a student is allowed to access a lesson/quiz
  // based on their parent's rules. Called before serving learning content.
  // Implementation: check day_of_week, time windows, daily usage caps.
  next(); // Simplified — expand based on your rule structure
}

module.exports = { checkParentalAccess };
```

---

## 9. Announcements Feature

### 9.1 Announcement Controller

Create `backend/controllers/announcementController.js`:

```js
const pool = require('../config/db');

async function getAnnouncementsByCourse(req, res) {
  const [announcements] = await pool.query(
    `SELECT a.*, u.full_name as teacher_name
     FROM announcements a JOIN users u ON a.teacher_id = u.id
     WHERE a.course_id = ? ORDER BY a.created_at DESC`,
    [req.params.courseId]
  );
  res.json(announcements);
}

async function createAnnouncement(req, res) {
  const { course_id, title, content } = req.body;
  const [result] = await pool.query(
    'INSERT INTO announcements (course_id, teacher_id, title, content) VALUES (?, ?, ?, ?)',
    [course_id, req.user.id, title, content]
  );
  res.status(201).json({ id: result.insertId, message: 'Announcement created.' });
}

async function deleteAnnouncement(req, res) {
  await pool.query('DELETE FROM announcements WHERE id = ? AND teacher_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Announcement deleted.' });
}

module.exports = { getAnnouncementsByCourse, createAnnouncement, deleteAnnouncement };
```

### 9.2 Announcement Routes

Create `backend/routes/announcementRoutes.js`:

```js
const router = require('express').Router();
const ctrl = require('../controllers/announcementController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/course/:courseId', authenticate, ctrl.getAnnouncementsByCourse);
router.post('/', authenticate, authorize('teacher', 'admin'), ctrl.createAnnouncement);
router.delete('/:id', authenticate, authorize('teacher', 'admin'), ctrl.deleteAnnouncement);

module.exports = router;
```

---

## 10. Password Reset & Email Notifications

### 10.1 Email Service

Create `backend/services/emailService.js`:

```js
const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (process.env.EMAIL_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
  } else {
    // Console fallback for development
    transporter = {
      sendMail: (opts) => {
        console.log('--- EMAIL (dev fallback) ---');
        console.log('To:', opts.to);
        console.log('Subject:', opts.subject);
        console.log('---');
        return Promise.resolve();
      }
    };
  }
  return transporter;
}

async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'noreply@learnhub.test',
    to: email,
    subject: 'Password Reset - UG Scholar',
    html: `<p>Hi ${name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
  });
}

async function sendWelcomeEmail(email, name) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'noreply@learnhub.test',
    to: email,
    subject: 'Welcome to UG Scholar!',
    html: `<p>Hi ${name},</p><p>Welcome to UG Scholar! Start exploring courses and learning today.</p>`
  });
}

async function sendGradedNotification(email, name, assignmentTitle, marks, maxMarks) {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'noreply@learnhub.test',
    to: email,
    subject: `Assignment Graded: ${assignmentTitle}`,
    html: `<p>Hi ${name},</p><p>Your assignment "${assignmentTitle}" has been graded. You scored ${marks}/${maxMarks}.</p>`
  });
}

module.exports = { sendPasswordResetEmail, sendWelcomeEmail, sendGradedNotification };
```

---

## 11. User Profile Management

Create `backend/controllers/userController.js`:

```js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

async function getProfile(req, res) {
  const [users] = await pool.query(
    'SELECT id, full_name, email, role, phone, avatar_url, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
  res.json(users[0]);
}

async function updateProfile(req, res) {
  const { full_name, phone } = req.body;
  await pool.query('UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone) WHERE id = ?',
    [full_name, phone, req.user.id]);
  res.json({ message: 'Profile updated.' });
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(currentPassword, users[0].password))) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }
  const hashed = await bcrypt.hash(newPassword, 12);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
  res.json({ message: 'Password changed.' });
}

module.exports = { getProfile, updateProfile, changePassword };
```

Create `backend/routes/userRoutes.js`:

```js
const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.get('/profile', authenticate, ctrl.getProfile);
router.put('/profile', authenticate, validate('profile'), ctrl.updateProfile);
router.put('/change-password', authenticate, validate('changePassword'), ctrl.changePassword);

module.exports = router;
```

---

## 12. Premium Subscription System

### 12.1 Subscription Service

Create `backend/services/subscriptionService.js`:

```js
const pool = require('../config/db');

const FEATURES = { ANALYTICS: 'analytics', PRIORITY_SUPPORT: 'priority_support', WHITE_LABEL: 'white_label', CERTIFICATES: 'certificates' };

async function getPublicPlans() {
  const [plans] = await pool.query(
    'SELECT id, name, code, description, price, currency, interval, features, max_courses, max_enrollments, max_parental_rules, tier_level FROM subscription_plans WHERE is_active = 1 ORDER BY tier_level'
  );
  return plans;
}

async function getUserSubscription(userId) {
  const [subs] = await pool.query(
    `SELECT us.*, sp.name as plan_name, sp.code as plan_code, sp.features, sp.max_courses, sp.max_enrollments, sp.max_parental_rules, sp.tier_level
     FROM user_subscriptions us JOIN subscription_plans sp ON us.plan_id = sp.id
     WHERE us.user_id = ? AND us.status IN ('active', 'trialing')
     ORDER BY us.created_at DESC LIMIT 1`, [userId]
  );
  return subs[0] || null;
}

async function getUserPlan(userId) {
  const sub = await getUserSubscription(userId);
  if (sub) {
    return {
      planId: sub.plan_id, planName: sub.plan_name, planCode: sub.plan_code,
      tierLevel: sub.tier_level,
      features: typeof sub.features === 'string' ? JSON.parse(sub.features) : sub.features,
      maxCourses: sub.max_courses, maxEnrollments: sub.max_enrollments, maxParentalRules: sub.max_parental_rules
    };
  }
  return {
    planId: null, planName: 'Free', planCode: 'free', tierLevel: 0,
    features: { analytics: false, priority_support: false, white_label: false, certificates: true },
    maxCourses: 3, maxEnrollments: 3, maxParentalRules: 2
  };
}

async function hasFeature(userId, featureKey) {
  const plan = await getUserPlan(userId);
  return plan.features[featureKey] === true;
}

async function canEnrollInMore(userId) {
  const plan = await getUserPlan(userId);
  if (plan.maxEnrollments === -1) return true;
  const [enrollments] = await pool.query('SELECT COUNT(*) as count FROM enrollments WHERE student_id = ? AND status = "active"', [userId]);
  return enrollments[0].count < plan.maxEnrollments;
}

async function canCreateMoreCourses(userId) {
  const plan = await getUserPlan(userId);
  if (plan.maxCourses === -1) return true;
  const [courses] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE teacher_id = ? AND status = "active"', [userId]);
  return courses[0].count < plan.maxCourses;
}

async function canCreateMoreParentalRules(userId) {
  const plan = await getUserPlan(userId);
  if (plan.maxParentalRules === -1) return true;
  // Count total rules across all children for this parent
  const [rules] = await pool.query('SELECT COUNT(*) as count FROM parental_rules WHERE parent_id = ?', [userId]);
  return rules[0].count < plan.maxParentalRules;
}

module.exports = { getPublicPlans, getUserSubscription, getUserPlan, hasFeature, canEnrollInMore, canCreateMoreCourses, canCreateMoreParentalRules, FEATURES };
```

### 12.2 Premium Middleware

Create `backend/middleware/premiumMiddleware.js`:

```js
const subscriptionService = require('../services/subscriptionService');

function premiumFeature(featureKey) {
  return async (req, res, next) => {
    const hasAccess = await subscriptionService.hasFeature(req.user.id, featureKey);
    if (!hasAccess) {
      return res.status(403).json({ message: 'This feature requires a premium subscription.', upgradePlan: true });
    }
    next();
  };
}

function limitCheck(checkFn, errorMessage) {
  return async (req, res, next) => {
    const allowed = await checkFn(req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: errorMessage, upgradePlan: true });
    }
    next();
  };
}

module.exports = { premiumFeature, limitCheck };
```

### 12.3 Subscription Controller (Stripe)

Create `backend/controllers/subscriptionController.js`:

```js
const pool = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const subscriptionService = require('../services/subscriptionService');

async function getPlans(req, res) {
  const plans = await subscriptionService.getPublicPlans();
  res.json(plans);
}

async function getMySubscription(req, res) {
  const sub = await subscriptionService.getUserSubscription(req.user.id);
  res.json(sub || { plan: 'free', tier: 0 });
}

async function createCheckoutSession(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) {
    // Manual/admin mode fallback
    return res.json({ url: null, manual: true, message: 'Stripe not configured. Use admin panel to assign plans.' });
  }
  const { planCode } = req.body;
  const [plans] = await pool.query('SELECT * FROM subscription_plans WHERE code = ?', [planCode]);
  if (plans.length === 0) return res.status(404).json({ message: 'Plan not found.' });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plans[0].stripe_price_id, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/subscription?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    client_reference_id: req.user.id.toString(),
    metadata: { planId: plans[0].id.toString() }
  });

  res.json({ url: session.url });
}

async function cancelSubscription(req, res) {
  const sub = await subscriptionService.getUserSubscription(req.user.id);
  if (!sub) return res.status(404).json({ message: 'No active subscription.' });

  if (sub.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
    await stripe.subscriptions.update(sub.stripe_subscription_id, { cancel_at_period_end: true });
  }
  await pool.query('UPDATE user_subscriptions SET status = "canceled" WHERE id = ?', [sub.id]);
  res.json({ message: 'Subscription canceled.' });
}

// Admin endpoints
async function adminGetAllSubscriptions(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const [subs] = await pool.query(
    `SELECT us.*, sp.name as plan_name, u.full_name as user_name, u.email as user_email
     FROM user_subscriptions us JOIN subscription_plans sp ON us.plan_id = sp.id
     JOIN users u ON us.user_id = u.id
     ORDER BY us.created_at DESC LIMIT ? OFFSET ?`, [limit, offset]
  );
  const [countResult] = await pool.query('SELECT COUNT(*) as total FROM user_subscriptions');
  res.json({ data: subs, total: countResult[0].total, page, limit });
}

async function adminGetStats(req, res) {
  const [active] = await pool.query('SELECT COUNT(*) as count FROM user_subscriptions WHERE status IN ("active", "trialing")');
  const [revenue] = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM payment_history WHERE status = "completed"');
  const [byPlan] = await pool.query(
    `SELECT sp.code, sp.name, COUNT(*) as count FROM user_subscriptions us JOIN subscription_plans sp ON us.plan_id = sp.id WHERE us.status = "active" GROUP BY sp.code, sp.name`
  );
  res.json({ activeSubscriptions: active[0].count, totalRevenue: revenue[0].total, byPlan });
}

async function adminAssignPlan(req, res) {
  const { userId, planCode, periodMonths } = req.body;
  const [plans] = await pool.query('SELECT * FROM subscription_plans WHERE code = ?', [planCode]);
  if (plans.length === 0) return res.status(404).json({ message: 'Plan not found.' });

  const now = new Date();
  const end = new Date(now.getTime() + (periodMonths || 1) * 30 * 24 * 60 * 60 * 1000);

  // Cancel existing active subscriptions
  await pool.query('UPDATE user_subscriptions SET status = "canceled" WHERE user_id = ? AND status IN ("active", "trialing")', [userId]);

  const [result] = await pool.query(
    'INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, payment_provider) VALUES (?, ?, "active", ?, ?, "manual")',
    [userId, plans[0].id, now, end]
  );

  if (plans[0].price > 0) {
    await pool.query(
      'INSERT INTO payment_history (user_id, subscription_id, amount, currency, status) VALUES (?, ?, ?, "usd", "completed")',
      [userId, result.insertId, plans[0].price]
    );
  }

  res.json({ message: `Plan "${planCode}" assigned.` });
}

module.exports = { getPlans, getMySubscription, createCheckoutSession, cancelSubscription, adminGetAllSubscriptions, adminGetStats, adminAssignPlan };
```

### 12.4 Subscription Routes

Create `backend/routes/subscriptionRoutes.js`:

```js
const router = require('express').Router();
const ctrl = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/plans', ctrl.getPlans);
router.get('/my', authenticate, ctrl.getMySubscription);
router.post('/create-checkout', authenticate, ctrl.createCheckoutSession);
router.post('/cancel', authenticate, ctrl.cancelSubscription);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), ctrl.adminGetAllSubscriptions);
router.get('/admin/stats', authenticate, authorize('admin'), ctrl.adminGetStats);
router.post('/admin/assign', authenticate, authorize('admin'), ctrl.adminAssignPlan);

module.exports = router;
```

---

## 13. Frontend Setup & Routing

### 13.1 Configure Vite

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOADS_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (optional)
```

### 13.2 API Service

Create `frontend/src/services/api.js`:

```jsx
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 13.3 Auth Context

Create `frontend/src/context/AuthContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me').then(res => setUser(res.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  };

  const logout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

### 13.4 Route Guards

`frontend/src/components/ProtectedRoute.jsx`:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ redirectTo = '/login' }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <Outlet /> : <Navigate to={redirectTo} />;
}
```

`frontend/src/components/RoleBasedRoute.jsx`:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedRoute({ allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/" />;
}
```

### 13.5 App Router

`frontend/src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import BrowseCourses from './pages/public/BrowseCourses';
import CourseDetails from './pages/public/CourseDetails';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import Pricing from './pages/public/Pricing';

// Protected pages
import Profile from './pages/Profile';
import SubscriptionManage from './pages/SubscriptionManage';

// Role-specific dashboards
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherLessons from './pages/teacher/TeacherLessons';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherSubmissions from './pages/teacher/TeacherSubmissions';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import CourseLearning from './pages/student/CourseLearning';
import TakeQuiz from './pages/student/TakeQuiz';
import StudentAssignments from './pages/student/Assignments';
import StudentGrades from './pages/student/Grades';

import ParentDashboard from './pages/parent/ParentDashboard';
import ChildActivity from './pages/parent/ChildActivity';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCourses from './pages/admin/ManageCourses';
import ManageCategories from './pages/admin/ManageCategories';
import ManageSubscriptions from './pages/admin/ManageSubscriptions';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<BrowseCourses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<SubscriptionManage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Teacher routes */}
            <Route element={<RoleBasedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher" element={<DashboardLayout />}>
                <Route index element={<TeacherDashboard />} />
                <Route path="courses" element={<TeacherCourses />} />
                <Route path="courses/create" element={<TeacherCourses />} />
                <Route path="courses/:id/lessons" element={<TeacherLessons />} />
                <Route path="assignments/create" element={<TeacherAssignments />} />
                <Route path="submissions" element={<TeacherSubmissions />} />
              </Route>
            </Route>

            {/* Student routes */}
            <Route element={<RoleBasedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<DashboardLayout />}>
                <Route index element={<StudentDashboard />} />
                <Route path="courses" element={<StudentCourses />} />
                <Route path="courses/:id/learn" element={<CourseLearning />} />
                <Route path="quizzes/:id/take" element={<TakeQuiz />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="grades" element={<StudentGrades />} />
              </Route>
            </Route>

            {/* Parent routes */}
            <Route element={<RoleBasedRoute allowedRoles={['parent']} />}>
              <Route path="/parent" element={<DashboardLayout />}>
                <Route index element={<ParentDashboard />} />
                <Route path="children/:childId/activity" element={<ChildActivity />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<RoleBasedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<DashboardLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="courses" element={<ManageCourses />} />
                <Route path="categories" element={<ManageCategories />} />
                <Route path="subscriptions" element={<ManageSubscriptions />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## 14. Frontend Components & Pages

### 14.1 Reusable Components

Create these in `frontend/src/components/`:

| Component | Purpose |
|-----------|---------|
| `Navbar.jsx` | Top navigation bar with brand logo, nav links, user dropdown, logout |
| `DashboardLayout.jsx` | Sidebar (role-based links) + main content area layout |
| `PublicLayout.jsx` | Wrapper with Navbar for public pages (uses `<Outlet />`) |
| `Modal.jsx` | Reusable modal dialog (title, message, confirm/cancel, supports children) |
| `LoadingSpinner.jsx` | Centered animated spinner for loading states |
| `AlertMessage.jsx` | Dismissible alert banner (success, danger, warning, info) |
| `CourseCard.jsx` | Card displaying course image, title, teacher, category, level badges |
| `AnnouncementsList.jsx` | Lists course announcements; teachers see create/delete buttons |
| `UpgradePrompt.jsx` | Inline or full-width banner with lock icon + "Upgrade" CTA |
| `PremiumGate.jsx` | Checks feature access, renders children or UpgradePrompt |

### 14.2 Building Pattern for Pages

Each page follows a consistent pattern:

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

export default function SamplePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/some-endpoint')
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <AlertMessage type="danger" message={error} />;

  return <div>{/* render data */}</div>;
}
```

### 14.3 Key Pages

**Login** (`pages/public/Login.jsx`) — Email + password form, calls `useAuth().login()`, navigates to role-based dashboard on success. Includes "Forgot password?" link and shows `successMessage` from `location.state`.

**Register** (`pages/public/Register.jsx`) — Name, email, password, role selector form. Calls `useAuth().register()`, then redirects to `/login`.

**ForgotPassword** (`pages/public/ForgotPassword.jsx`) — Email input, calls `POST /api/auth/forgot-password`, shows success message. Links back to login.

**ResetPassword** (`pages/public/ResetPassword.jsx`) — Reads `?token` from URL, validates it's present, shows new password + confirm fields, calls `POST /api/auth/reset-password`, navigates to `/login` with success.

**Profile** (`pages/Profile.jsx`) — Displays user avatar (first letter), editable name/phone, disabled email field, change password form with current password verification.

**Pricing** (`pages/public/Pricing.jsx`) — Fetches plans from `GET /api/subscriptions/plans`, renders plan cards with feature checklists, "Subscribe" button triggers Stripe checkout. Highlights plan from `?plan=` URL param.

**SubscriptionManage** (`pages/SubscriptionManage.jsx`) — Shows current plan details, features list, limits info, cancel button. Shows PremiumGate preview section.

**TakeQuiz** (`pages/student/TakeQuiz.jsx`) — Fetches quiz questions, implements countdown timer with `useCountdown` hook, auto-submits on expiry, shows red timer when ≤60s, disables inputs when expired.

**ManageSubscriptions (Admin)** (`pages/admin/ManageSubscriptions.jsx`) — Stats cards (active subs, revenue), subscription table with pagination, assign-plan modal (user dropdown + plan selector + duration), cancel confirmation modal.

---

## 15. Running the Application

### 15.1 Set up the database

```bash
cd backend
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
node migrations/migrate.js
```

### 15.2 Start the backend server

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:5000`.

### 15.3 Start the frontend

```bash
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173`.

### 15.4 Verify

```bash
# Backend module check
cd backend && node -e "console.log('Backend OK')"

# Frontend production build
cd frontend && npx vite build
```

### 15.5 Default Accounts

All seeded accounts use password: `Password123!`

| Role | Email |
|------|-------|
| Admin | admin@learnhub.test |
| Teacher | grace.teacher@learnhub.test |
| Student | brian.student@learnhub.test |
| Parent | akankwatsakevin0@gmail.com |

---

## 16. Optional: Remove Premium Features

If you want a fully free LMS without payments or subscription tiers:

1. **Database** — Drop `payment_history`, `user_subscriptions`, `subscription_plans` tables.
2. **Backend** — Delete `services/subscriptionService.js`, `controllers/subscriptionController.js`, `routes/subscriptionRoutes.js`, `middleware/premiumMiddleware.js`.
3. **Controllers** — Remove `subscriptionService` import and limit checks from `courseController.js`, `enrollmentController.js`, `parentController.js`.
4. **Server** — Remove subscription route imports and Stripe webhook from `server.js`.
5. **Frontend** — Delete `Pricing.jsx`, `SubscriptionManage.jsx`, `ManageSubscriptions.jsx`, `UpgradePrompt.jsx`, `PremiumGate.jsx`, `subscriptionService.js`.
6. **Routing** — Remove `/pricing`, `/subscription`, `/admin/subscriptions` routes from `App.jsx`.
7. **Navigation** — Remove Pricing link from `Navbar.jsx` and Subscription links from `DashboardLayout.jsx`.

---

## Summary

Following these steps produces a full-stack LMS with:

- Role-based authentication (admin, teacher, student, parent)
- Course and lesson management with file uploads
- Assignment submission and grading workflow with email notifications
- Quiz engine with countdown timer and auto-grading
- Parental controls (time windows, daily limits, activity filtering)
- Course announcements
- Password reset flow
- User profile management
- Optional premium subscription system with Stripe

Each feature follows a consistent architecture: **database table → controller → route → frontend service → frontend page**. Build the core (users, courses, lessons) first, then add features incrementally.
