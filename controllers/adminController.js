const db = require('../config/db');

async function getStats(req, res) {
  try {
    const users = await db.query('SELECT COUNT(*) AS total FROM users');
    const courses = await db.query('SELECT COUNT(*) AS total FROM courses');
    const enrollments = await db.query('SELECT COUNT(*) AS total FROM enrollments');
    const lessons = await db.query('SELECT COUNT(*) AS total FROM lessons');
    const diagnostics = await db.query('SELECT COUNT(*) AS total FROM diagnostic_results');
    const badges = await db.query('SELECT COUNT(*) AS total FROM badges');
    return res.json({
      totalUsers: users[0].total,
      totalCourses: courses[0].total,
      totalEnrollments: enrollments[0].total,
      totalLessons: lessons[0].total,
      totalDiagnostics: diagnostics[0].total,
      totalBadges: badges[0].total,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load statistics.', error: error.message });
  }
}

async function getUsers(req, res) {
  try {
    const users = await db.query(
      'SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load users.', error: error.message });
  }
}

async function getCourses(req, res) {
  try {
    const courses = await db.query(
      `SELECT c.*, u.full_name AS teacher_name, t.name AS tier_name, s.name AS subject_name
       FROM courses c JOIN users u ON u.id=c.teacher_id
       LEFT JOIN learning_tiers t ON t.id=c.tier_id
       LEFT JOIN subjects s ON s.id=c.subject_id
       ORDER BY c.created_at DESC`
    );
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load courses.', error: error.message });
  }
}

async function updateUserStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Status must be active or inactive.' });
    await db.query('UPDATE users SET status=? WHERE id=?', [status, req.params.id]);
    return res.json({ message: 'User status updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update user status.', error: error.message });
  }
}

async function updateCourseStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Status must be active or inactive.' });
    await db.query('UPDATE courses SET status=? WHERE id=?', [status, req.params.id]);
    return res.json({ message: 'Course status updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update course status.', error: error.message });
  }
}

async function getLeaderboard(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await db.query(
      `SELECT u.id, u.full_name, u.phone, u.role,
        COALESCE(e.points, 0) AS points,
        COALESCE(e.streak, 0) AS streak,
        COUNT(DISTINCT e.course_id) AS courses_enrolled
       FROM users u
       LEFT JOIN enrollments e ON e.student_id = u.id AND e.status = 'active'
       WHERE u.role = 'student'
       GROUP BY u.id, u.full_name, u.phone, u.role, e.points, e.streak
       ORDER BY points DESC
       LIMIT ?`,
      [limit.toString()]
    );
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load leaderboard.', error: error.message });
  }
}

async function getBadgeDefinitions(req, res) {
  const badges = {
    first_lesson: { name: 'First Steps', icon: '🌟', description: 'Complete your first lesson' },
    streak_3: { name: '3-Day Streak', icon: '🔥', description: 'Learn 3 days in a row' },
    streak_7: { name: 'Week Warrior', icon: '⚡', description: 'Learn 7 days in a row' },
    streak_30: { name: 'Champion', icon: '🏆', description: 'Learn 30 days in a row' },
    top_performer: { name: 'Top Performer', icon: '👑', description: 'Score 90%+ on diagnostic' },
    all_subjects: { name: 'All-Rounder', icon: '📚', description: 'Study all subjects in your tier' },
  };
  return res.json(badges);
}

async function getSmsLog(req, res) {
  try {
    const { phone } = req.query;
    if (phone) {
      const logs = await db.query('SELECT * FROM sms_log WHERE phone_number = ? ORDER BY created_at DESC LIMIT 20', [phone]);
      return res.json(logs);
    }
    const logs = await db.query('SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 50');
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load SMS logs.', error: error.message });
  }
}

module.exports = { getStats, getUsers, getCourses, updateUserStatus, updateCourseStatus, getLeaderboard, getBadgeDefinitions, getSmsLog };
