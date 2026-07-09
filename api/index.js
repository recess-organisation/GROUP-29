// Load environment variables (Vercel injects them automatically, dotenv is a no-op on Vercel)
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/server');

module.exports = app;
