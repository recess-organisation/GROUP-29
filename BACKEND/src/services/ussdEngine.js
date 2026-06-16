const sessionStore = require('./sessionStore');
const db = require('../config/db');
const { t } = require('../utils/translations');
const { GAMIFICATION } = require('../config/constants');
const gamification = require('./gamification');

class UssdEngine {
  async handle(sessionId, phoneNumber, text) {
    const session = await sessionStore.get(phoneNumber);
    const input = text ? text.split('*') : [''];
    const lastInput = input[input.length - 1];
    const menuPath = input.slice(0, -1).filter(Boolean);

    session.menuPath = menuPath;
    await sessionStore.update(phoneNumber, { lastActivity: new Date() });

    switch (session.state) {
      case 'welcome': return this.welcome(session, lastInput, phoneNumber);
      case 'pin_auth': return this.pinAuth(session, lastInput, phoneNumber);
      case 'age_verify': return this.ageVerify(session, lastInput, phoneNumber);
      case 'parent_pin': return this.parentPin(session, lastInput, phoneNumber);
      case 'select_language': return this.selectLanguage(session, lastInput, phoneNumber);
      case 'main_menu': return this.mainMenu(session, lastInput, phoneNumber);
      case 'diagnostic': return this.diagnostic(session, lastInput, phoneNumber);
      case 'lesson_menu': return this.lessonMenu(session, lastInput, phoneNumber);
      case 'lesson_content': return this.lessonContent(session, lastInput, phoneNumber);
      case 'progress': return this.progress(session, lastInput, phoneNumber);
      case 'leaderboard': return this.leaderboard(session, lastInput, phoneNumber);
      default: return this.welcome(session, '', phoneNumber);
    }
  }

  async welcome(session, input, phone) {
    if (input === '1') {
      await sessionStore.update(phone, { state: 'pin_auth' });
      return { type: 'CON', message: t('enterPin', session.language) };
    }
    if (input === '2') {
      return {
        type: 'END',
        message: `UGScholar: Learn in your language.\nAvailable on any MTN/Airtel line.\nDial *285*XX# to start learning.`,
      };
    }
    return {
      type: 'CON',
      message: `${t('welcome', session.language)}\n1. ${t('login', session.language)}\n2. ${t('learnMore', session.language)}`,
    };
  }

  async pinAuth(session, input, phone) {
    if (session.lockedUntil && new Date(session.lockedUntil) > new Date()) {
      const remaining = Math.ceil((new Date(session.lockedUntil) - new Date()) / 60000);
      return { type: 'END', message: `Account locked. Try again in ${remaining} minutes.` };
    }

    if (!input || input.length < 4) {
      await sessionStore.update(phone, { pinAttempts: session.pinAttempts + 1 });
      return { type: 'CON', message: `PIN must be at least 4 digits.\n${t('enterPin', session.language)}` };
    }

    if (!session.pin) {
      await sessionStore.update(phone, { pin: input, pinAttempts: 0, state: 'age_verify' });
      return { type: 'CON', message: `${t('ageVerify', session.language)}\n1. Under 18\n2. 18 or above` };
    }

    if (input !== session.pin) {
      const attempts = (session.pinAttempts || 0) + 1;
      if (attempts >= 5) {
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        await sessionStore.update(phone, { pinAttempts: attempts, lockedUntil: lockUntil });
        return { type: 'END', message: 'Too many failed attempts. Account locked for 30 minutes.' };
      }
      await sessionStore.update(phone, { pinAttempts: attempts });
      const remaining = 5 - attempts;
      return { type: 'CON', message: `Incorrect PIN. ${remaining} attempt(s) remaining.\n${t('enterPin', session.language)}` };
    }

    await sessionStore.update(phone, { pinAttempts: 0, state: 'main_menu' });
    return this.mainMenu(session, '', phone);
  }

  async ageVerify(session, input, phone) {
    if (input === '1') {
      await sessionStore.update(phone, { ageVerified: true, age: 'under18', state: 'parent_pin' });
      return { type: 'CON', message: 'Parent/Guardian: Set a supervision PIN to manage access:' };
    }
    if (input === '2') {
      await sessionStore.update(phone, { ageVerified: true, age: '18plus', tier: 'adult', state: 'select_language' });
      return { type: 'CON', message: `${t('selectLanguage', session.language)}\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English` };
    }
    return { type: 'CON', message: `${t('ageVerify', session.language)}\n1. Under 18\n2. 18 or above` };
  }

  async parentPin(session, input, phone) {
    if (!input || input.length < 4) {
      return { type: 'CON', message: 'PIN must be at least 4 digits.\nSet a supervision PIN:' };
    }
    await sessionStore.update(phone, { parentPin: input, state: 'select_language' });
    return { type: 'CON', message: `${t('selectLanguage', session.language)}\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English` };
  }

