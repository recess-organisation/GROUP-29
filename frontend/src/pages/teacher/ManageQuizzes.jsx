import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { deleteQuiz, getQuizzesByLesson } from '../../services/quizService';

export default function ManageQuizzes() {
  const { lessonId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(null);

  async function loadQuizzes() {
    const response = await getQuizzesByLesson(lessonId);
    setQuizzes(response.data);
    setLoading(false);
  }

  useEffect(() => { loadQuizzes(); }, [lessonId]);

  async function handleDelete(id) {
    setDeleting(null);
    await deleteQuiz(id);
    setMessage('Quiz deleted.');
    loadQuizzes();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Quizzes</h1>
        <Link className="btn btn-primary" to={`/teacher/quizzes/create/${lessonId}`}>Create quiz</Link>
      </div>
      <AlertMessage type="success" message={message} />
      {deleting && (
        <Modal
          title="Delete quiz"
          message="Delete this quiz and all its questions permanently?"
          confirmText="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
      {quizzes.length === 0 ? (
        <p className="text-muted">No quizzes yet for this lesson.</p>
      ) : (
        <div className="row g-3">
          {quizzes.map((quiz) => (
            <div className="col-md-6" key={quiz.id}>
              <div className="content-panel">
                <h5>{quiz.title}</h5>
                <p className="text-muted small mb-2">{quiz.question_count} questions | {quiz.max_attempts} attempt(s) | {quiz.time_limit ? `${quiz.time_limit}min` : 'No time limit'}</p>
                <div className="d-flex gap-2">
                  <Link className="btn btn-outline-primary btn-sm" to={`/teacher/quizzes/${quiz.id}/edit`}>Edit</Link>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => setDeleting(quiz.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Link className="btn btn-outline-primary btn-sm mt-3" to={`/teacher/courses/lessons`}>Back to lessons</Link>
    </>
  );
}
