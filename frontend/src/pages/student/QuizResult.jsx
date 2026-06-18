import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAttemptResult } from '../../services/quizService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function QuizResult() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttemptResult(attemptId)
      .then((response) => setAttempt(response.data))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <LoadingSpinner />;
  if (!attempt) return <p className="text-muted">Result not found.</p>;

  return (
    <div className="content-panel" style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 className="h3 mb-3">Quiz result</h1>
      <div className={`text-center p-4 rounded-3 mb-4 ${attempt.passed ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
        <div className="h1 mb-0">{attempt.score}%</div>
        <div className="h5">{attempt.passed ? 'Passed' : 'Did not pass'}</div>
        <div className="text-muted small">{attempt.earned_points} / {attempt.total_points} points</div>
      </div>

      {attempt.answers?.length > 0 && (
        <div>
          <h2 className="h5 mb-3">Review answers</h2>
          {attempt.answers.map((answer, i) => (
            <div key={answer.id} className={`border rounded-3 p-3 mb-2 ${answer.is_correct ? 'border-success' : 'border-danger'}`}>
              <p className="fw-bold mb-1">{i + 1}. {answer.question_text}</p>
              <p className="mb-0 small">
                Your answer: <span className={answer.is_correct ? 'text-success' : 'text-danger'}>{answer.selected_option_text || (answer.boolean_answer ? 'True' : 'False')}</span>
                {!answer.is_correct && <span className="text-muted ms-2">({answer.points} pt{answer.points > 1 ? 's' : ''})</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      <a className="btn btn-outline-primary btn-sm mt-3" href="/student">Back to dashboard</a>
    </div>
  );
}
