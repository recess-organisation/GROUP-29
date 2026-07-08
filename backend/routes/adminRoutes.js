const express = require('express');
const adminController = require('../controllers/adminController');
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/courses', adminController.getCourses);
router.put('/users/:id/status', adminController.updateUserStatus);
router.put('/courses/:id/status', adminController.updateCourseStatus);
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);

// ── Subscription management ─────────────────────────────────────────────────
router.get('/subscriptions', subscriptionController.adminGetAllSubscriptions);
router.get('/subscriptions/stats', subscriptionController.adminGetStats);
router.post('/subscriptions/assign', subscriptionController.adminAssignPlan);
router.post('/subscriptions/:id/cancel', subscriptionController.adminCancelSubscription);
router.put('/plans/:id', subscriptionController.adminUpdatePlan);

module.exports = router;
