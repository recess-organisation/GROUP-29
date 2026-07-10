const path = require('path');
const db = require('../config/db');
const subscriptionService = require('../services/subscriptionService');
const { getStoredFilePath } = require('../middleware/uploadMiddleware');

async function findCourse(id) {
  const courses = await db.query('SELECT * FROM courses WHERE id = ?', [id]);
  return courses[0];
}

function canManageCourse(user, course) {
  return user.role === 'admin' || (user.role === 'teacher' && course.teacher_id === user.id);
}

async function getCourses(req, res) {
  try {
    const { search = '', category = '', level = '', page = '1', limit = '12' } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const offset = (pageNum - 1) * limitNum;
    const params = [];
    const countParams = [];
    let where = ' WHERE c.status = \'active\'';

    if (search) {
      where += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      where += ' AND c.category_id = ?';
      params.push(category);
      countParams.push(category);
    }

    if (level) {
      where += ' AND c.level = ?';
      params.push(level);
      countParams.push(level);
    }

    const countResult = await db.query(
      `SELECT COUNT(*) AS total FROM courses c ${where}`, countParams
    );
    const total = countResult[0].total;

    const sql = `
      SELECT c.id, c.teacher_id, c.category_id, c.title, c.description,
        c.level, c.duration, c.status, c.cover_image, c.created_at, c.updated_at,
        u.full_name AS teacher_name, cat.name AS category_name,
        COUNT(e.id) AS enrolled_students
      FROM courses c
      JOIN users u ON u.id = c.teacher_id
      LEFT JOIN course_categories cat ON cat.id = c.category_id
      LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
      ${where}
      GROUP BY c.id, c.teacher_id, c.category_id, c.title, c.description,
        c.level, c.duration, c.status, c.cover_image, c.created_at, c.updated_at,
        u.full_name, cat.name
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(limitNum, offset);
    const courses = await db.query(sql, params);
    return res.json({ data: courses, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('[courseController.getCourses]', error.message);
    return res.status(500).json({ message: 'Could not load courses.' });
  }
}

async function getCourseById(req, res) {
  try {
    const courses = await db.query(
      `SELECT c.*, u.full_name AS teacher_name, cat.name AS category_name
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    return res.json(courses[0]);
  } catch (error) {
    console.error('[courseController.getCourseById]', error.message);
    return res.status(500).json({ message: 'Could not load course.' });
  }
}

async function createCourse(req, res) {
  try {
    const { category_id, title, description, level, duration } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required.' });
    }
    // Premium check: free teachers are limited in how many courses they can create
    const canCreate = await subscriptionService.canCreateMoreCourses(req.user.id);
    if (!canCreate) {
      return res.status(403).json({
        message: 'Free plan limited to 3 courses. Upgrade to Teacher Pro for unlimited courses.',
        code: 'LIMIT_REACHED',
        upgradePlan: 'teacher_pro'
      });
    }
    const result = await db.query(
      `INSERT INTO courses (teacher_id, category_id, title, description, level, duration, cover_image)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id || null, title, description, level || 'Beginner', duration || null, getStoredFilePath(req.file)]
    );

    const course = await findCourse(result.insertId);
    return res.status(201).json({ message: 'Course created.', course });
  } catch (error) {
    console.error('[courseController.createCourse]', error.message);
    return res.status(500).json({ message: 'Could not create course.' });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await findCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only edit your own courses.' });
    }

    const { category_id, title, description, level, duration, status } = req.body;
    await db.query(
      `UPDATE courses
       SET category_id = ?, title = ?, description = ?, level = ?, duration = ?, status = ?, cover_image = COALESCE(?, cover_image)
       WHERE id = ?`,
      [
        category_id || null,
        title || course.title,
        description || course.description,
        level || course.level,
        duration || course.duration,
        status || course.status,
        getStoredFilePath(req.file),
        req.params.id
      ]
    );

    return res.json({ message: 'Course updated.', course: await findCourse(req.params.id) });
  } catch (error) {
    console.error('[courseController.updateCourse]', error.message);
    return res.status(500).json({ message: 'Could not update course.' });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await findCourse(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only delete your own courses.' });
    }

    await db.query('UPDATE courses SET status = ? WHERE id = ?', ['inactive', req.params.id]);
    return res.json({ message: 'Course deactivated.' });
  } catch (error) {
    console.error('[courseController.deleteCourse]', error.message);
    return res.status(500).json({ message: 'Could not delete course.' });
  }
}

async function getMyCourses(req, res) {
  try {
    const courses = await db.query(
      `SELECT c.id, c.teacher_id, c.category_id, c.title, c.description,
        c.level, c.duration, c.status, c.cover_image, c.created_at, c.updated_at,
        cat.name AS category_name,
        COUNT(e.id) AS enrolled_students
       FROM courses c
       LEFT JOIN course_categories cat ON cat.id = c.category_id
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
       WHERE c.teacher_id = ?
       GROUP BY c.id, c.teacher_id, c.category_id, c.title, c.description,
        c.level, c.duration, c.status, c.cover_image, c.created_at, c.updated_at,
        cat.name
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    return res.json(courses);
  } catch (error) {
    console.error('[courseController.getMyCourses]', error.message);
    return res.status(500).json({ message: 'Could not load teacher courses.' });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await db.query(
      'SELECT * FROM course_categories WHERE status = ? ORDER BY name',
      ['active']
    );
    return res.json(categories);
  } catch (error) {
    console.error('[courseController.getCategories]', error.message);
    return res.status(500).json({ message: 'Could not load categories.' });
  }
}

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  getCategories,
  canManageCourse,
  findCourse
};
