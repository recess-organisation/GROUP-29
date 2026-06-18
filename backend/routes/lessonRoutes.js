const express = require('express');
const lessonController = require('../controllers/lessonController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { uploadMaterial } = require('../middleware/uploadMiddleware');
const checkParentalControl = require('../middleware/parentalControlMiddleware');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('teacher', 'admin'), uploadMaterial.array('materials', 5), lessonController.createLesson);
router.get('/course/:courseId', authenticateToken, checkParentalControl('LESSON'), lessonController.getLessonsByCourse);
router.get('/:id', authenticateToken, checkParentalControl('LESSON'), lessonController.getLessonById);
router.put('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), uploadMaterial.array('materials', 5), lessonController.updateLesson);
router.delete('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), lessonController.deleteLesson);

module.exports = router;
