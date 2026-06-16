const db = require('../config/db');
const atService = require('./africasTalking');

const BADGE_DEFINITIONS = {
  first_lesson: { name: 'First Lesson', icon: '🌟', description: 'Completed your first lesson' },
  streak_3: { name: '3-Day Streak', icon: '🔥', description: '3 days in a row' },
  streak_7: { name: 'Week Warrior', icon: '⚡', description: '7-day streak' },
  streak_30: { name: 'Monthly Master', icon: '💎', description: '30-day streak' },
  top_performer: { name: 'Top Performer', icon: '🏆', description: 'Scored 100% on diagnostic' },
  all_subjects: { name: 'Scholar', icon: '📚', description: 'Tried all subjects' },
  quick_learner: { name: 'Quick Learner', icon: '🧠', description: 'Completed 5 lessons in a day' },
};

const AIRTIME_THRESHOLDS = [
  { points: 500, amount: 2000, label: '2,000 UGX' },
  { points: 1000, amount: 5000, label: '5,000 UGX' },
  { points: 2500, amount: 10000, label: '10,000 UGX' },
  { points: 5000, amount: 25000, label: '25,000 UGX' },
];

class GamificationService {
  async checkAndAwardBadges(userId, phoneNumber) {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user.length) return [];

    const u = user[0];
    const awarded = [];

    const badgeChecks = [
      { key: 'first_lesson', condition: u.lessons_completed >= 1 },
      { key: 'streak_3', condition: u.streak >= 3 },
      { key: 'streak_7', condition: u.streak >= 7 },
      { key: 'streak_30', condition: u.streak >= 30 },
    ];

    for (const check of badgeChecks) {
      if (check.condition) {
        const badge = await this.awardBadge(userId, check.key);
        if (badge) awarded.push(BADGE_DEFINITIONS[check.key]);
      }
    }

    if (awarded.length > 0) {
      const names = awarded.map(b => `${b.icon} ${b.name}`).join(', ');
      await atService.sendSMS(
        phoneNumber,
        `Congratulations! You earned: ${names}. Keep learning!`
      );
    }

    return awarded;
  }

  async awardBadge(userId, badgeKey) {
    try {
      await db.query(
        'INSERT IGNORE INTO badges (user_id, badge_key) VALUES (?, ?)',
        [userId, badgeKey]
      );
      return true;
    } catch {
      return false;
    }
  }

  async checkAirtimeReward(userId, phoneNumber) {
    const user = await db.query('SELECT points, lessons_completed FROM users WHERE id = ?', [userId]);
    if (!user.length) return null;

    const { points } = user[0];

    const alreadyRewarded = await db.query(
      'SELECT MAX(amount) as max_amount FROM airtime_rewards WHERE user_id = ? AND status = ?',
      [userId, 'sent']
    );
    const highestReward = alreadyRewarded[0]?.max_amount || 0;

    for (const threshold of AIRTIME_THRESHOLDS) {
      if (points >= threshold.points && threshold.amount > highestReward) {
        const result = await atService.sendAirtime(phoneNumber, threshold.amount);

        await db.query(
          'INSERT INTO airtime_rewards (user_id, amount, reason, status) VALUES (?, ?, ?, ?)',
          [userId, threshold.amount, `Reached ${threshold.points} points`, result.success ? 'sent' : 'failed']
        );

        if (result.success) {
          await atService.sendSMS(
            phoneNumber,
            `UGScholar: You've earned ${threshold.label} airtime! Check your phone.`
          );
        }

        return { threshold, success: result.success };
      }
    }

    return null;
  }

  async getLeaderboard(limit = 10) {
    const lmt = parseInt(limit) || 10;
    const pool = require('../config/db').pool;
    const [rows] = await pool.query(
      'SELECT phone_number, points, streak, lessons_completed FROM users WHERE points > 0 ORDER BY points DESC LIMIT ?',
      [lmt]
    );
    return rows;
  }

  async getUserStats(userId) {
    const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user.length) return null;

    const badges = await db.query('SELECT badge_key FROM badges WHERE user_id = ?', [userId]);
    const diagnostics = await db.query(
      'SELECT * FROM diagnostic_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId]
    );

    return {
      ...user[0],
      badges: badges.map(b => ({ ...BADGE_DEFINITIONS[b.badge_key], key: b.badge_key })),
      diagnostics,
    };
  }

  getBadgeDefinitions() {
    return BADGE_DEFINITIONS;
  }

  getAirtimeThresholds() {
    return AIRTIME_THRESHOLDS;
  }
}

module.exports = new GamificationService();
