const db = require('../config/db');

const TIERS = {
  primary: { minAge: 6, maxAge: 13, subjects: ['math', 'english', 'science', 'social_studies'] },
  olevel: { minAge: 14, maxAge: 18, subjects: ['math', 'english', 'biology', 'chemistry', 'physics', 'history', 'geography'] },
  alevel: { minAge: 17, maxAge: 21, subjects: ['math', 'english_lit', 'biology', 'chemistry', 'physics', 'economics', 'history'] },
  adult: { minAge: 18, maxAge: null, subjects: ['literacy', 'numeracy', 'life_skills'] },
};

const LANGUAGES = { 1: 'lug', 2: 'nyn', 3: 'ach', 4: 'tes', 5: 'en' };
const LANG_MAP = { lug: 'Luganda', nyn: 'Runyankole', ach: 'Acholi', tes: 'Ateso', en: 'English' };

const DIAGNOSTIC_QUESTIONS = {
  primary: [
    { q: 'What is 5 + 3?', options: ['6', '7', '8', '9'], answer: 2 },
    { q: 'What is the capital of Uganda?', options: ['Jinja', 'Kampala', 'Entebbe', 'Gulu'], answer: 1 },
    { q: 'Which gas do plants use?', options: ['Oxygen', 'CO2', 'Nitrogen', 'Hydrogen'], answer: 1 },
  ],
  olevel: [
    { q: 'Solve: 2x + 5 = 15', options: ['x=3', 'x=5', 'x=7', 'x=10'], answer: 1 },
    { q: 'Which organ pumps blood?', options: ['Liver', 'Lungs', 'Heart', 'Kidney'], answer: 2 },
    { q: 'Who wrote "Animal Farm"?', options: ['Orwell', 'Shakespeare', 'Chinua', 'Ngugi'], answer: 0 },
  ],
  alevel: [
    { q: 'What is the derivative of x²?', options: ['x', '2x', '2', 'x²'], answer: 1 },
    { q: 'What is the pH of pure water?', options: ['5', '7', '9', '12'], answer: 1 },
    { q: 'Which is a renewable resource?', options: ['Oil', 'Coal', 'Solar', 'Gas'], answer: 2 },
  ],
  adult: [
    { q: 'What is 10 × 5?', options: ['15', '25', '50', '100'], answer: 2 },
    { q: 'How many days in a week?', options: ['5', '6', '7', '10'], answer: 2 },
    { q: 'What saves money in a bank?', options: ['Spending', 'Saving', 'Borrowing', 'Lending'], answer: 1 },
  ],
};

