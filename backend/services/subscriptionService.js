const db = require('../config/db');

/**
 * Subscription Service for UG Scholar
 *
 * Central logic for checking feature access, enforcing plan limits,
 * and managing user subscriptions.
 *
 * Feature keys stored in subscription_plans.features JSON column.
 * See migrations/008_subscriptions.sql for the default feature set.
 */

// ── Feature definitions (documentation) ──────────────────────────────────────
const FEATURES = {
  ADVANCED_ANALYTICS: 'advanced_analytics',
  CERTIFICATES: 'certificates',
  DATA_EXPORT: 'data_export',
  COURSE_REVIEWS: 'course_reviews',
  BULK_ENROLLMENT: 'bulk_enrollment',
  API_ACCESS: 'api_access',
  PRIORITY_SUPPORT: 'priority_support',
  WHITE_LABEL: 'white_label',
  CUSTOM_BRANDING: 'custom_branding',
  UNLIMITED_ENROLLMENTS: 'unlimited_enrollments',
  UNLIMITED_COURSES: 'unlimited_courses',
  EMAIL_REPORTS: 'email_reports'
};

// ── Public helpers ───────────────────────────────────────────────────────────

/** Get all active public plans, ordered by tier */
async function getPublicPlans() {
  return db.query(
    'SELECT * FROM subscription_plans WHERE is_active = 1 AND is_public = 1 ORDER BY sort_order ASC'
  );
}

/** Get all active plans (admin view) */
async function getAllPlans() {
  return db.query('SELECT * FROM subscription_plans ORDER BY sort_order ASC');
}

/** Get a single plan by its code (free | starter | plus | teacher_pro | institution) */
async function getPlanByCode(code) {
  const rows = await db.query('SELECT * FROM subscription_plans WHERE code = ?', [code]);
  return rows[0] || null;
}

/** Get a single plan by its id */
async function getPlanById(id) {
  const rows = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
  return rows[0] || null;
}

// ── User subscription helpers ────────────────────────────────────────────────

