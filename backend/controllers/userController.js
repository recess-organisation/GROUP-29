const bcrypt = require('bcrypt');
const db = require('../config/db');

async function getProfile(req, res) {
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
    console.error('[userController.getProfile]', error.message);
    return res.status(500).json({ message: 'Could not load profile.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { full_name, phone } = req.body;

    if (!full_name) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    await db.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone || null, req.user.id]);
    return getProfile(req, res);
  } catch (error) {
    console.error('[userController.updateProfile]', error.message);
    return res.status(500).json({ message: 'Could not update profile.' });
  }
}

async function changePassword(req, res) {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const users = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const passwordMatches = await bcrypt.compare(current_password, users[0].password);
    if (!passwordMatches) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('[userController.changePassword]', error.message);
    return res.status(500).json({ message: 'Could not change password.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
