const subscriptionService = require('../services/subscriptionService');

/**
 * Premium Feature Middleware
 *
 * Checks whether the requesting user's subscription plan allows access
 * to a specific feature. If not, returns a 403 with an upgrade prompt.
 *
 * Usage:
 *   router.post('/courses', premiumFeature('unlimited_courses'), courseController.createCourse);
 *
 * The feature key must exist in the subscription_plans.features JSON.
 */

function premiumFeature(featureKey) {
  return async (req, res, next) => {
    try {
      const hasAccess = await subscriptionService.hasFeature(req.user.id, featureKey);
      if (hasAccess) return next();

      const plan = await subscriptionService.getUserPlan(req.user.id);
      const upgradePlanCode =
        plan.planCode === 'free' ? 'starter' :
        plan.planCode === 'starter' ? 'plus' :
        'teacher_pro';

      return res.status(403).json({
        message: 'This feature requires an upgraded subscription plan.',
        code: 'UPGRADE_REQUIRED',
        feature: featureKey,
        upgradePlan: upgradePlanCode,
        upgradeUrl: `/pricing?feature=${featureKey}`
      });
    } catch (error) {
      console.error('Premium middleware error:', error);
      return next(); // Fail open — allow access if check fails
    }
  };
}

/**
 * Limits middleware — checks usage caps like max courses or max enrollments.
 * Returns a 403 with upgrade info when the limit is reached.
 */
function limitCheck(checkFn, errorMessage, upgradePlanCode) {
  return async (req, res, next) => {
    try {
      const allowed = await checkFn(req.user.id);
      if (allowed) return next();

      return res.status(403).json({
        message: errorMessage || 'You have reached the limit for your current plan. Upgrade to continue.',
        code: 'LIMIT_REACHED',
        upgradePlan: upgradePlanCode || 'plus',
        upgradeUrl: '/pricing'
      });
    } catch (error) {
      console.error('Limit check middleware error:', error);
      return next();
    }
  };
}

module.exports = {
  premiumFeature,
  limitCheck
};