/** Get the current active subscription for a user */
async function getUserSubscription(userId) {
  const rows = await db.query(
    `SELECT us.*, sp.code AS plan_code, sp.name AS plan_name, sp.tier_level,
            sp.features, sp.max_courses, sp.max_enrollments, sp.max_parental_rules
     FROM user_subscriptions us
     JOIN subscription_plans sp ON sp.id = us.plan_id
     WHERE us.user_id = ? AND us.status IN ('active', 'trialing')
     ORDER BY us.created_at DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

/** Get the tier level for a user (0=free, 1=premium, 2=teacher_pro, 3=institution) */
async function getUserTier(userId) {
  const sub = await getUserSubscription(userId);
  if (sub) return sub.tier_level;
  return 0; // default free
}

/**
 * Get the effective plan limits for a user.
 * Returns a merged object of plan features + limits.
 * If a user has no active subscription, defaults to the 'free' plan.
 */
async function getUserPlan(userId) {
  const sub = await getUserSubscription(userId);
  if (sub) {
    return {
      planId: sub.plan_id,
      planCode: sub.plan_code,
      planName: sub.plan_name,
      tierLevel: sub.tier_level,
      features: typeof sub.features === 'string' ? JSON.parse(sub.features) : sub.features,
      maxCourses: sub.max_courses,
      maxEnrollments: sub.max_enrollments,
      maxParentalRules: sub.max_parental_rules,
      subscriptionId: sub.id,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      autoRenew: sub.auto_renew
    };
  }

  // Default to the free plan
  const freePlan = await getPlanByCode('free');
  if (freePlan) {
    return {
      planId: freePlan.id,
      planCode: 'free',
      planName: 'Free',
      tierLevel: 0,
      features: typeof freePlan.features === 'string' ? JSON.parse(freePlan.features) : freePlan.features,
      maxCourses: freePlan.max_courses,
      maxEnrollments: freePlan.max_enrollments,
      maxParentalRules: freePlan.max_parental_rules,
      subscriptionId: null,
      status: 'active',
      currentPeriodEnd: null,
      autoRenew: false
    };
  }

  // Hard-coded fallback if the plans table is empty
  return {
    planCode: 'free',
    planName: 'Free',
    tierLevel: 0,
    features: {
      advanced_analytics: false,
      certificates: false,
      data_export: false,
      course_reviews: false,
      bulk_enrollment: false,
      api_access: false,
      priority_support: false,
      white_label: false,
      custom_branding: false,
      unlimited_enrollments: false,
      unlimited_courses: false,
      email_reports: false
    },
    maxCourses: 3,
    maxEnrollments: 3,
    maxParentalRules: 2,
    subscriptionId: null,
    status: 'active',
    currentPeriodEnd: null,
    autoRenew: false
  };
}

// ── Feature access checks ────────────────────────────────────────────────────

/** Check if a user has access to a specific feature */
async function hasFeature(userId, featureKey) {
  const plan = await getUserPlan(userId);
  return plan.features[featureKey] === true;
}

/** Check if a user can enroll in more courses */
async function canEnrollInMore(userId) {
  const plan = await getUserPlan(userId);
  if (plan.maxEnrollments === -1) return true; // unlimited

  const count = await db.query(
    `SELECT COUNT(*) AS count FROM enrollments
     WHERE student_id = ? AND status IN ('active', 'completed')`,
    [userId]
  );
  return count[0].count < plan.maxEnrollments;
}

/** Check if a user can create more courses (teachers) */
async function canCreateMoreCourses(userId) {
  const plan = await getUserPlan(userId);
  if (plan.maxCourses === -1) return true; // unlimited

  const count = await db.query(
    'SELECT COUNT(*) AS count FROM courses WHERE teacher_id = ? AND status = ?',
    [userId, 'active']
  );
  return count[0].count < plan.maxCourses;
}

/** Check if a parent can create more rules for a child */
async function canCreateMoreParentalRules(parentId, childId) {
  const plan = await getUserPlan(parentId);
  if (plan.maxParentalRules === -1) return true; // unlimited

  const count = await db.query(
    'SELECT COUNT(*) AS count FROM parental_rules WHERE parent_id = ? AND child_id = ?',
    [parentId, childId]
  );
  return count[0].count < plan.maxParentalRules;
}

// ── Subscription lifecycle ───────────────────────────────────────────────────

/** Create a new subscription for a user (manual/admin mode) */
async function createSubscription({ userId, planId, status = 'active', paymentProvider = 'manual', periodMonths = 1 }) {
  const plan = await getPlanById(planId);
  if (!plan) throw new Error('Plan not found.');

  const now = new Date();
  const periodEnd = new Date(now);
  if (plan.interval === 'month') periodEnd.setMonth(periodEnd.getMonth() + periodMonths);
  else if (plan.interval === 'year') periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  // Deactivate any existing active subscriptions
  await db.query(
    "UPDATE user_subscriptions SET status = 'expired' WHERE user_id = ? AND status IN ('active', 'trialing')",
    [userId]
  );

  const result = await db.query(
    `INSERT INTO user_subscriptions
     (user_id, plan_id, status, current_period_start, current_period_end, payment_provider, auto_renew)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, planId, status, now.toISOString().slice(0, 19).replace('T', ' '),
     periodEnd.toISOString().slice(0, 19).replace('T', ' '), paymentProvider, periodMonths > 1 ? 1 : 1]
  );

  return result.insertId;
}

/** Cancel a user's subscription */
async function cancelSubscription(userId) {
  const sub = await getUserSubscription(userId);
  if (!sub) return false;

  await db.query(
    `UPDATE user_subscriptions
     SET status = 'canceled', canceled_at = NOW(), auto_renew = 0
     WHERE id = ?`,
    [sub.subscriptionId || sub.id]
  );
  return true;
}

/** Expire an overdue subscription (called by a cron job or webhook) */
async function expireSubscription(subscriptionId) {
  await db.query(
    "UPDATE user_subscriptions SET status = 'expired' WHERE id = ?",
    [subscriptionId]
  );
}

/** Renew a subscription (extend the period) */
async function renewSubscription(subscriptionId, periodMonths = 1) {
  const subscriptions = await db.query('SELECT * FROM user_subscriptions WHERE id = ?', [subscriptionId]);
  if (subscriptions.length === 0) return false;

  const sub = subscriptions[0];
  const now = new Date();
  const currentEnd = sub.current_period_end ? new Date(sub.current_period_end) : now;
  const newEnd = new Date(Math.max(now.getTime(), currentEnd.getTime()));
  newEnd.setMonth(newEnd.getMonth() + periodMonths);

  await db.query(
    `UPDATE user_subscriptions
     SET status = 'active', current_period_end = ?, auto_renew = 1
     WHERE id = ?`,
    [newEnd.toISOString().slice(0, 19).replace('T', ' '), subscriptionId]
  );
  return true;
}

// ── Admin helpers ────────────────────────────────────────────────────────────

