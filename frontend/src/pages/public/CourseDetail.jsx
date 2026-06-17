import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import { getCourse } from '../../services/courseService';
import { enrollInCourse } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getCourse(id).then(r => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function handleEnroll() {
    if (!user) { navigate('/login', { state: { from: `/courses/${id}` } }); return; }
    if (user.role !== 'student') { setError('Only students can enroll in courses.'); return; }
    try {
      await enrollInCourse(id);
      setMessage('Enrolled successfully!');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not enroll.');
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!course) return <div className="page-shell"><div className="content-panel"><p className="text-muted">Course not found.</p></div></div>;

  return (
    <div className="page-shell">
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />
      <div className="content-panel">
        <h1 className="h3 mb-2">{course.title}</h1>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <table className="table table-sm">
              <tbody>
                <tr><td className="text-muted">Teacher</td><td>{course.teacher_name}</td></tr>
                <tr><td className="text-muted">Tier</td><td>{course.tier_name || '—'}</td></tr>
                <tr><td className="text-muted">Subject</td><td>{course.subject_name || '—'}</td></tr>
                <tr><td className="text-muted">Level</td><td>{course.level}</td></tr>
                <tr><td className="text-muted">Duration</td><td>{course.duration || 'Self-paced'}</td></tr>
                <tr><td className="text-muted">Language</td><td>{course.language_code || 'en'}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <h2 className="h5">Description</h2>
        <p>{course.description}</p>
        <button className="btn btn-primary" onClick={handleEnroll}>
          {user ? 'Enroll in this course' : 'Login to enroll'}
        </button>
      </div>
    </div>
  );
}
