const db = require('../config/db');

const sessionStore = {
  async get(phoneNumber) {
    let user = await db.query('SELECT * FROM users WHERE phone_number = ?', [phoneNumber]);
    let userId;

    if (user.length === 0) {
      const result = await db.query(
        'INSERT INTO users (phone_number) VALUES (?)',
        [phoneNumber]
      );
      userId = result.insertId;
      user = [{ id: userId, phone_number: phoneNumber, language_code: 'en', points: 0, streak: 0, lessons_completed: 0, pin_attempts: 0 }];
    } else {
      userId = user[0].id;
    }

    let sessions = await db.query(
      'SELECT * FROM sessions WHERE phone_number = ? ORDER BY updated_at DESC LIMIT 1',
      [phoneNumber]
    );

    let state = 'welcome';
    let sessionData = {};

    if (sessions.length > 0) {
      state = sessions[0].state;
      try {
        sessionData = sessions[0].session_data ? JSON.parse(sessions[0].session_data) : {};
      } catch {
        sessionData = {};
      }
    }

    const u = user[0];

    return {
      id: u.id,
      userId: u.id,
      phoneNumber: u.phone_number,
      pin: u.pin,
      parentPin: u.parent_pin,
      ageVerified: !!u.age_verified,
      age: u.age_group,
      tier: u.tier,
      language: u.language_code,
      points: u.points,
      streak: u.streak,
      lessonsCompleted: u.lessons_completed,
      pinAttempts: u.pin_attempts,
      lockedUntil: u.locked_until,
      state,
      ...sessionData,
      _sessionId: sessions.length > 0 ? sessions[0].id : null,
    };
  },

  async update(phoneNumber, data) {
    const userFields = {};
    const sessionFields = {};
    const sessionDataFields = {};

    const fieldMap = {
      pin: { table: 'user', field: 'pin' },
      parentPin: { table: 'user', field: 'parent_pin' },
      ageVerified: { table: 'user', field: 'age_verified' },
      age: { table: 'user', field: 'age_group' },
      tier: { table: 'user', field: 'tier' },
      language: { table: 'user', field: 'language_code' },
      points: { table: 'user', field: 'points' },
      streak: { table: 'user', field: 'streak' },
      lessonsCompleted: { table: 'user', field: 'lessons_completed' },
      pinAttempts: { table: 'user', field: 'pin_attempts' },
      lockedUntil: { table: 'user', field: 'locked_until' },
      state: { table: 'session', field: 'state' },
    };

    for (const [key, value] of Object.entries(data)) {
      const mapping = fieldMap[key];
      if (mapping) {
        if (mapping.table === 'user') {
          if (mapping.field === 'age_verified') {
            userFields[mapping.field] = value ? 1 : 0;
          } else {
            userFields[mapping.field] = value;
          }
        } else if (mapping.table === 'session') {
          sessionFields[mapping.field] = value;
        }
      } else {
        sessionDataFields[key] = value;
      }
    }

    if (Object.keys(userFields).length > 0) {
      const sets = Object.entries(userFields).map(([k]) => `${k} = ?`).join(', ');
      const vals = Object.values(userFields);
      vals.push(phoneNumber);
      await db.query(`UPDATE users SET ${sets}, last_activity_at = NOW() WHERE phone_number = ?`, vals);
    }

    const existing = await db.query(
      'SELECT id FROM sessions WHERE phone_number = ? ORDER BY updated_at DESC LIMIT 1',
      [phoneNumber]
    );

    if (existing.length > 0) {
      if (Object.keys(sessionFields).length > 0 || Object.keys(sessionDataFields).length > 0) {
        let currentData = {};
        try {
          currentData = existing[0].session_data ? JSON.parse(existing[0].session_data) : {};
        } catch {
          currentData = {};
        }
        const merged = { ...currentData, ...sessionDataFields };
        const updatedSession = { ...sessionFields, session_data: JSON.stringify(merged) };
        const sets = Object.entries(updatedSession).map(([k]) => `${k} = ?`).join(', ');
        const vals = Object.values(updatedSession);
        vals.push(phoneNumber);
        await db.query(`UPDATE sessions SET ${sets} WHERE phone_number = ? ORDER BY updated_at DESC LIMIT 1`, vals);
      }
    } else if (Object.keys(sessionFields).length > 0 || Object.keys(sessionDataFields).length > 0) {
      const merged = { ...sessionDataFields };
      const state = sessionFields.state || 'welcome';
      const sessionData = JSON.stringify(merged);
      await db.query(
        'INSERT INTO sessions (phone_number, state, session_data) VALUES (?, ?, ?)',
        [phoneNumber, state, sessionData]
      );
    }
  },

  async reset(phoneNumber) {
    await db.query('DELETE FROM sessions WHERE phone_number = ?', [phoneNumber]);
  },
};

module.exports = sessionStore;
