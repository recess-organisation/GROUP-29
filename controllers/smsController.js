const db = require('../config/db');

async function handleIncoming(req, res) {
  try {
    const { from, text } = req.body;
    if (!from || !text) return res.status(400).json({ message: 'Missing from or text.' });

    await db.query(
      'INSERT INTO sms_log (phone_number, direction, message, status) VALUES (?,?,?,?)',
      [from, 'inbound', text, 'received']
    );

    const reply = 'Thank you for your message. Visit http://localhost:3000 for more.';
    await db.query(
      'INSERT INTO sms_log (phone_number, direction, message, status) VALUES (?,?,?,?)',
      [from, 'outbound', reply, 'sent']
    );

    return res.json({ message: 'SMS received.', response: reply });
  } catch (error) {
    return res.status(500).json({ message: 'Could not process SMS.', error: error.message });
  }
}

async function sendSms(req, res) {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ message: 'Phone and message are required.' });

    await db.query(
      'INSERT INTO sms_log (phone_number, direction, message, status) VALUES (?,?,?,?)',
      [phone, 'outbound', message, 'sent']
    );

    return res.json({ message: 'SMS sent.', to: phone, text: message });
  } catch (error) {
    return res.status(500).json({ message: 'Could not send SMS.', error: error.message });
  }
}

async function getSmsLog(req, res) {
  try {
    const { phone } = req.query;
    if (phone) {
      const logs = await db.query('SELECT * FROM sms_log WHERE phone_number = ? ORDER BY created_at DESC LIMIT 20', [phone]);
      return res.json(logs);
    }
    const logs = await db.query('SELECT * FROM sms_log ORDER BY created_at DESC LIMIT 50');
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load SMS logs.', error: error.message });
  }
}

module.exports = { handleIncoming, sendSms, getSmsLog };
