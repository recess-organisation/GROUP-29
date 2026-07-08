const db = require('../config/db');
const quizService = require('../services/quizService');

// --- Teacher endpoints ---

async function getQuizzesByLesson(req, res) {
  try {
    const quizzes = await db.query(
      'SELECT * FROM quizzes WHERE lesson_id = ? ORDER BY created_at DESC',
      [req.params.lessonId]
    );
    for (const quiz of quizzes) {
      const count = await db.query(
        'SELECT COUNT(*) AS count FROM quiz_questions WHERE quiz_id = ?',
        [quiz.id]
      );
      quiz.question_count = count[0].count;
    }
    return res.json(quizzes);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load quizzes.' });
  }
}

async function getQuizForEdit(req, res) {
  try {
    const quiz = await quizService.getFullQuizWithAnswers(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    return res.json(quiz);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load quiz.' });
  }
}

async function createQuiz(req, res) {
  try {
    const { lesson_id, title, instructions, passing_score, max_attempts, time_limit } = req.body;
    if (!lesson_id || !title) {
      return res.status(400).json({ message: 'Lesson ID and title are required.' });
    }

    const result = await db.query(
      'INSERT INTO quizzes (lesson_id, title, instructions, passing_score, max_attempts, time_limit) VALUES (?, ?, ?, ?, ?, ?)',
      [lesson_id, title, instructions || null, passing_score || 50, max_attempts || 1, time_limit || null]
    );

    return res.status(201).json({ message: 'Quiz created.', quizId: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Could not create quiz.' });
  }
}

async function updateQuiz(req, res) {
  try {
    const { title, instructions, passing_score, max_attempts, time_limit, status } = req.body;
    await db.query(
      'UPDATE quizzes SET title = COALESCE(?, title), instructions = COALESCE(?, instructions), passing_score = COALESCE(?, passing_score), max_attempts = COALESCE(?, max_attempts), time_limit = COALESCE(?, time_limit), status = COALESCE(?, status) WHERE id = ?',
      [title, instructions, passing_score, max_attempts, time_limit, status, req.params.id]
    );
    return res.json({ message: 'Quiz updated.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not update quiz.' });
  }
}

async function deleteQuiz(req, res) {
  try {
    await db.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Quiz deleted.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not delete quiz.' });
  }
}

async function saveQuestions(req, res) {
  try {
    const { quizId } = req.params;
    const { questions } = req.body;

    await db.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quizId]);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qResult = await db.query(
        'INSERT INTO quiz_questions (quiz_id, question_type, question_text, points, question_order) VALUES (?, ?, ?, ?, ?)',
        [quizId, q.question_type || 'mcq', q.question_text, q.points || 1, i]
      );
      const questionId = qResult.insertId;

      if (q.options && q.options.length > 0) {
        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await db.query(
            'INSERT INTO quiz_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)',
            [questionId, opt.option_text, opt.is_correct ? 1 : 0, j]
          );
        }
      }
    }

    return res.json({ message: 'Questions saved.' });
  } catch (error) {
    return res.status(500).json({ message: 'Could not save questions.' });
  }
}

// --- Student endpoints ---

async function getQuizForTaking(req, res) {
  try {
    const quiz = await quizService.getFullQuiz(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    if (quiz.status !== 'active') return res.status(403).json({ message: 'This quiz is not available.' });

    const attemptCount = await db.query(
      'SELECT COUNT(*) AS count FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (attemptCount[0].count >= quiz.max_attempts) {
      return res.status(403).json({ message: 'You have used all allowed attempts for this quiz.' });
    }

    const existingAttempt = await db.query(
      'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? AND submitted_at IS NULL ORDER BY started_at DESC LIMIT 1',
      [req.params.id, req.user.id]
    );

    if (existingAttempt.length > 0) {
      quiz.attemptId = existingAttempt[0].id;
    }

    return res.json(quiz);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load quiz.' });
  }
}

async function startAttempt(req, res) {
  try {
    const { quizId } = req.params;

    const quiz = await db.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    if (quiz.length === 0) return res.status(404).json({ message: 'Quiz not found.' });

    const attemptCount = await db.query(
      'SELECT COUNT(*) AS count FROM quiz_attempts WHERE quiz_id = ? AND user_id = ?',
      [quizId, req.user.id]
    );

    if (attemptCount[0].count >= quiz[0].max_attempts) {
      return res.status(403).json({ message: 'No more attempts allowed.' });
    }

    const result = await db.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id) VALUES (?, ?)',
      [req.user.id, quizId]
    );

    return res.status(201).json({ message: 'Attempt started.', attemptId: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Could not start attempt.' });
  }
}

async function submitAttempt(req, res) {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    const attempt = await db.query(
      'SELECT * FROM quiz_attempts WHERE id = ? AND user_id = ?',
      [attemptId, req.user.id]
    );

    if (attempt.length === 0) {
      return res.status(404).json({ message: 'Attempt not found.' });
    }

    if (attempt[0].submitted_at) {
      return res.status(400).json({ message: 'This attempt has already been submitted.' });
    }

    const result = await quizService.gradeAttempt(attemptId, answers || {});
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Could not submit attempt.' });
  }
}

async function getAttemptResult(req, res) {
  try {
    const { attemptId } = req.params;
    const attempt = await quizService.getAttemptWithAnswers(attemptId, req.user.id);
    if (!attempt) return res.status(404).json({ message: 'Attempt not found.' });
    return res.json(attempt);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load result.' });
  }
}

async function getMyQuizAttempts(req, res) {
  try {
    const { quizId } = req.params;
    const attempts = await db.query(
      'SELECT * FROM quiz_attempts WHERE quiz_id = ? AND user_id = ? ORDER BY started_at DESC',
      [quizId, req.user.id]
    );
    return res.json(attempts);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load attempts.' });
  }
}

module.exports = {
  getQuizzesByLesson,
  getQuizForEdit,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  saveQuestions,
  getQuizForTaking,
  startAttempt,
  submitAttempt,
  getAttemptResult,
  getMyQuizAttempts
};
