const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, validate('profile'), userController.updateProfile);
router.put('/change-password', authenticateToken, validate('change-password'), userController.changePassword);

module.exports = router;
