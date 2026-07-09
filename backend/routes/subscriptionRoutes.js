const express = require('express');
const subscriptionController = require('../controllers/subscriptionController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// ── Public routes ────────────────────────────────────────────────────────────

// GET /api/subscriptions/plans — List all available plans
router.get('/plans', subscriptionController.getPlans);

// ── Authenticated user routes ────────────────────────────────────────────────

// GET /api/subscriptions/my — Current user's subscription & plan
router.get('/my', authenticateToken, subscriptionController.getMySubscription);

// POST /api/subscriptions/create-checkout — Create Stripe checkout session
router.post('/create-checkout', authenticateToken, subscriptionController.createCheckoutSession);

// POST /api/subscriptions/cancel — Cancel own subscription
router.post('/cancel', authenticateToken, subscriptionController.cancelMySubscription);

// POST /api/subscriptions/fake-payment — Simulate payment (mock mode)
router.post('/fake-payment', authenticateToken, subscriptionController.fakePayment);

// GET /api/subscriptions/success — Handle successful checkout redirect
router.get('/success', subscriptionController.checkoutSuccess);

// ── NOTE: Stripe webhook is registered in server.js before express.json() ──
// POST /api/subscriptions/webhook — handled in server.js with raw body parser

module.exports = router;
