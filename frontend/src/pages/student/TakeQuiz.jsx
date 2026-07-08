import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getQuizForTaking, startAttempt, submitAttempt } from '../../services/quizService';

// ── Timer hook ───────────────────────────────────────────────────────────────
function useCountdown(minutes, onExpire) {
  const [timeLeft, setTimeLeft] = useState(null); // seconds

  useEffect(() => {
    if (minutes == null || minutes <= 0) return;
    setTimeLeft(minutes * 60);
  }, [minutes]);

  useEffect(() => {
    if (timeLeft == null) return;
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft, onExpire]);

  return timeLeft;
}

function formatTime(seconds) {
  if (seconds == null) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [expired, setExpired] = useState(false);
  const submittingRef = useRef(false);

  // Auto-submit when time expires
  const handleTimerExpire = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setExpired(true);
    try {
      const response = await submitAttempt(attemptId, answers);
      navigate(`/student/quiz-result/${attemptId}`, { state: response.data });
    } catch {
      setError('Time expired but submission failed. Contact your teacher.');
    }
  }, [attemptId, answers, navigate]);

  const timeLeft = useCountdown(started ? quiz?.time_limit : null, handleTimerExpire);

  useEffect(() => {
    getQuizForTaking(id)
      .then((response) => {
        const data = response.data;
        setQuiz(data);
        if (data.attemptId) {
          setAttemptId(data.attemptId);
          setStarted(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStart() {
    try {
      const response = await startAttempt(id);
      setAttemptId(response.data.attemptId);
      setStarted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start quiz.');
    }
  }

  function handleAnswer(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await submitAttempt(attemptId, answers);
      navigate(`/student/quiz-result/${attemptId}`, { state: response.data });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit quiz.');
      submittingRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }

  function isTimeLow() {
    return timeLeft != null && timeLeft <= 60;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) return <LoadingSpinner />;
  if (!quiz) return <AlertMessage type="danger" message="Quiz not found." />;

  if (!started) {
    return (
      <div className="content-panel" style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 className="h3">{quiz.title}</h1>
        {quiz.instructions && <p>{quiz.instructions}</p>}
        <p className="text-muted">
          {quiz.questions.length} questions | {quiz.time_limit ? `${quiz.time_limit} minute time limit` : 'No time limit'} | {quiz.max_attempts} attempt(s) | Pass: {quiz.passing_score}%
        </p>
        <AlertMessage type="danger" message={error} />
        <button className="btn btn-primary" onClick={handleStart}>Start quiz</button>
      </div>
    );
  }

  return (
    <div className="content-panel" style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Timer bar */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">{quiz.title}</h1>
        {timeLeft != null && (
          <span className={`badge fs-6 px-3 py-2 ${isTimeLow() ? 'bg-danger' : 'bg-secondary'}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {expired && (
        <AlertMessage type="warning" message="Time is up! Your quiz is being submitted automatically." />
      )}
      {isTimeLow() && !expired && (
        <AlertMessage type="warning" message={`Less than 1 minute remaining! Submit your answers soon.`} />
      )}
      <AlertMessage type="danger" message={error} />

      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="border rounded-3 p-3 mb-3">
            <p className="fw-bold mb-2">
              {qIndex + 1}. {question.question_text}{' '}
              <span className="fw-normal text-muted small">({question.points} pt{question.points > 1 ? 's' : ''})</span>
            </p>
            {question.question_type === 'mcq' ? (
              question.options.map((option) => (
                <div className="form-check" key={option.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name={`q-${question.id}`}
                    id={`q-${question.id}-${option.id}`}
                    value={option.id}
                    checked={Number(answers[question.id]) === option.id}
                    onChange={() => handleAnswer(question.id, option.id)}
                    disabled={expired}
                  />
                  <label className="form-check-label" htmlFor={`q-${question.id}-${option.id}`}>{option.option_text}</label>
                </div>
              ))
            ) : (
              <div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name={`q-${question.id}`} id={`q-${question.id}-true`} value="1"
                    checked={answers[question.id] === '1'} onChange={() => handleAnswer(question.id, '1')} disabled={expired} />
                  <label className="form-check-label" htmlFor={`q-${question.id}-true`}>True</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name={`q-${question.id}`} id={`q-${question.id}-false`} value="0"
                    checked={answers[question.id] === '0'} onChange={() => handleAnswer(question.id, '0')} disabled={expired} />
                  <label className="form-check-label" htmlFor={`q-${question.id}-false`}>False</label>
                </div>
              </div>
            )}
          </div>
        ))}
        <button className="btn btn-primary" disabled={submitting || expired}>
          {submitting ? 'Submitting...' : expired ? 'Time expired' : 'Submit quiz'}
        </button>
      </form>
    </div>
  );
}