  async selectLanguage(session, input, phone) {
    const langMap = { '1': 'lug', '2': 'nyn', '3': 'ach', '4': 'tes', '5': 'en' };
    const lang = langMap[input];

    if (!lang) {
      return { type: 'CON', message: `${t('selectLanguage', session.language)}\n1. Luganda\n2. Runyankole\n3. Acholi\n4. Ateso\n5. English` };
    }

    let tier = session.tier;
    if (!tier) {
      if (session.age === 'under18') {
        tier = 'primary';
      } else {
        tier = 'adult';
      }
    }

    await sessionStore.update(phone, { language: lang, tier, state: 'main_menu' });
    return this.mainMenu(session, '', phone);
  }

  async mainMenu(session, input, phone) {
    if (input === '1') {
      await sessionStore.update(phone, { state: 'diagnostic', questionIndex: 0, score: 0 });
      return this.diagnostic(session, '', phone);
    }
    if (input === '2') {
      await sessionStore.update(phone, { state: 'lesson_menu' });
      return this.lessonMenu(session, '', phone);
    }
    if (input === '3') {
      await sessionStore.update(phone, { state: 'progress' });
      return this.progress(session, '', phone);
    }
    if (input === '4') {
      await sessionStore.update(phone, { state: 'leaderboard' });
      return this.leaderboard(session, '', phone);
    }

    return {
      type: 'CON',
      message: `${t('mainMenu', session.language)}\n1. ${t('diagnostic', session.language)}\n2. ${t('startLesson', session.language)}\n3. ${t('myProgress', session.language)}\n4. ${t('leaderboard', session.language)}`,
    };
  }

  async diagnostic(session, input, phone) {
    const questions = diagnosticQuestions[session.tier] || diagnosticQuestions.primary;
    const idx = session.questionIndex || 0;

    if (input === '') {
      const q = questions[idx];
      return { type: 'CON', message: `Question ${idx + 1}/${questions.length}\n${q.question}\n${this.formatOptions(q.options)}` };
    }

    const q = questions[idx];
    if (q && input === q.answer) {
      await sessionStore.update(phone, { score: (session.score || 0) + 1 });
    }

    const nextIdx = idx + 1;
    if (nextIdx < questions.length) {
      await sessionStore.update(phone, { questionIndex: nextIdx });
      const nextQ = questions[nextIdx];
      return { type: 'CON', message: `Question ${nextIdx + 1}/${questions.length}\n${nextQ.question}\n${this.formatOptions(nextQ.options)}` };
    }

    const finalScore = (session.score || 0) + (q && input === q.answer ? 1 : 0);
    const total = questions.length;
    const gapDetected = finalScore < total * 0.6;

    await sessionStore.update(phone, {
      state: 'main_menu',
      lastDiagnosticScore: finalScore,
      lastDiagnosticTotal: total,
      gapDetected,
    });

    await db.query(
      'INSERT INTO diagnostic_results (user_id, tier, score, total, gap_detected) VALUES (?, ?, ?, ?, ?)',
      [session.id, session.tier || 'primary', finalScore, total, gapDetected ? 1 : 0]
    );

    const gapMsg = gapDetected
      ? `We found some learning gaps. Remedial lessons will be sent via SMS.`
      : `Great job! You're on track.`;

    return {
      type: 'END',
      message: `Diagnostic Complete\nScore: ${finalScore}/${total}\n${gapMsg}`,
    };
  }

  async lessonMenu(session, input, phone) {
    const subjects = subjectMap[session.tier] || subjectMap.primary;
    const subjectKeys = Object.keys(subjects);

    if (input === '' || !subjectKeys[parseInt(input) - 1]) {
      const lines = subjectKeys.map((key, i) => `${i + 1}. ${subjects[key]}`).join('\n');
      return { type: 'CON', message: `Select subject:\n${lines}\n0. Back` };
    }

    if (input === '0') {
      await sessionStore.update(phone, { state: 'main_menu' });
      return this.mainMenu(session, '', phone);
    }

    const selectedSubject = subjectKeys[parseInt(input) - 1];
    await sessionStore.update(phone, {
      state: 'lesson_content',
      currentSubject: selectedSubject,
      lessonIndex: 0,
    });
    return this.lessonContent(session, '', phone);
  }