function getTranslation(key, lang) {
  const t = {
    welcome: { en: 'Welcome to UGScholar', lug: 'Olyoke ku UGScholar', nyn: 'Oraareire UGScholar', ach: 'Iyom UGScholar', tes: 'Eyamai UGScholar' },
    login_option: { en: '1. Login\n2. Learn More', lug: '1. Yingira\n2. Manya Ebisinga', nyn: '1. Yingira\n2. Ijuka Ebingi', ach: '1. Donyo\n2. Nong Pire', tes: '1. Losio\n2. Ijaun' },
    enter_pin: { en: 'Enter your PIN:', lug: 'Yingiza PIN yo:', nyn: 'Yingiza PIN yawe:', ach: 'Ket PIN meri:', tes: 'Losio PIN noi:' },
    age_confirm: { en: 'Please confirm your age\n1. Under 18\n2. 18 or above', lug: 'Kakasa emyaka gyo\n1. Wansi wa 18\n2. 18 oba waggulu', nyn: 'Kakasa emyaka yawe\n1. Hasi ya 18\n2. 18 nari haiguru', ach: 'Gam ikareni\n1. Ikwap 18\n2. 18 onyo malo', tes: 'Tomat ikarai\n1. Ikwap 18\n2. 18 ka mameja' },
    parent_pin: { en: 'Enter parent/guardian PIN:', lug: 'Yingiza PIN y\'omuzadde:', nyn: 'Yingiza PIN ya muhangi:', ach: 'Ket PIN pa tic:', tes: 'Losio PIN papa noi:' },
    language_select: { en: 'Select language\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English', lug: 'Londa olulimi\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English', nyn: 'Joba orurimi\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English', ach: 'Yer leb\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English', tes: 'Jer ejaun\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English' },
    main_menu: { en: '1. Take Diagnostic\n2. Lessons\n3. My Progress\n4. Leaderboard\n5. Change Language', lug: '1. Okola Diagnostic\n2. Lessons\n3. Ensonga Yange\n4. Leaderboard\n5. Kyusa Olulimi', nyn: '1. Kora Diagnostic\n2. Lessons\n3. Ebyange\n4. Leaderboard\n5. Hindura Orurimi', ach: '1. Tim Diagnostic\n2. Lessons\n3. Lwena\n4. Leaderboard\n5. Lok Leb' },
    answer: { en: 'Answer {n}:', lug: 'Ddamu {n}:', nyn: 'Asubize {n}:', ach: 'Dok {n}:', tes: 'Dwok {n}:' },
    diag_intro: { en: 'Diagnostic quiz ({n} questions)\nTap 0 to skip.', lug: 'Okebeleza ({n} ebibuuzo)\nNyiga 0 okuleka.', nyn: 'Okebeleza ({n} ebibuuzo)\nKanda 0 kureka.', ach: 'Kwayo ({n} penjo)\nDiy 0 me weko.', tes: 'Aijakin ({n} ipenjo)\nDol 0 boikina.' },
    diag_result: { en: 'You scored {s}/{t}\nGap detected: {g}', lug: 'Ofunye {s}/{t}\nEnsobi: {g}', nyn: 'Otsire {s}/{t}\nEnsobi: {g}', ach: 'Inongo {s}/{t}\nGap: {g}', tes: 'Ejojong {s}/{t}\nGap: {g}' },
    diag_pass: { en: 'Great work! Keep learning.', lug: 'Omulimu mulungi! Weyongere.', nyn: 'Mukuru! Ijuka ebingi.', ach: 'Tijja ber! Mede kwano.', tes: 'Eyai! Ijaun.' },
    diag_fail: { en: 'Keep practicing to improve.', lug: 'Weekenneenye okwongera obukugu.', nyn: 'Iteeraho okuhara.', ach: 'Mede kwano me dongo.', tes: 'Ijaun ikwuak tomiro.' },
    lesson_intro: { en: 'Lesson {n}: {t}\n{txt}', lug: 'Lesson {n}: {t}\n{txt}', nyn: 'Lesson {n}: {t}\n{txt}', ach: 'Lesson {n}: {t}\n{txt}', tes: 'Lesson {n}: {t}\n{txt}' },
    lesson_complete: { en: 'Lesson complete! +10 pts', lug: 'Lesson y\'okola! +10 pts', nyn: 'Lesson y\'okola! +10 pts', ach: 'Lesson otimo! +10 pts', tes: 'Lesson aijakin! +10 pts' },
    progress: { en: 'Points: {p}\nStreak: {s} days\nBadges: {b}\nLessons: {l}', lug: 'Points: {p}\nStreak: {s} nnaku\nBadges: {b}\nLessons: {l}', nyn: 'Points: {p}\nStreak: {s} naku\nBadges: {b}\nLessons: {l}', ach: 'Points: {p}\nStreak: {s} nino\nBadges: {b}\nLessons: {l}', tes: 'Points: {p}\nStreak: {s} apei\nBadges: {b}\nLessons: {l}' },
    leaderboard: { en: 'Top Learners:\n{list}\n0. Back', lug: 'Abasinga:\n{list}\n0. Emabega', nyn: 'Abasinga:\n{list}\n0. Emabega', ach: 'Jo malo:\n{list}\n0. Dok cing', tes: 'Ijoikar:\n{list}\n0. Idwat' },
    invalid: { en: 'Invalid input. Try again.', lug: 'Ky\'oyingiza kikyamu. Gerezaako.', nyn: 'Eky\'oyingiza kibi. Iteeraho.', ach: 'Ket pa kare. Temi doki.', tes: 'Ipen ejoa. Tom idwat.' },
    goodbye: { en: 'Thank you for using UGScholar.', lug: 'Webale okukozesa UGScholar.', nyn: 'Webare kurara UGScholar.', ach: 'Apwoyo pi tic ki UGScholar.', tes: 'Eyalama ikwuak UGScholar.' },
    skip: { en: 'Diagnostic skipped. You can take it later.', lug: 'Diagnostic olekeddwa. Oyinza okugikola oluvanyuma.', nyn: 'Diagnostic orekwire. Orikubaasa kugikora enyima.', ach: 'Diagnostic oweko. Itwero timo cen.', tes: 'Diagnostic aipan. Ikwuak idwat.' },
    badge_awarded: { en: '🏅 New badge: {b}!', lug: '🏅 Baji empya: {b}!', nyn: '🏅 Baji empya: {b}!', ach: '🏅 Badge malo: {b}!', tes: '🏅 Badge eyai: {b}!' },
    airtime_reward: { en: '🎉 You earned {a} airtime!', lug: '🎉 Ofunye {a} eyaire!', nyn: '🎉 Otsire {a} eyaire!', ach: '🎉 Inongo {a} wel!', tes: '🎉 Ejai {a} airtime!' },
    back: { en: '0. Back', lug: '0. Emabega', nyn: '0. Emabega', ach: '0. Dok cing', tes: '0. Edwat' },
  };
  return t[key]?.[lang] || t[key]?.en || key;
}