/** Get all subscriptions with user info (admin view) */
async function getAllSubscriptions(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const total = await db.query('SELECT COUNT(*) AS count FROM user_subscriptions');
  const rows = await db.query(
    `SELECT us.*, u.full_name AS user_name, u.email AS user_email, sp.name AS plan_name, sp.code AS plan_code
     FROM user_subscriptions us
     JOIN users u ON u.id = us.user_id
     JOIN subscription_plans sp ON sp.id = us.plan_id
     ORDER BY us.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { data: rows, total: total[0].count, page, limit };
}

/** Get subscription statistics for admin dashboard */
async function getSubscriptionStats() {
  const totalRevenue = await db.query(
    "SELECT COALESCE(SUM(amount), 0) AS total FROM payment_history WHERE status = 'completed'"
  );
  const activeSubscriptions = await db.query(
    "SELECT COUNT(*) AS count FROM user_subscriptions WHERE status IN ('active', 'trialing')"
  );
  const byPlan = await db.query(
    `SELECT sp.code, sp.name, COUNT(us.id) AS count
     FROM subscription_plans sp
     LEFT JOIN user_subscriptions us ON us.plan_id = sp.id AND us.status IN ('active', 'trialing')
     GROUP BY sp.id ORDER BY sp.sort_order`
  );

  return {
    totalRevenue: totalRevenue[0].total,
    activeSubscriptions: activeSubscriptions[0].count,
    byPlan
  };
}

// ── Stripe integration helpers ──────────────────────────────────────────────

/**
 * Create or retrieve a Stripe Checkout Session for a plan upgrade.
 * Requires that STRIPE_SECRET_KEY be set in the environment.
 */
async function createStripeCheckoutSession({ userId, userEmail, planCode, successUrl, cancelUrl }) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const plan = await getPlanByCode(planCode);
  if (!plan || !plan.stripe_price_id) {
    throw new Error(`Plan "${planCode}" has no Stripe price ID configured.`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: userEmail,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    metadata: { userId: String(userId), planCode },
    success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pricing`
  });

  return { url: session.url, sessionId: session.id };
}

/**
 * Handle a Stripe webhook event.
 * Supports: checkout.session.completed, invoice.paid, customer.subscription.updated
 */
async function handleStripeWebhook(event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = parseInt(session.metadata.userId, 10);
      const planCode = session.metadata.planCode;
      const plan = await getPlanByCode(planCode);
      if (!plan || !userId) break;

      // Deactivate old subscriptions
      await db.query(
        "UPDATE user_subscriptions SET status = 'expired' WHERE user_id = ? AND status IN ('active', 'trialing')",
        [userId]
      );

      const periodStart = new Date(session.created * 1000).toISOString().slice(0, 19).replace('T', ' ');
      const periodEnd = new Date((session.created + (plan.interval === 'year' ? 31536000 : 2592000)) * 1000)
        .toISOString().slice(0, 19).replace('T', ' ');

      await db.query(
        `INSERT INTO user_subscriptions
         (user_id, plan_id, stripe_subscription_id, stripe_customer_id, status,
          current_period_start, current_period_end, payment_provider, auto_renew)
         VALUES (?, ?, ?, ?, 'active', ?, ?, 'stripe', 1)`,
        [userId, plan.id, session.subscription, session.customer, periodStart, periodEnd]
      );

      await db.query(
        `INSERT INTO payment_history
         (user_id, amount, currency, status, payment_provider, provider_payment_id, description)
         VALUES (?, ?, ?, 'completed', 'stripe', ?, ?)`,
        [userId, plan.price, plan.currency.toUpperCase(), session.payment_intent, `Subscription: ${plan.name}`]
      );
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      if (!subscriptionId) break;

      const subs = await db.query(
        'SELECT * FROM user_subscriptions WHERE stripe_subscription_id = ?',
        [subscriptionId]
      );
      if (subs.length > 0) {
        await renewSubscription(subs[0].id, 1);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      if (sub.status === 'canceled' || sub.status === 'past_due') {
        await db.query(
          "UPDATE user_subscriptions SET status = ? WHERE stripe_subscription_id = ?",
          [sub.status === 'past_due' ? 'past_due' : 'canceled', sub.id]
        );
      }
      break;
    }
  }
}

module.exports = {
  FEATURES,
  getPublicPlans,
  getAllPlans,
  getPlanByCode,
  getPlanById,
  getUserSubscription,
  getUserTier,
  getUserPlan,
  hasFeature,
  canEnrollInMore,
  canCreateMoreCourses,
  canCreateMoreParentalRules,
  createSubscription,
  cancelSubscription,
  expireSubscription,
  renewSubscription,
  getAllSubscriptions,
  getSubscriptionStats,
  createStripeCheckoutSession,
  handleStripeWebhook
};
