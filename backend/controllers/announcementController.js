const db = require('../config/db');
const { findCourse, canManageCourse } = require('./courseController');

async function getAnnouncementsByCourse(req, res) {
  try {
    const { courseId } = req.params;

    const announcements = await db.query(
      `SELECT a.*, u.full_name AS author_name
       FROM announcements a
       JOIN users u ON u.id = a.author_id
       WHERE a.course_id = ?
       ORDER BY a.created_at DESC`,
      [courseId]
    );

    return res.json(announcements);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load announcements.' });
  }
}

async function createAnnouncement(req, res) {
  try {
    const { course_id, title, message } = req.body;

    if (!course_id || !title || !message) {
      return res.status(400).json({ message: 'Course ID, title, and message are required.' });
    }

    const course = await findCourse(course_id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Only the course teacher or admin can post announcements
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'Only the course teacher can create announcements.' });
    }

    const result = await db.query(
      'INSERT INTO announcements (course_id, author_id, title, message) VALUES (?, ?, ?, ?)',
      [course_id, req.user.id, title, message]
    );

    return res.status(201).json({ message: 'Announcement created.', announcement_id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create announcement.' });
  }
}

async function deleteAnnouncement(req, res) {
  try {
    const announcements = await db.query('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    if (announcements.length === 0) {
      return res.status(404).json({ message: 'Announcement not found.' });
    }

    const course = await findCourse(announcements[0].course_id);
    if (!canManageCourse(req.user, course)) {
      return res.status(403).json({ message: 'You can only delete announcements for your own courses.' });
    }

    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Announcement deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete announcement.' });
  }
}

module.exports = {
  getAnnouncementsByCourse,
  createAnnouncement,
  deleteAnnouncement
};
