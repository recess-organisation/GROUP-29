import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getQuizForTaking, startAttempt, submitAttempt } from '../../services/quizService';

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
    setSubmitting(true);
    try {
      const response = await submitAttempt(attemptId, answers);
      navigate(`/student/quiz-result/${attemptId}`, { state: response.data });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit quiz.');
    } finally {
      setSubmitting(false);
    }
  }

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
      <h1 className="h3 mb-3">{quiz.title}</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="border rounded-3 p-3 mb-3">
            <p className="fw-bold mb-2">{qIndex + 1}. {question.question_text} <span className="fw-normal text-muted small">({question.points} pt{question.points > 1 ? 's' : ''})</span></p>
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
                  />
                  <label className="form-check-label" htmlFor={`q-${question.id}-${option.id}`}>{option.option_text}</label>
                </div>
              ))
            ) : (
              <div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name={`q-${question.id}`} id={`q-${question.id}-true`} value="1" checked={answers[question.id] === '1'} onChange={() => handleAnswer(question.id, '1')} />
                  <label className="form-check-label" htmlFor={`q-${question.id}-true`}>True</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name={`q-${question.id}`} id={`q-${question.id}-false`} value="0" checked={answers[question.id] === '0'} onChange={() => handleAnswer(question.id, '0')} />
                  <label className="form-check-label" htmlFor={`q-${question.id}-false`}>False</label>
                </div>
              </div>
            )}
          </div>
        ))}
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit quiz'}</button>
      </form>
    </div>
  );
}
