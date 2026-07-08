const express = require('express');
const announcementController = require('../controllers/announcementController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/announcements/course/:courseId — list announcements for a course
router.get('/course/:courseId', authenticateToken, announcementController.getAnnouncementsByCourse);

// POST /api/announcements — create a new announcement (teacher/admin only)
router.post('/', authenticateToken, announcementController.createAnnouncement);

// DELETE /api/announcements/:id — delete an announcement
router.delete('/:id', authenticateToken, announcementController.deleteAnnouncement);

module.exports = router;
