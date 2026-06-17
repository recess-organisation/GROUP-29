const db = require('../config/db');

async function getProfile(req, res) {
  try {
    const users = await db.query(
      'SELECT id, full_name, email, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
    return res.json(users[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load profile.', error: error.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { full_name, phone } = req.body;
    if (!full_name) return res.status(400).json({ message: 'Full name is required.' });
    await db.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone || null, req.user.id]);
    return getProfile(req, res);
  } catch (error) {
    return res.status(500).json({ message: 'Could not update profile.', error: error.message });
  }
}

async function getWebUsers(req, res) {
  try {
    const users = await db.query(
      'SELECT id, full_name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load users.', error: error.message });
  }
}

async function getMyChildren(req, res) {
  try {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Only parents can view children.' });
    const children = await db.query(
      `SELECT u.id AS student_id, u.full_name, u.email, u.phone,
        COALESCE(e.points, 0) AS points, COALESCE(e.streak, 0) AS streak,
        COUNT(DISTINCT e.course_id) AS courses_count
       FROM parent_students ps
       JOIN users u ON u.id = ps.student_id
       LEFT JOIN enrollments e ON e.student_id = u.id AND e.status = 'active'
       WHERE ps.parent_id = ?
       GROUP BY u.id, u.full_name, u.email, u.phone, e.points, e.streak
       ORDER BY u.full_name`,
      [req.user.id]
    );
    return res.json(children);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load children.', error: error.message });
  }
}

async function linkChild(req, res) {
  try {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Only parents can link children.' });
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Child email is required.' });

    const students = await db.query('SELECT id, full_name, role, status FROM users WHERE email = ?', [email]);
    if (students.length === 0) return res.status(404).json({ message: 'No account found with that email.' });
    const student = students[0];
    if (student.role !== 'student') return res.status(400).json({ message: 'That account is not a student.' });
    if (student.status !== 'active') return res.status(400).json({ message: 'That account is not active.' });

    const existing = await db.query(
      'SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?',
      [req.user.id, student.id]
    );
    if (existing.length > 0) return res.status(409).json({ message: 'Child is already linked.' });

    await db.query(
      'INSERT INTO parent_students (parent_id, student_id) VALUES (?, ?)',
      [req.user.id, student.id]
    );
    return res.status(201).json({ message: `Linked ${student.full_name} successfully.` });
  } catch (error) {
    return res.status(500).json({ message: 'Could not link child.', error: error.message });
  }
}

async function getChildProgress(req, res) {
  try {
    if (req.user.role !== 'parent') return res.status(403).json({ message: 'Only parents can view child progress.' });
    const studentId = req.params.id;

    const linked = await db.query(
      'SELECT id FROM parent_students WHERE parent_id = ? AND student_id = ?',
      [req.user.id, studentId]
    );
    if (linked.length === 0) return res.status(403).json({ message: 'This student is not linked to you.' });

    const students = await db.query(
      'SELECT id, full_name, email FROM users WHERE id = ? AND role = ?',
      [studentId, 'student']
    );
    if (students.length === 0) return res.status(404).json({ message: 'Student not found.' });
    const child = students[0];

    const enrollments = await db.query(
      `SELECT e.course_id, c.title, e.progress_percentage, e.points, e.streak, e.status
       FROM enrollments e JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = ? ORDER BY e.enrolled_at DESC`,
      [studentId]
    );

    const diagnostics = await db.query(
      'SELECT * FROM diagnostic_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [studentId]
    );

    const badges = await db.query(
      'SELECT * FROM badges WHERE user_id = ?',
      [studentId]
    );

    const enrollmentAgg = await db.query(
      `SELECT COALESCE(SUM(points), 0) AS total_points,
              COALESCE(MAX(streak), 0) AS max_streak,
              COUNT(*) AS courses_count
       FROM enrollments WHERE student_id = ?`,
      [studentId]
    );

    return res.json({
      ...child,
      points: enrollmentAgg[0]?.total_points || 0,
      streak: enrollmentAgg[0]?.max_streak || 0,
      courses_count: enrollmentAgg[0]?.courses_count || 0,
      badges_count: badges.length,
      courses: enrollments,
      diagnostics,
      badges,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not load child progress.', error: error.message });
  }
}

module.exports = { getProfile, updateProfile, getWebUsers, getMyChildren, linkChild, getChildProgress };
