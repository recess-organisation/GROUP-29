import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LessonList from '../../components/LessonList';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { deleteLesson, getLessonsByCourse } from '../../services/lessonService';

export default function ManageLessons() {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  async function loadLessons() {
    const response = await getLessonsByCourse(id);
    setLessons(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadLessons();
  }, [id]);

  async function handleDelete(lessonId) {
    setDeleting(null);
    await deleteLesson(lessonId);
    setMessage('Lesson deactivated.');
    loadLessons();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Manage lessons</h1>
        <Link className="btn btn-primary" to={`/teacher/courses/${id}/lessons/create`}>Add lesson</Link>
      </div>
      <AlertMessage type="success" message={message} />
      {deleting && (
        <Modal
          title="Deactivate lesson"
          message="Deactivate this lesson? Students will no longer see it."
          confirmText="Deactivate"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
      <div className="content-panel">
        <LessonList lessons={lessons} />
        {lessons.map((lesson) => (
          <div key={lesson.id} className="d-inline-block">
            <Link className="btn btn-outline-primary btn-sm mt-2 me-2" to={`/teacher/quizzes/lesson/${lesson.id}`}>Quizzes</Link>
            <button className="btn btn-outline-danger btn-sm mt-2 me-2" onClick={() => setDeleting(lesson.id)}>
              Deactivate {lesson.title}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
