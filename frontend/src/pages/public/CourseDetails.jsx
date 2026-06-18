import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getCourse } from '../../services/courseService';
import { enrollInCourse } from '../../services/enrollmentService';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    getCourse(id)
      .then((response) => setCourse(response.data))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEnroll() {
    setEnrolling(true);
    try {
      await enrollInCourse(id);
      setMessage('You are enrolled. Open the learning page from your dashboard.');
      setError('');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!course) return <main className="page-shell"><AlertMessage type="danger" message="Course not found." /></main>;

  return (
    <main className="page-shell">
      <div className="content-panel">
        <span className="badge badge-soft mb-2">{course.category_name || 'General'}</span>
        <h1 className="h2">{course.title}</h1>
        <p className="lead">{course.description}</p>
        <div className="row g-3 mb-3">
          <div className="col-md-3"><strong>Teacher</strong><br />{course.teacher_name}</div>
          <div className="col-md-3"><strong>Level</strong><br />{course.level}</div>
          <div className="col-md-3"><strong>Duration</strong><br />{course.duration || 'Self-paced'}</div>
          <div className="col-md-3"><strong>Status</strong><br />{course.status}</div>
        </div>
        <AlertMessage type="success" message={message} />
        <AlertMessage type="danger" message={error} />
        {user?.role === 'student' ? (
          <button className="btn btn-success" disabled={enrolling} onClick={handleEnroll}>{enrolling ? 'Enrolling...' : 'Enroll in course'}</button>
        ) : (
          <Link className="btn btn-primary" to={user ? `/${user.role}` : '/login'}>{user ? 'Go to dashboard' : 'Login to enroll'}</Link>
        )}
      </div>
    </main>
  );
}
