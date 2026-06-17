import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyCourses } from '../../services/enrollmentService';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses().then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">My enrolled courses</h1>
      {courses.length === 0 ? <div className="content-panel"><p className="text-muted">You are not enrolled in any courses yet.</p></div> : (
        <div className="row g-3">
          {courses.map(c => (
            <div className="col-md-6" key={c.enrollment_id}>
              <div className="course-card d-flex flex-column">
                <h5>{c.title}</h5>
                <p className="text-muted flex-grow-1">{c.description}</p>
                <div className="small text-muted mb-2">
                  <div>Teacher: {c.teacher_name} | Tier: {c.tier_name || '—'}</div>
                  <div>Progress: <div className="progress" style={{ height: 6 }}><div className="progress-bar" style={{ width: `${c.progress_percentage || 0}%` }} /></div></div>
                  <div>Points: {c.points || 0} | Streak: {c.streak || 0} days</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
