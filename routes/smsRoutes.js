const express = require('express');
const smsController = require('../controllers/smsController');
const router = express.Router();

router.post('/incoming', smsController.handleIncoming);
router.post('/send', smsController.sendSms);
router.get('/logs', smsController.getSmsLog);

module.exports = router;
