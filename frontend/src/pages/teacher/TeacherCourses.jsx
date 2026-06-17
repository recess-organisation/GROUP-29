import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getTeacherCourses, deleteCourse } from '../../services/courseService';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await getTeacherCourses();
    setCourses(r.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Deactivate this course?')) return;
    await deleteCourse(id);
    setMessage('Course deactivated.');
    load();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My courses</h1>
        <Link className="btn btn-primary" to="/teacher/courses/create">Create course</Link>
      </div>
      <AlertMessage type="success" message={message} />
      <div className="row g-3">
        {courses.map(c => (
          <div className="col-md-6" key={c.id}>
            <div className="course-card d-flex flex-column">
              <h5>{c.title}</h5>
              <p className="text-muted flex-grow-1">{c.description}</p>
              <div className="small text-muted mb-2">
                <div>Tier: {c.tier_name || '—'} | Subject: {c.subject_name || '—'}</div>
                <div>Students: {c.enrolled_students || 0} | Status: {c.status}</div>
              </div>
              <div className="d-flex gap-2">
                <Link className="btn btn-outline-primary btn-sm" to={`/teacher/courses/${c.id}/edit`}>Edit</Link>
                <Link className="btn btn-primary btn-sm" to={`/teacher/courses/${c.id}/lessons`}>Lessons</Link>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.id)}>Deactivate</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
