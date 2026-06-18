const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const checkParentalControl = require('../middleware/parentalControlMiddleware');
const quizController = require('../controllers/quizController');

// Teacher routes
router.get('/lesson/:lessonId', authenticateToken, authorizeRoles('teacher', 'admin', 'student'), quizController.getQuizzesByLesson);
router.get('/edit/:id', authenticateToken, authorizeRoles('teacher', 'admin'), quizController.getQuizForEdit);
router.post('/', authenticateToken, authorizeRoles('teacher', 'admin'), quizController.createQuiz);
router.put('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), quizController.updateQuiz);
router.delete('/:id', authenticateToken, authorizeRoles('teacher', 'admin'), quizController.deleteQuiz);
router.put('/:quizId/questions', authenticateToken, authorizeRoles('teacher', 'admin'), quizController.saveQuestions);

// Student routes
router.get('/take/:id', authenticateToken, authorizeRoles('student'), checkParentalControl('QUIZ'), quizController.getQuizForTaking);
router.post('/:quizId/start', authenticateToken, authorizeRoles('student'), checkParentalControl('QUIZ'), quizController.startAttempt);
router.post('/attempt/:attemptId/submit', authenticateToken, authorizeRoles('student'), quizController.submitAttempt);
router.get('/attempt/:attemptId/result', authenticateToken, authorizeRoles('student'), quizController.getAttemptResult);
router.get('/my-attempts/:quizId', authenticateToken, authorizeRoles('student'), quizController.getMyQuizAttempts);

module.exports = router;
