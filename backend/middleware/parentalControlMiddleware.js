const db = require('../config/db');
const parentalControlService = require('../services/parentalControlService');

function checkParentalControl(activity = 'GENERAL') {
  return async (req, res, next) => {
    if (req.user.role !== 'student') {
      return next();
    }

    try {
      const parents = await db.query(
        `SELECT pc.parent_id FROM parent_children pc
         WHERE pc.child_id = ?`,
        [req.user.id]
      );

      if (parents.length === 0) {
        return next();
      }

      const result = await parentalControlService.checkAccess({
        childId: req.user.id,
        activity
      });

      await parentalControlService.logActivity(req.user.id, activity, result.allowed);

      if (!result.allowed) {
        const messages = {
          time_block: 'Access restricted. Parental time window blocks this activity.',
          daily_limit: 'Access restricted. Daily usage limit has been reached.',
          rule_block: 'Access restricted by parental control rules.'
        };
        return res.status(403).json({
          message: messages[result.reason] || 'Access restricted by parental controls.',
          reason: result.reason
        });
      }

      return next();
    } catch (error) {
      console.error('Parental control middleware error:', error);
      return next();
    }
  };
}

module.exports = checkParentalControl;
