const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const { rateLimit } = require('./src/middleware/rateLimit');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimit);

app.use(express.static(path.join(__dirname, 'src', 'views')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'views', 'index.html'));
});

const apiRoutes = require('./src/routes/api');
const ussdRoutes = require('./src/routes/ussd');
const smsRoutes = require('./src/routes/sms');

app.use('/api', apiRoutes);
app.use('/ussd', ussdRoutes);
app.use('/sms', smsRoutes);

app.listen(PORT, () => {
  console.log(`UGScholar running on http://localhost:${PORT}`);
});

module.exports = app;
