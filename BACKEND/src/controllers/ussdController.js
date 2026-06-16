const ussdEngine = require('../services/ussdEngine');

async function handleUssd(req, res) {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  if (!phoneNumber) {
    return res.status(400).send('END Missing phone number');
  }

  try {
    const result = await ussdEngine.handle(sessionId, phoneNumber, text || '');
    res.set('Content-Type', 'text/plain');
    res.send(`${result.type} ${result.message}`);
  } catch (err) {
    console.error('USSD error:', err);
    res.status(500).send('END System error. Please try again.');
  }
}

module.exports = { handleUssd };
