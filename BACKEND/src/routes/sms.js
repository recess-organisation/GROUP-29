const express = require('express');
const router = express.Router();
const atService = require('../services/africasTalking');
const db = require('../config/db');

router.post('/incoming', async (req, res) => {
  const { from, text, date, id } = req.body;

  await db.query(
    'INSERT INTO sms_log (phone_number, message, direction, status) VALUES (?, ?, ?, ?)',
    [from, text, 'inbound', 'received']
  );

  res.json({ status: 'ok' });
});

router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing to or message' });
  }

  const result = await atService.sendSMS(to, message);

  if (result.success) {
    res.json({ status: 'queued', simulated: result.simulated });
  } else {
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

router.get('/logs', async (req, res) => {
  const { phone } = req.query;
  let logs;

  if (phone) {
    logs = await db.query(
      'SELECT * FROM sms_log WHERE phone_number = ? ORDER BY created_at DESC LIMIT 20',
      [phone]
    );
  } else {
    logs = await db.query(
      'SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 50'
    );
  }

  res.json(logs);
});

module.exports = router;
