import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyCourses } from '../../services/enrollmentService';
import api from '../../services/api';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses().then(async (enrollResponse) => {
      const allQuizzes = [];
      for (const course of enrollResponse.data) {
        const lessonRes = await api.get(`/lessons/course/${course.id}`);
        const lessons = lessonRes.data;
        for (const lesson of lessons) {
          const quizRes = await api.get(`/quizzes/lesson/${lesson.id}`);
          const lessonQuizzes = quizRes.data.filter((q) => q.status === 'active');
          lessonQuizzes.forEach((q) => {
            allQuizzes.push({ ...q, course_title: course.title, lesson_title: lesson.title });
          });
        }
      }
      setQuizzes(allQuizzes);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Quizzes</h1>
      {quizzes.length === 0 ? (
        <p className="text-muted">No quizzes available yet.</p>
      ) : (
        <div className="row g-3">
          {quizzes.map((quiz) => (
            <div className="col-md-6" key={quiz.id}>
              <div className="content-panel">
                <h5>{quiz.title}</h5>
                <p className="text-muted small mb-2">{quiz.course_title} / {quiz.lesson_title} | {quiz.question_count || '?'} questions</p>
                <Link className="btn btn-primary btn-sm" to={`/student/quizzes/${quiz.id}/take`}>Take quiz</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
