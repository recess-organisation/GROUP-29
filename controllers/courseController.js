const db = require('../config/db');

async function findCourse(id) {
  const courses = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
  return courses[0];
}

function canManageCourse(user, course) {
  return user.role === 'admin' || (user.role === 'teacher' && course.teacher_id === user.id);
}

async function getCourses(req, res) {
  try {
    const { search = '', tier = '', subject = '', language = '' } = req.query;
    const params = [];
    let sql = `
      SELECT c.*, u.full_name AS teacher_name,
        t.name AS tier_name, s.name AS subject_name,
        COUNT(e.id) AS enrolled_students
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      LEFT JOIN learning_tiers t ON t.id = c.tier_id
      LEFT JOIN subjects s ON s.id = c.subject_id
      LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
      WHERE c.status = 'active'
    `;
    if (search) { sql += ' AND (c.title LIKE ? OR c.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (tier) { sql += ' AND c.tier_id = ?'; params.push(tier); }
    if (subject) { sql += ' AND c.subject_id = ?'; params.push(subject); }
    if (language) { sql += ' AND c.language_code = ?'; params.push(language); }
    sql += ' GROUP BY c.id ORDER BY c.created_at DESC';
    const courses = await db.query(sql, params);
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load courses.', error: error.message });
  }
}

async function getCourseById(req, res) {
  try {
    const courses = await db.query(
      `SELECT c.*, u.full_name AS teacher_name, t.name AS tier_name, s.name AS subject_name
       FROM courses c JOIN users u ON u.id = c.teacher_id
       LEFT JOIN learning_tiers t ON t.id = c.tier_id
       LEFT JOIN subjects s ON s.id = c.subject_id
       WHERE c.id = ?`, [req.params.id]
    );
    if (courses.length === 0) return res.status(404).json({ message: 'Course not found.' });
    return res.json(courses[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load course.', error: error.message });
  }
}

async function createCourse(req, res) {
  try {
    const { tier_id, subject_id, title, description, level, duration, language_code } = req.body;
    if (!title || !description) return res.status(400).json({ message: 'Title and description are required.' });
    const result = await db.query(
      'INSERT INTO courses (teacher_id, tier_id, subject_id, title, description, level, duration, language_code, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, tier_id || null, subject_id || null, title, description, level || 'Beginner', duration || null, language_code || 'en', req.file ? req.file.path : null]
    );
    const course = await findCourse(result.insertId);
    return res.status(201).json({ message: 'Course created.', course });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create course.', error: error.message });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await findCourse(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (!canManageCourse(req.user, course)) return res.status(403).json({ message: 'You can only edit your own courses.' });

    const { tier_id, subject_id, title, description, level, duration, language_code, status } = req.body;
    await db.query(
      'UPDATE courses SET tier_id=?, subject_id=?, title=?, description=?, level=?, duration=?, language_code=?, status=?, cover_image=COALESCE(?,cover_image) WHERE id=?',
      [tier_id||null, subject_id||null, title||course.title, description||course.description, level||course.level,
       duration||course.duration, language_code||course.language_code, status||course.status, req.file?req.file.path:null, req.params.id]
    );
    return res.json({ message: 'Course updated.', course: await findCourse(req.params.id) });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update course.', error: error.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await findCourse(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (!canManageCourse(req.user, course)) return res.status(403).json({ message: 'You can only delete your own courses.' });
    await db.query('UPDATE courses SET status = ? WHERE id = ?', ['inactive', req.params.id]);
    return res.json({ message: 'Course deactivated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete course.', error: error.message });
  }
}

async function getMyCourses(req, res) {
  try {
    const courses = await db.query(
      `SELECT c.*, t.name AS tier_name, s.name AS subject_name, COUNT(e.id) AS enrolled_students
       FROM courses c LEFT JOIN learning_tiers t ON t.id = c.tier_id
       LEFT JOIN subjects s ON s.id = c.subject_id
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
       WHERE c.teacher_id = ? GROUP BY c.id ORDER BY c.created_at DESC`, [req.user.id]
    );
    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load teacher courses.', error: error.message });
  }
}

async function getTiers(req, res) {
  try {
    const tiers = await db.query('SELECT * FROM learning_tiers ORDER BY id');
    return res.json(tiers);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load tiers.', error: error.message });
  }
}

async function getSubjects(req, res) {
  try {
    const { tier_id } = req.query;
    let sql = 'SELECT * FROM subjects';
    const params = [];
    if (tier_id) { sql += ' WHERE tier_id = ?'; params.push(tier_id); }
    sql += ' ORDER BY name';
    const subjects = await db.query(sql, params);
    return res.json(subjects);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load subjects.', error: error.message });
  }
}

module.exports = { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, getMyCourses, getTiers, getSubjects, canManageCourse, findCourse };
