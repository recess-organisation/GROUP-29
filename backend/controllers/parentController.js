const db = require('../config/db');
const parentalControlService = require('../services/parentalControlService');
const subscriptionService = require('../services/subscriptionService');

async function getDashboard(req, res) {
  try {
    const children = await db.query(
      `SELECT u.id, u.full_name, u.email, u.status
       FROM parent_children pc
       JOIN users u ON u.id = pc.child_id
       WHERE pc.parent_id = ?`,
      [req.user.id]
    );

    for (const child of children) {
      const ruleCount = await db.query(
        'SELECT COUNT(*) AS count FROM parental_rules WHERE child_id = ?',
        [child.id]
      );
      child.rule_count = ruleCount[0].count;

      const today = new Date().toISOString().slice(0, 10);
      const todayUsage = await db.query(
        'SELECT COALESCE(SUM(minutes_used), 0) AS total FROM daily_usage WHERE child_id = ? AND usage_date = ?',
        [child.id, today]
      );
      child.today_minutes = todayUsage[0].total;
    }

    return res.json({ children });
  } catch (error) {
    console.error('[parentController.getDashboard]', error.message);
    return res.status(500).json({ message: 'Could not load dashboard.' });
  }
}

async function linkChild(req, res) {
  try {
    const { childEmail } = req.body;
    if (!childEmail) {
      return res.status(400).json({ message: 'Child email is required.' });
    }

    const children = await db.query(
      'SELECT id, full_name, email, role FROM users WHERE email = ? AND role = ?',
      [childEmail, 'student']
    );

    if (children.length === 0) {
      return res.status(404).json({ message: 'No student found with that email.' });
    }

    const child = children[0];

    const existing = await db.query(
      'SELECT id FROM parent_children WHERE parent_id = ? AND child_id = ?',
      [req.user.id, child.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'This child is already linked to your account.' });
    }

    await db.query(
      'INSERT INTO parent_children (parent_id, child_id) VALUES (?, ?)',
      [req.user.id, child.id]
    );

    return res.status(201).json({ message: 'Child linked successfully.', child });
  } catch (error) {
    console.error('[parentController.linkChild]', error.message);
    return res.status(500).json({ message: 'Could not link child.' });
  }
}

async function unlinkChild(req, res) {
  try {
    const { childId } = req.params;

    await db.query(
      'DELETE FROM parent_children WHERE parent_id = ? AND child_id = ?',
      [req.user.id, childId]
    );

    return res.json({ message: 'Child unlinked successfully.' });
  } catch (error) {
    console.error('[parentController.unlinkChild]', error.message);
    return res.status(500).json({ message: 'Could not unlink child.' });
  }
}

async function getRules(req, res) {
  try {
    const { childId } = req.params;

    const parentCheck = await db.query(
      'SELECT id FROM parent_children WHERE parent_id = ? AND child_id = ?',
      [req.user.id, childId]
    );
    if (parentCheck.length === 0) {
      return res.status(403).json({ message: 'You can only view rules for your own children.' });
    }

    const rules = await parentalControlService.getRules(childId);
    return res.json(rules);
  } catch (error) {
    console.error('[parentController.getRules]', error.message);
    return res.status(500).json({ message: 'Could not load rules.' });
  }
}

async function createRule(req, res) {
  try {
    const { child_id, day_of_week, start_time, end_time, max_daily_minutes, activity, action } = req.body;

    const parentCheck = await db.query(
      'SELECT id FROM parent_children WHERE parent_id = ? AND child_id = ?',
      [req.user.id, child_id]
    );
    if (parentCheck.length === 0) {
      return res.status(403).json({ message: 'You can only create rules for your own children.' });
    }

    // Premium check: free parents are limited in how many rules they can create per child
    const canCreate = await subscriptionService.canCreateMoreParentalRules(req.user.id, child_id);
    if (!canCreate) {
      return res.status(403).json({
        message: 'Free plan limited to 2 parental rules per child. Upgrade to Plus for unlimited rules.',
        code: 'LIMIT_REACHED',
        upgradePlan: 'plus'
      });
    }

    const id = await parentalControlService.createRule({
      parent_id: req.user.id,
      child_id,
      day_of_week,
      start_time,
      end_time,
      max_daily_minutes,
      activity,
      action
    });

    return res.status(201).json({ message: 'Rule created.', ruleId: id });
  } catch (error) {
    console.error('[parentController.createRule]', error.message);
    return res.status(500).json({ message: 'Could not create rule.' });
  }
}

async function updateRule(req, res) {
  try {
    const { id } = req.params;
    const rule = await db.query(
      `SELECT pr.* FROM parental_rules pr
       JOIN parent_children pc ON pc.parent_id = pr.parent_id AND pc.child_id = pr.child_id
       WHERE pr.id = ? AND pc.parent_id = ?`,
      [id, req.user.id]
    );
    if (rule.length === 0) {
      return res.status(404).json({ message: 'Rule not found.' });
    }

    await parentalControlService.updateRule(id, req.body);
    return res.json({ message: 'Rule updated.' });
  } catch (error) {
    console.error('[parentController.updateRule]', error.message);
    return res.status(500).json({ message: 'Could not update rule.' });
  }
}

async function deleteRule(req, res) {
  try {
    const { id } = req.params;
    const rule = await db.query(
      `SELECT pr.* FROM parental_rules pr
       JOIN parent_children pc ON pc.parent_id = pr.parent_id AND pc.child_id = pr.child_id
       WHERE pr.id = ? AND pc.parent_id = ?`,
      [id, req.user.id]
    );
    if (rule.length === 0) {
      return res.status(404).json({ message: 'Rule not found.' });
    }

    await parentalControlService.deleteRule(id);
    return res.json({ message: 'Rule deleted.' });
  } catch (error) {
    console.error('[parentController.deleteRule]', error.message);
    return res.status(500).json({ message: 'Could not delete rule.' });
  }
}

async function getDailyUsage(req, res) {
  try {
    const { childId } = req.params;
    const parentCheck = await db.query(
      'SELECT id FROM parent_children WHERE parent_id = ? AND child_id = ?',
      [req.user.id, childId]
    );
    if (parentCheck.length === 0) {
      return res.status(403).json({ message: 'You can only view usage for your own children.' });
    }

    const usage = await parentalControlService.getDailyUsage(childId);
    return res.json(usage);
  } catch (error) {
    console.error('[parentController.getDailyUsage]', error.message);
    return res.status(500).json({ message: 'Could not load usage.' });
  }
}

async function getChildActivityLog(req, res) {
  try {
    const { childId } = req.params;

    const parentCheck = await db.query(
      'SELECT id FROM parent_children WHERE parent_id = ? AND child_id = ?',
      [req.user.id, childId]
    );
    if (parentCheck.length === 0) {
      return res.status(403).json({ message: 'You can only view activity for your own children.' });
    }

    const logs = await db.query(
      `SELECT al.activity, al.allowed, al.checked_at
       FROM allow2_activity_log al
       WHERE al.user_id = ?
       ORDER BY al.checked_at DESC
       LIMIT 50`,
      [childId]
    );

    return res.json(logs);
  } catch (error) {
    console.error('[parentController.getChildActivityLog]', error.message);
    return res.status(500).json({ message: 'Could not load activity log.' });
  }
}

module.exports = {
  getDashboard,
  linkChild,
  unlinkChild,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  getDailyUsage,
  getChildActivityLog
};