  async lessonContent(session, input, phone) {
    if (input === '0') {
      await sessionStore.update(phone, { state: 'lesson_menu' });
      return this.lessonMenu(session, '', phone);
    }

    if (input === '#') {
      const points = GAMIFICATION.POINTS_PER_LESSON;
      const streak = (session.streak || 0) + 1;
      const lessonsCompleted = (session.lessonsCompleted || 0) + 1;

      await sessionStore.update(phone, {
        state: 'main_menu',
        points: (session.points || 0) + points,
        streak,
        lessonsCompleted,
      });

      gamification.checkAndAwardBadges(session.id, phone);
      gamification.checkAirtimeReward(session.id, phone);

      return {
        type: 'END',
        message: `Lesson complete! +${points} points\nStreak: ${streak} days\nTotal: ${(session.points || 0) + points} pts`,
      };
    }

    return {
      type: 'CON',
      message: `${this.getSubjectLabel(session.tier, session.currentSubject)} - Micro Lesson\n[Content delivered via SMS for offline reading]\n\nReply 0 to go back\nReply # to complete this lesson`,
    };
  }

  async progress(session, input, phone) {
    const diagnostics = await db.query(
      'SELECT score, total, created_at FROM diagnostic_results WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [session.id]
    );

    const badges = await db.query(
      'SELECT badge_key FROM badges WHERE user_id = ?',
      [session.id]
    );

    const badgeList = badges.map(b => b.badge_key).join(', ') || 'None';

    await sessionStore.update(phone, { state: 'main_menu' });

    return {
      type: 'END',
      message: `Your Progress\nPoints: ${session.points || 0}\nStreak: ${session.streak || 0} days\nLessons: ${session.lessonsCompleted || 0}\nBadges: ${badgeList}\nDiagnostic: ${session.lastDiagnosticScore || '-'}/${session.lastDiagnosticTotal || '-'}`,
    };
  }

  async leaderboard(session, input, phone) {
    const topUsers = await db.query(
      'SELECT phone_number, points FROM users ORDER BY points DESC LIMIT 5'
    );

    const lines = topUsers.map((u, i) => {
      const masked = u.phone_number.slice(-4);
      return `${i + 1}. XXX${masked} - ${u.points} pts`;
    }).join('\n');

    await sessionStore.update(phone, { state: 'main_menu' });

    return {
      type: 'END',
      message: `Top Learners\n${lines || 'No learners yet'}\n\nYou: ${session.points || 0} pts`,
    };
  }

  getSubjectLabel(tier, key) {
    const subjects = subjectMap[tier] || subjectMap.primary;
    return subjects[key] || key;
  }

  formatOptions(options) {
    return options.map((opt, i) => `${i + 1}. ${opt}`).join('\n');
  }
}

const diagnosticQuestions = {
  primary: [
    { question: 'What is 5 + 3?', options: ['6', '7', '8', '9'], answer: '3' },
    { question: 'Which is a mammal?', options: ['Fish', 'Frog', 'Cow', 'Snake'], answer: '3' },
    { question: 'What is the capital of Uganda?', options: ['Jinja', 'Kampala', 'Entebbe', 'Gulu'], answer: '2' },
  ],
  olevel: [
    { question: 'What is the chemical symbol for water?', options: ['H2O', 'CO2', 'NaCl', 'O2'], answer: '1' },
    { question: 'Solve: 2x + 3 = 7, x = ?', options: ['1', '2', '3', '4'], answer: '2' },
    { question: 'Who was the first president of Uganda?', options: ['Milton Obote', 'Idi Amin', 'Yoweri Museveni', 'Edward Mutesa'], answer: '1' },
  ],
  alevel: [
    { question: 'What is the derivative of x²?', options: ['x', '2x', 'x²', '2'], answer: '2' },
    { question: 'Which gas is most abundant in Earth\'s atmosphere?', options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'], answer: '3' },
    { question: 'What is Opportunity Cost?', options: ['Money spent', 'Next best alternative forgone', 'Total cost', 'Sunk cost'], answer: '2' },
  ],
  adult: [
    { question: 'What is 10 - 4?', options: ['4', '5', '6', '7'], answer: '3' },
    { question: 'How many months in a year?', options: ['10', '11', '12', '13'], answer: '3' },
    { question: 'What does "literacy" mean?', options: ['Ability to read/write', 'Counting numbers', 'Cooking', 'Farming'], answer: '1' },
  ],
};

const subjectMap = {
  primary: { math: 'Mathematics', english: 'English', science: 'Science', social_studies: 'Social Studies' },
  olevel: { math: 'Mathematics', english: 'English', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', history: 'History', geography: 'Geography' },
  alevel: { math: 'Mathematics', english_lit: 'English Literature', biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', economics: 'Economics', history: 'History' },
  adult: { literacy: 'Literacy', numeracy: 'Numeracy', life_skills: 'Life Skills' },
};

module.exports = new UssdEngine();
