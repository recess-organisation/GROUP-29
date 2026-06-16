const LEARNING_TIERS = {
  PRIMARY: { id: 'primary', label: 'Primary (P.1–P.7)', minAge: 6, maxAge: 13 },
  O_LEVEL: { id: 'olevel', label: 'O-Level (S.1–S.4)', minAge: 14, maxAge: 18 },
  A_LEVEL: { id: 'alevel', label: 'A-Level (S.5–S.6)', minAge: 17, maxAge: 21 },
  ADULT: { id: 'adult', label: 'Adult Literacy', minAge: 18, maxAge: null },
};

const LANGUAGES = {
  LUGANDA: { code: 'lug', name: 'Luganda' },
  RUNYANKOLE: { code: 'nyn', name: 'Runyankole' },
  ACHOLI: { code: 'ach', name: 'Acholi' },
  ATESO: { code: 'tes', name: 'Ateso' },
  ENGLISH: { code: 'en', name: 'English' },
};

const USSD_STATES = {
  WELCOME: 'welcome',
  PIN_AUTH: 'pin_auth',
  AGE_VERIFY: 'age_verify',
  LANGUAGE_SELECT: 'language_select',
  MAIN_MENU: 'main_menu',
  DIAGNOSTIC: 'diagnostic',
  LESSON: 'lesson',
  GAMIFICATION: 'gamification',
};

const NCDC_SYLLABUS = {
  primary: ['math', 'english', 'science', 'social_studies'],
  olevel: ['math', 'english', 'biology', 'chemistry', 'physics', 'history', 'geography'],
  alevel: ['math', 'english_lit', 'biology', 'chemistry', 'physics', 'economics', 'history'],
  adult: ['literacy', 'numeracy', 'life_skills'],
};

const GAMIFICATION = {
  POINTS_PER_LESSON: 10,
  STREAK_BONUS: 5,
  BADGES: {
    FIRST_LESSON: 'first_lesson',
    STREAK_3: 'streak_3',
    STREAK_7: 'streak_7',
    STREAK_30: 'streak_30',
    TOP_PERFORMER: 'top_performer',
    ALL_SUBJECTS: 'all_subjects',
  },
};

module.exports = { LEARNING_TIERS, LANGUAGES, USSD_STATES, NCDC_SYLLABUS, GAMIFICATION };
