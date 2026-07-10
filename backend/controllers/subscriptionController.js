const db = require('../config/db');
const subscriptionService = require('../services/subscriptionService');

// ── Public endpoints ─────────────────────────────────────────────────────────

/** GET /api/subscriptions/plans — List all public plans */
async function getPlans(req, res) {
  try {
    const plans = await subscriptionService.getPublicPlans();
    return res.json(plans);
  } catch (error) {
    console.error('[subscriptionController.getPlans]', error.message);
    return res.status(500).json({ message: 'Could not load plans.' });
  }
}

/** GET /api/subscriptions/my — Current user's subscription details */
async function getMySubscription(req, res) {
  try {
    const plan = await subscriptionService.getUserPlan(req.user.id);
    const subscription = await subscriptionService.getUserSubscription(req.user.id);
    return res.json({
      plan,
      subscription
    });
  } catch (error) {
    console.error('[subscriptionController.getMySubscription]', error.message);
    return res.status(500).json({ message: 'Could not load subscription.' });
  }
}

/** POST /api/subscriptions/create-checkout — Create a checkout session */
async function createCheckoutSession(req, res) {
  try {
    const { planCode } = req.body;
    if (!planCode) {
      return res.status(400).json({ message: 'Plan code is required.' });
    }

    const plan = await subscriptionService.getPlanByCode(planCode);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';

    if (process.env.STRIPE_SECRET_KEY) {
      const result = await subscriptionService.createStripeCheckoutSession({
        userId: req.user.id,
        userEmail: req.user.email,
        planCode,
        successUrl: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/pricing`
      });
      return res.json(result);
    }

    // Fake mode — return a local mock checkout URL
    return res.json({
      url: `${origin}/pricing/mock-checkout?plan=${planCode}`
    });
  } catch (error) {
    console.error('[subscriptionController.createCheckoutSession]', error.message);
    return res.status(500).json({ message: 'Could not create checkout session.' });
  }
}

/** POST /api/subscriptions/fake-payment — Simulate a successful payment (mock mode) */
async function fakePayment(req, res) {
  try {
    const { planCode } = req.body;
    if (!planCode) {
      return res.status(400).json({ message: 'Plan code is required.' });
    }

    const plan = await subscriptionService.getPlanByCode(planCode);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    const subscriptionId = await subscriptionService.createSubscription({
      userId: req.user.id,
      planId: plan.id,
      status: 'active',
      paymentProvider: 'demo',
      periodMonths: 1
    });

    await db.query(
      `INSERT INTO payment_history (user_id, subscription_id, amount, currency, status, payment_provider, description)
       VALUES (?, ?, ?, ?, 'completed', 'demo', ?)`,
      [req.user.id, subscriptionId, plan.price, plan.currency.toUpperCase(), `Demo payment: ${plan.name}`]
    );

    return res.json({
      message: 'Payment successful! Your subscription is now active.',
      subscriptionId
    });
  } catch (error) {
    console.error('[subscriptionController.fakePayment]', error.message);
    return res.status(500).json({ message: 'Could not process payment.' });
  }
}

/** POST /api/subscriptions/cancel — Cancel current subscription */
async function cancelMySubscription(req, res) {
  try {
    const result = await subscriptionService.cancelSubscription(req.user.id);
    if (!result) {
      return res.status(404).json({ message: 'No active subscription to cancel.' });
    }
    return res.json({ message: 'Subscription canceled.' });
  } catch (error) {
    console.error('[subscriptionController.cancelMySubscription]', error.message);
    return res.status(500).json({ message: 'Could not cancel subscription.' });
  }
}

/** GET /api/subscriptions/success — Handle successful checkout redirect */
async function checkoutSuccess(req, res) {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ message: 'Missing session ID.' });
    }

    // Verify the session with Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid') {
        return res.json({ message: 'Payment successful! Your subscription is active.', status: 'active' });
      }
      return res.json({ message: 'Payment is being processed.', status: session.payment_status });
    }

    return res.json({ message: 'Subscription activated.' });
  } catch (error) {
    console.error('[subscriptionController.checkoutSuccess]', error.message);
    return res.status(500).json({ message: 'Could not verify payment.' });
  }
}

/** POST /api/subscriptions/webhook — Stripe webhook handler */
async function stripeWebhook(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    if (!sig || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ message: 'Webhook not configured.' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    await subscriptionService.handleStripeWebhook(event);
    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return res.status(400).json({ message: 'Webhook error.' });
  }
}

// ── Admin endpoints ──────────────────────────────────────────────────────────

/** GET /api/admin/subscriptions — List all subscriptions (admin) */
async function adminGetAllSubscriptions(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await subscriptionService.getAllSubscriptions(page, limit);
    return res.json(result);
  } catch (error) {
    console.error('[subscriptionController.adminGetAllSubscriptions]', error.message);
    return res.status(500).json({ message: 'Could not load subscriptions.' });
  }
}

/** GET /api/admin/subscriptions/stats — Subscription statistics (admin) */
async function adminGetStats(req, res) {
  try {
    const stats = await subscriptionService.getSubscriptionStats();
    return res.json(stats);
  } catch (error) {
    console.error('[subscriptionController.adminGetStats]', error.message);
    return res.status(500).json({ message: 'Could not load stats.' });
  }
}

/** POST /api/admin/subscriptions/assign — Manually assign a plan to a user (admin) */
async function adminAssignPlan(req, res) {
  try {
    const { userId, planCode, status = 'active', paymentProvider = 'manual', periodMonths = 1 } = req.body;

    if (!userId || !planCode) {
      return res.status(400).json({ message: 'User ID and plan code are required.' });
    }

    const plan = await subscriptionService.getPlanByCode(planCode);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }

    const subscriptionId = await subscriptionService.createSubscription({
      userId,
      planId: plan.id,
      status,
      paymentProvider,
      periodMonths
    });

    return res.status(201).json({ message: 'Plan assigned.', subscriptionId });
  } catch (error) {
    console.error('[subscriptionController.adminAssignPlan]', error.message);
    return res.status(500).json({ message: 'Could not assign plan.' });
  }
}

/** POST /api/admin/subscriptions/:id/cancel — Cancel a subscription (admin) */
async function adminCancelSubscription(req, res) {
  try {
    await subscriptionService.expireSubscription(req.params.id);
    return res.json({ message: 'Subscription expired.' });
  } catch (error) {
    console.error('[subscriptionController.adminCancelSubscription]', error.message);
    return res.status(500).json({ message: 'Could not cancel subscription.' });
  }
}

/** PUT /api/admin/plans/:id — Update a subscription plan (admin) */
async function adminUpdatePlan(req, res) {
  try {
    const { name, description, price, is_active, is_public, features, max_courses, max_enrollments, max_parental_rules, stripe_price_id } = req.body;

    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push('name = ?'); params.push(name); }
    if (description !== undefined) { sets.push('description = ?'); params.push(description); }
    if (price !== undefined) { sets.push('price = ?'); params.push(price); }
    if (is_active !== undefined) { sets.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    if (is_public !== undefined) { sets.push('is_public = ?'); params.push(is_public ? 1 : 0); }
    if (features !== undefined) { sets.push('features = ?'); params.push(JSON.stringify(features)); }
    if (max_courses !== undefined) { sets.push('max_courses = ?'); params.push(max_courses); }
    if (max_enrollments !== undefined) { sets.push('max_enrollments = ?'); params.push(max_enrollments); }
    if (max_parental_rules !== undefined) { sets.push('max_parental_rules = ?'); params.push(max_parental_rules); }
    if (stripe_price_id !== undefined) { sets.push('stripe_price_id = ?'); params.push(stripe_price_id); }

    if (sets.length === 0) {
      return res.status(400).json({ message: 'No fields to update.' });
    }

    params.push(req.params.id);
    await db.query(`UPDATE subscription_plans SET ${sets.join(', ')} WHERE id = ?`, params);
    return res.json({ message: 'Plan updated.' });
  } catch (error) {
    console.error('[subscriptionController.adminUpdatePlan]', error.message);
    return res.status(500).json({ message: 'Could not update plan.' });
  }
}

module.exports = {
  getPlans,
  getMySubscription,
  createCheckoutSession,
  fakePayment,
  cancelMySubscription,
  checkoutSuccess,
  stripeWebhook,
  adminGetAllSubscriptions,
  adminGetStats,
  adminAssignPlan,
  adminCancelSubscription,
  adminUpdatePlan
};
