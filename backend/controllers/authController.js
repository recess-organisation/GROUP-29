const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const emailService = require('../services/emailService');

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register(req, res) {
  try {
    const { full_name, email, phone, password, role } = req.body;
    const selectedRole = role || 'student';

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    if (!['student', 'teacher', 'parent'].includes(selectedRole)) {
      return res.status(400).json({ message: 'Only student, teacher, or parent accounts can self-register.' });
    }

    const existingUsers = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, phone || null, hashedPassword, selectedRole]
    );

    const users = await db.query(
      'SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const token = createToken(users[0]);

    // Send welcome email (fire-and-forget — don't block registration)
    emailService.sendWelcomeEmail(users[0].email, users[0].full_name).catch(() => {});

    return res.status(201).json({ message: 'Account created successfully.', token, user: users[0] });
  } catch (error) {
    console.error('[authController.register]', error.message);
    return res.status(500).json({ message: 'Registration failed.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account is not active.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    delete user.password;
    const token = createToken(user);
    return res.json({ message: 'Login successful.', token, user });
  } catch (error) {
    console.error('[authController.login]', error.message);
    return res.status(500).json({ message: 'Login failed.' });
  }
}

async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.decode(token);
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000).toISOString().slice(0, 19).replace('T', ' ')
        : new Date(Date.now() + 86400000).toISOString().slice(0, 19).replace('T', ' ');

      await db.query(
        'INSERT IGNORE INTO token_blacklist (token, expires_at) VALUES (?, ?)',
        [token, expiresAt]
      );
    }

    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[authController.logout]', error.message);
    return res.status(500).json({ message: 'Logout failed.' });
  }
}

async function me(req, res) {
  try {
    const users = await db.query(
      'SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json(users[0]);
  } catch (error) {
    console.error('[authController.me]', error.message);
    return res.status(500).json({ message: 'Could not load profile.' });
  }
}

// ── Password Reset ───────────────────────────────────────────────────────────

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const users = await db.query('SELECT id, full_name, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Don't reveal whether the email exists — always return success
      return res.json({ message: 'If that email is registered, a password reset link has been sent.' });
    }

    const user = users[0];

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      .toISOString().slice(0, 19).replace('T', ' ');

    // Invalidate any existing tokens for this user
    await db.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
      [user.id]
    );

    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    // Send email with the unhashed token
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return res.json({ message: 'If that email is registered, a password reset link has been sent.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not process request.' });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const tokens = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [hashedToken]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, tokens[0].user_id]);
    await db.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [tokens[0].id]);

    return res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not reset password.' });
  }
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword
};
