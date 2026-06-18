const db = require('../config/db');

const ACTIVITY_IDS = {
  LESSON: 1,
  ASSIGNMENT: 2,
  QUIZ: 3,
  GENERAL: 4
};

function getCurrentDayTime() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;
  return { dayOfWeek, currentTime };
}

function timeToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

async function checkAccess({ childId, activity }) {
  try {
    const rules = await db.query(
      `SELECT pr.* FROM parental_rules pr
       JOIN parent_children pc ON pc.parent_id = pr.parent_id AND pc.child_id = pr.child_id
       WHERE pr.child_id = ? AND pr.enabled = 1
       ORDER BY pr.action DESC, pr.id ASC`,
      [childId]
    );

    if (rules.length === 0) {
      return { allowed: true, source: 'rule', reason: 'no_rules' };
    }

    const { dayOfWeek, currentTime } = getCurrentDayTime();
    const currentMinutes = timeToMinutes(currentTime);

    for (const rule of rules) {
      if (rule.activity && rule.activity !== activity) continue;
      if (rule.day_of_week !== null && rule.day_of_week !== dayOfWeek) continue;

      if (rule.max_daily_minutes !== null) {
        const today = new Date().toISOString().slice(0, 10);
        const usage = await db.query(
          'SELECT COALESCE(SUM(minutes_used), 0) AS total FROM daily_usage WHERE child_id = ? AND activity = ? AND usage_date = ?',
          [childId, activity, today]
        );
        if (usage[0].total >= rule.max_daily_minutes) {
          return { allowed: false, source: 'rule', ruleId: rule.id, reason: 'daily_limit' };
        }
      }

      if (rule.start_time && rule.end_time) {
        const startMinutes = timeToMinutes(rule.start_time);
        const endMinutes = timeToMinutes(rule.end_time);

        if (startMinutes <= endMinutes) {
          if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            if (rule.action === 'block') {
              return { allowed: false, source: 'rule', ruleId: rule.id, reason: 'time_block' };
            }
            return { allowed: true, source: 'rule', ruleId: rule.id, reason: 'time_allow' };
          }
        } else {
          if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
            if (rule.action === 'block') {
              return { allowed: false, source: 'rule', ruleId: rule.id, reason: 'time_block' };
            }
            return { allowed: true, source: 'rule', ruleId: rule.id, reason: 'time_allow' };
          }
        }
      }
    }

    return { allowed: true, source: 'rule', reason: 'no_match' };
  } catch (error) {
    console.error('Parental control check error:', error);
    return { allowed: true, source: 'error', reason: 'check_failed' };
  }
}

async function logActivity(userId, activity, allowed) {
  await db.query(
    'INSERT INTO allow2_activity_log (user_id, activity, allowed) VALUES (?, ?, ?)',
    [userId, activity, allowed ? 1 : 0]
  );

  if (allowed) {
    const today = new Date().toISOString().slice(0, 10);
    await db.query(
      `INSERT INTO daily_usage (child_id, activity, usage_date, minutes_used)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE minutes_used = minutes_used + VALUES(minutes_used)`,
      [userId, activity, today, 5]
    );
  }
}

async function getDailyUsage(childId) {
  const rows = await db.query(
    `SELECT activity, usage_date, minutes_used FROM daily_usage
     WHERE child_id = ? ORDER BY usage_date DESC, activity ASC`,
    [childId]
  );
  return rows;
}

async function getRules(childId) {
  const rows = await db.query(
    `SELECT pr.*, u.full_name AS child_name
     FROM parental_rules pr
     JOIN users u ON u.id = pr.child_id
     WHERE pr.child_id = ?
     ORDER BY pr.created_at DESC`,
    [childId]
  );
  return rows;
}

async function createRule({ parent_id, child_id, day_of_week, start_time, end_time, max_daily_minutes, activity, action }) {
  const result = await db.query(
    `INSERT INTO parental_rules (parent_id, child_id, day_of_week, start_time, end_time, max_daily_minutes, activity, action)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [parent_id, child_id, day_of_week ?? null, start_time || null, end_time || null, max_daily_minutes != null ? max_daily_minutes : null, activity || null, action || 'block']
  );
  return result.insertId;
}

async function updateRule(ruleId, fields) {
  const allowed = ['day_of_week', 'start_time', 'end_time', 'max_daily_minutes', 'activity', 'action', 'enabled'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(fields[key] === '' || fields[key] === null ? null : fields[key]);
    }
  }
  if (sets.length === 0) return;
  params.push(ruleId);
  await db.query(`UPDATE parental_rules SET ${sets.join(', ')} WHERE id = ?`, params);
}

async function deleteRule(ruleId) {
  await db.query('DELETE FROM parental_rules WHERE id = ?', [ruleId]);
}

module.exports = {
  checkAccess,
  logActivity,
  getDailyUsage,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  ACTIVITY_IDS
};
