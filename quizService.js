const db = require('../config/db');

async function getFullQuiz(quizId) {
  const quizzes = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  if (quizzes.length === 0) return null;
  const quiz = quizzes[0];

  const questions = await db.query(
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order ASC',
    [quizId]
  );

  for (const question of questions) {
    const options = await db.query(
      'SELECT id, option_text, option_order FROM quiz_options WHERE question_id = ? ORDER BY option_order ASC',
      [question.id]
    );
    question.options = options;
  }

  quiz.questions = questions;
  return quiz;
}

async function getFullQuizWithAnswers(quizId) {
  const quizzes = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
  if (quizzes.length === 0) return null;
  const quiz = quizzes[0];

  const questions = await db.query(
    'SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY question_order ASC',
    [quizId]
  );

  for (const question of questions) {
    const options = await db.query(
      'SELECT * FROM quiz_options WHERE question_id = ? ORDER BY option_order ASC',
      [question.id]
    );
    question.options = options;
  }

  quiz.questions = questions;
  return quiz;
}

async function gradeAttempt(attemptId, answers) {
  const attempt = await db.query('SELECT * FROM quiz_attempts WHERE id = ?', [attemptId]);
  if (attempt.length === 0) throw new Error('Attempt not found');

  const questions = await db.query(
    'SELECT * FROM quiz_questions WHERE quiz_id = ?',
    [(await db.query('SELECT quiz_id FROM quiz_attempts WHERE id = ?', [attemptId]))[0].quiz_id]
  );

  let totalPoints = 0;
  let earnedPoints = 0;

  for (const question of questions) {
    const userAnswer = answers[question.id];
    if (userAnswer === undefined || userAnswer === null) continue;

    totalPoints += question.points;
    let isCorrect = false;

    if (question.question_type === 'mcq') {
      const correctOption = await db.query(
        'SELECT id FROM quiz_options WHERE question_id = ? AND is_correct = 1',
        [question.id]
      );
      if (correctOption.length > 0) {
        isCorrect = Number(userAnswer) === correctOption[0].id;
      }
    } else if (question.question_type === 'true_false') {
      const correctOption = await db.query(
        'SELECT is_correct FROM quiz_options WHERE question_id = ? AND is_correct = 1',
        [question.id]
      );
      isCorrect = Boolean(Number(userAnswer)) === (correctOption.length > 0);
    }

    const pointsEarned = isCorrect ? question.points : 0;
    earnedPoints += pointsEarned;

    await db.query(
      `INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, boolean_answer, is_correct, points_earned)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [attemptId, question.id, question.question_type === 'mcq' ? userAnswer : null, question.question_type === 'true_false' ? userAnswer : null, isCorrect ? 1 : 0, pointsEarned]
    );
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const quiz = await db.query('SELECT passing_score FROM quizzes WHERE id = ?', [attempt[0].quiz_id]);
  const passingScore = quiz[0]?.passing_score || 50;
  const passed = score >= passingScore ? 1 : 0;

  await db.query(
    'UPDATE quiz_attempts SET score = ?, total_points = ?, passed = ?, submitted_at = NOW() WHERE id = ?',
    [score, totalPoints, passed, attemptId]
  );

  return {
    attemptId,
    score,
    totalPoints,
    earnedPoints,
    passed: !!passed,
    passingScore
  };
}

async function getAttemptWithAnswers(attemptId, userId) {
  const attempts = await db.query(
    'SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?',
    [attemptId, userId]
  );
  if (attempts.length === 0) return null;
  const attempt = attempts[0];

  const answers = await db.query(
    `SELECT qa.*, qq.question_text, qq.question_type, qq.points,
            qo.option_text AS selected_option_text
     FROM quiz_answers qa
     JOIN quiz_questions qq ON qq.id = qa.question_id
     LEFT JOIN quiz_options qo ON qo.id = qa.selected_option_id
     WHERE qa.attempt_id = ?`,
    [attemptId]
  );

  attempt.answers = answers;
  return attempt;
}

module.exports = {
  getFullQuiz,
  getFullQuizWithAnswers,
  gradeAttempt,
  getAttemptWithAnswers
};
