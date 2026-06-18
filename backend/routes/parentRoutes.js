const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const parentController = require('../controllers/parentController');

router.use(authenticateToken);
router.use(authorizeRoles('parent'));

router.get('/dashboard', parentController.getDashboard);
router.post('/children/link', parentController.linkChild);
router.delete('/children/:childId', parentController.unlinkChild);
router.get('/children/:childId/activity', parentController.getChildActivityLog);
router.get('/children/:childId/usage', parentController.getDailyUsage);
router.get('/children/:childId/rules', parentController.getRules);
router.post('/rules', parentController.createRule);
router.put('/rules/:id', parentController.updateRule);
router.delete('/rules/:id', parentController.deleteRule);

module.exports = router;