async function getSession(sessionId) {
  const rows = await db.query('SELECT * FROM ussd_sessions WHERE session_id = ?', [sessionId]);
  if (rows.length === 0) return null;
  rows[0].data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
  return rows[0];
}

async function saveSession(sessionId, phoneNumber, state, data = {}) {
  const existing = await getSession(sessionId);
  if (existing) {
    await db.query(
      'UPDATE ussd_sessions SET state=?, data=?, phone_number=? WHERE session_id=?',
      [state, JSON.stringify(data), phoneNumber, sessionId]
    );
  } else {
    await db.query(
      'INSERT INTO ussd_sessions (session_id, phone_number, state, data) VALUES (?,?,?,?)',
      [sessionId, phoneNumber, state, JSON.stringify(data)]
    );
  }
}

async function deleteSession(sessionId) {
  await db.query('DELETE FROM ussd_sessions WHERE session_id=?', [sessionId]);
}

async function findOrCreateUser(phone) {
  let users = await db.query('SELECT * FROM users WHERE phone = ?', [phone]);
  if (users.length === 0) {
    const result = await db.query(
      'INSERT INTO users (full_name, email, phone, password, role) VALUES (?,?,?,?,?)',
      ['Learner ' + phone.slice(-4), phone + '@ugscholar.ug', phone, 'ussd_default', 'student']
    );
    users = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
  }
  return users[0];
}

function parseInput(text) {
  return text.split('*').filter(Boolean);
}

