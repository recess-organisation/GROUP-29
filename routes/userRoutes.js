const express = require('express');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/web-users', authenticateToken, userController.getWebUsers);
router.get('/parent/children', authenticateToken, userController.getMyChildren);
router.post('/parent/children', authenticateToken, userController.linkChild);
router.get('/parent/children/:id', authenticateToken, userController.getChildProgress);

module.exports = router;
