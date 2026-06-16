const express = require('express');
const router = express.Router();
const db = require('../config/db');
const gamification = require('../services/gamification');

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/stats', async (req, res) => {
  const [userCount] = await db.query('SELECT COUNT(*) as c FROM users');
  const [lessonCount] = await db.query('SELECT COALESCE(SUM(lessons_completed),0) as c FROM users');
  const [diagCount] = await db.query('SELECT COUNT(*) as c FROM diagnostic_results');
  const [badgeCount] = await db.query('SELECT COUNT(*) as c FROM badges');

  res.json({
    totalUsers: userCount.c,
    totalLessons: lessonCount.c,
    totalDiagnostics: diagCount.c,
    totalBadges: badgeCount.c,
  });
});

router.get('/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const data = await gamification.getLeaderboard(limit);
  res.json(data);
});

router.get('/badges', (req, res) => {
  res.json(gamification.getBadgeDefinitions());
});

router.get('/rewards/thresholds', (req, res) => {
  res.json(gamification.getAirtimeThresholds());
});

router.get('/learners/:phone', async (req, res) => {
  const { phone } = req.params;
  const users = await db.query('SELECT * FROM users WHERE phone_number = ?', [phone]);
  if (!users.length) return res.status(404).json({ error: 'Learner not found' });

  const stats = await gamification.getUserStats(users[0].id);
  res.json(stats);
});

router.get('/sms/logs', async (req, res) => {
  const { phone } = req.query;
  let logs;
  if (phone) {
    logs = await db.query('SELECT * FROM sms_log WHERE phone_number = ? ORDER BY created_at DESC LIMIT 20', [phone]);
  } else {
    logs = await db.query('SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 50');
  }
  res.json(logs);
});

module.exports = router;
