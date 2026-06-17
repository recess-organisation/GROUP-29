const express = require('express');
const ussdController = require('../controllers/ussdController');
const router = express.Router();

router.post('/', ussdController.handleUssd);

module.exports = router;
