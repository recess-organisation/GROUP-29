const express = require('express');
const adminController = require('../controllers/adminController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/courses', adminController.getCourses);
router.get('/leaderboard', adminController.getLeaderboard);
router.get('/badges', adminController.getBadgeDefinitions);
router.get('/sms/logs', adminController.getSmsLog);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/courses/:id/status', adminController.updateCourseStatus);

module.exports = router;
