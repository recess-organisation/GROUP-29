const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

const router = express.Router();

router.post('/register', validate('register'), authController.register);
router.post('/login', validate('login'), authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.me);
router.post('/forgot-password', validate('forgot-password'), authController.forgotPassword);
router.post('/reset-password', validate('reset-password'), authController.resetPassword);

module.exports = router;