async function handleUssd(req, res) {
  try {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const parts = parseInput(text || '');
    const currentInput = parts.length > 0 ? parts[parts.length - 1] : '';

    let session = await getSession(sessionId);
    let state = session ? session.state : 'welcome';
    let data = session ? session.data || {} : {};

    const lang = data.lang || 'en';

    if (text === '' || text === undefined) {
      state = 'welcome';
      data = {};
      await saveSession(sessionId, phoneNumber, state, data);
      const msg = getTranslation('welcome', lang) + '\n' + getTranslation('login_option', lang);
      return res.json({ response: 'CON ' + msg, sessionId });
    }

    if (state === 'welcome') {
      if (currentInput === '1') {
        state = 'pin_auth';
        data.phone = phoneNumber;
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('enter_pin', lang), sessionId });
      }
      if (currentInput === '2') {
        const msg = 'UGScholar: Free learning platform by NCDC syllabus. ' +
          'Access lessons in 5 languages. Earn points, badges & airtime. ' +
          'Dial *285# again to start.';
        return res.json({ response: 'END ' + msg, sessionId });
      }
      return res.json({ response: 'CON ' + getTranslation('invalid', lang) + '\n' + getTranslation('login_option', lang), sessionId });
    }

    if (state === 'pin_auth') {
      data.pin = currentInput;
      state = 'age_verify';
      await saveSession(sessionId, phoneNumber, state, data);
      return res.json({ response: 'CON ' + getTranslation('age_confirm', lang), sessionId });
    }

    if (state === 'age_verify') {
      if (currentInput === '1') {
        data.age_group = 'minor';
        state = 'parent_pin';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('parent_pin', lang), sessionId });
      }
      if (currentInput === '2') {
        data.age_group = 'adult';
        state = 'language_select';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('language_select', lang), sessionId });
      }
      return res.json({ response: 'CON ' + getTranslation('invalid', lang) + '\n' + getTranslation('age_confirm', lang), sessionId });
    }

    if (state === 'parent_pin') {
      data.parentPin = currentInput;
      state = 'language_select';
      await saveSession(sessionId, phoneNumber, state, data);
      return res.json({ response: 'CON ' + getTranslation('language_select', lang), sessionId });
    }

    if (state === 'language_select') {
      const langCode = LANGUAGES[currentInput];
      if (langCode) {
        data.lang = langCode;
        const user = await findOrCreateUser(phoneNumber);
        data.userId = user.id;
      }
      state = 'main_menu';
      await saveSession(sessionId, phoneNumber, state, data);
      return res.json({ response: 'CON ' + getTranslation('main_menu', data.lang || lang), sessionId });
    }

    if (state === 'main_menu') {
      if (currentInput === '1') {
        const tier = data.age_group === 'adult' ? 'adult' : 'primary';
        data.diagTier = tier;
        data.diagIndex = 0;
        data.diagScore = 0;
        state = 'diagnostic';
        await saveSession(sessionId, phoneNumber, state, data);
        const questions = DIAGNOSTIC_QUESTIONS[tier];
        const q = questions[0];
        const opts = q.options.map((o, i) => `${i + 1}. ${o}`).join('\n');
        return res.json({
          response: `CON ${getTranslation('diag_intro', data.lang).replace('{n}', questions.length)}\n${q.q}\n${opts}\n0. Skip`,
          sessionId
        });
      }
      if (currentInput === '2') {
        state = 'lesson_select';
        data.lessonIndex = 0;
        await saveSession(sessionId, phoneNumber, state, data);
        const tier = data.age_group === 'adult' ? 'adult' : 'primary';
        const subjects = TIERS[tier].subjects;
        return res.json({
          response: 'CON ' + subjects.map((s, i) => `${i + 1}. ${s.replace('_', ' ')}`).join('\n') + '\n0. Back',
          sessionId
        });
      }
      if (currentInput === '3') {
        state = 'progress';
        await saveSession(sessionId, phoneNumber, state, data);
        const user = await findOrCreateUser(phoneNumber);
        const enroll = await db.query('SELECT COALESCE(SUM(points),0) as p, COALESCE(MAX(streak),0) as s, COUNT(*) as l FROM enrollments WHERE student_id=?', [user.id]);
        const badgeCount = await db.query('SELECT COUNT(*) as c FROM badges WHERE user_id=?', [user.id]);
        const msg = getTranslation('progress', data.lang)
          .replace('{p}', enroll[0]?.p || 0)
          .replace('{s}', enroll[0]?.s || 0)
          .replace('{b}', badgeCount[0]?.c || 0)
          .replace('{l}', enroll[0]?.l || 0);
        return res.json({ response: 'CON ' + msg + '\n0. Back', sessionId });
      }
      if (currentInput === '4') {
        state = 'leaderboard';
        await saveSession(sessionId, phoneNumber, state, data);
        const leaders = await db.query(
          `SELECT u.phone, COALESCE(SUM(e.points),0) as p FROM users u
           LEFT JOIN enrollments e ON e.student_id=u.id AND e.status='active'
           WHERE u.role='student' GROUP BY u.id, u.phone ORDER BY p DESC LIMIT 5`
        );
        const list = leaders.map((l, i) => `${i + 1}. ***${l.phone.slice(-4)}: ${l.p}p`).join('\n');
        return res.json({ response: 'CON ' + getTranslation('leaderboard', data.lang).replace('{list}', list), sessionId });
      }
      if (currentInput === '5') {
        state = 'language_select';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('language_select', data.lang), sessionId });
      }
      if (currentInput === '0') {
        await deleteSession(sessionId);
        return res.json({ response: 'END ' + getTranslation('goodbye', data.lang), sessionId });
      }
      return res.json({ response: 'CON ' + getTranslation('invalid', data.lang) + '\n' + getTranslation('main_menu', data.lang), sessionId });
    }

    if (state === 'diagnostic') {
      if (currentInput === '0') {
        state = 'main_menu';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('skip', data.lang) + '\n' + getTranslation('main_menu', data.lang), sessionId });
      }
      const tier = data.diagTier || 'primary';
      const questions = DIAGNOSTIC_QUESTIONS[tier];
      const idx = data.diagIndex || 0;
      const answer = parseInt(currentInput) - 1;
      if (answer === questions[idx].answer) {
        data.diagScore = (data.diagScore || 0) + 1;
      }
      data.diagIndex = idx + 1;
      if (data.diagIndex >= questions.length) {
        state = 'main_menu';
        const score = data.diagScore || 0;
        const total = questions.length;
        const gap = score < Math.ceil(total * 0.6);
        const user = await findOrCreateUser(phoneNumber);
        await db.query(
          'INSERT INTO diagnostic_results (user_id, tier, score, total, gap_detected) VALUES (?,?,?,?,?)',
          [user.id, tier, score, total, gap]
        );
        const result = getTranslation('diag_result', data.lang).replace('{s}', score).replace('{t}', total).replace('{g}', gap ? 'Yes' : 'No');
        const advice = gap ? getTranslation('diag_fail', data.lang) : getTranslation('diag_pass', data.lang);
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + result + '\n' + advice + '\n' + getTranslation('main_menu', data.lang), sessionId });
      }
      await saveSession(sessionId, phoneNumber, state, data);
      const q = questions[data.diagIndex];
      const opts = q.options.map((o, i) => `${i + 1}. ${o}`).join('\n');
      return res.json({ response: 'CON ' + q.q + '\n' + opts, sessionId });
    }

    if (state === 'lesson_select') {
      if (currentInput === '0') {
        state = 'main_menu';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('main_menu', data.lang), sessionId });
      }
      const tier = data.age_group === 'adult' ? 'adult' : 'primary';
      const subjects = TIERS[tier].subjects;
      const subIdx = parseInt(currentInput) - 1;
      if (subIdx >= 0 && subIdx < subjects.length) {
        data.currentSubject = subjects[subIdx];
        data.lessonIndex = 0;
        state = 'lesson_content';
        await saveSession(sessionId, phoneNumber, state, data);
        const subjectName = subjects[subIdx].replace('_', ' ');
        const lessonText = `${subjectName} Lesson 1: Introduction\nLearn the basics of ${subjectName}.\n\n1. Mark Complete\n0. Back`;
        return res.json({ response: 'CON ' + lessonText, sessionId });
      }
      return res.json({
        response: 'CON ' + getTranslation('invalid', data.lang) + '\n' +
          subjects.map((s, i) => `${i + 1}. ${s.replace('_', ' ')}`).join('\n') + '\n0. Back',
        sessionId
      });
    }

    if (state === 'lesson_content') {
      if (currentInput === '0') {
        data.lessonIndex = 0;
        state = 'lesson_select';
        await saveSession(sessionId, phoneNumber, state, data);
        const tier = data.age_group === 'adult' ? 'adult' : 'primary';
        const subjects = TIERS[tier].subjects;
        return res.json({
          response: 'CON ' + subjects.map((s, i) => `${i + 1}. ${s.replace('_', ' ')}`).join('\n') + '\n0. Back',
          sessionId
        });
      }
      if (currentInput === '1') {
        const user = await findOrCreateUser(phoneNumber);
        const enroll = await db.query('SELECT id FROM enrollments WHERE student_id=? AND status=? LIMIT 1', [user.id, 'active']);
        if (enroll.length > 0) {
          await db.query('UPDATE enrollments SET points = COALESCE(points,0) + 10, streak = COALESCE(streak,0) + 1 WHERE id=?', [enroll[0].id]);
          const badgeKey = 'first_lesson';
          const existing = await db.query('SELECT id FROM badges WHERE user_id=? AND badge_key=?', [user.id, badgeKey]);
          if (existing.length === 0) {
            await db.query('INSERT INTO badges (user_id, badge_key) VALUES (?,?)', [user.id, badgeKey]);
          }
        } else {
          await db.query(
            'INSERT INTO enrollments (student_id, course_id, points, streak) VALUES (?,1,10,1)',
            [user.id]
          );
        }
        state = 'main_menu';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({
          response: 'CON ' + getTranslation('lesson_complete', data.lang) + '\n' + getTranslation('main_menu', data.lang),
          sessionId
        });
      }
      return res.json({ response: 'CON ' + getTranslation('invalid', data.lang) + '\n1. Mark Complete\n0. Back', sessionId });
    }

    if (state === 'progress' || state === 'leaderboard') {
      if (currentInput === '0') {
        state = 'main_menu';
        await saveSession(sessionId, phoneNumber, state, data);
        return res.json({ response: 'CON ' + getTranslation('main_menu', data.lang), sessionId });
      }
      return res.json({ response: 'CON ' + getTranslation('invalid', data.lang) + '\n0. Back', sessionId });
    }

    return res.json({ response: 'END ' + getTranslation('goodbye', lang), sessionId });
  } catch (error) {
    console.error('USSD error:', error);
    return res.status(500).json({ response: 'END System error. Please try again.' });
  }
}

module.exports = { handleUssd };
