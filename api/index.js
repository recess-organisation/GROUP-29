// Load environment variables
// - On Vercel: env vars are injected automatically, dotenv is a no-op
// - Locally: load from backend/.env
try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });
} catch {
  // .env file is optional — Vercel injects env vars natively
}

// On Vercel, set NODE_ENV so the backend knows it's in production
if (process.env.VERCEL) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
}

let app;
try {
  app = require('../backend/server');
} catch (err) {
  console.error('[api/index] Failed to load backend server:', err);
  // Return a minimal Express app that shows the error
  const express = require('express');
  const errorApp = express();
  errorApp.all('*', (req, res) => {
    res.status(500).json({
      message: 'Server initialization failed. Check Vercel function logs.',
      error: process.env.NODE_ENV === 'production' ? 'Internal error' : err.message
    });
  });
  module.exports = errorApp;
  return;
}

module.exports = app;
