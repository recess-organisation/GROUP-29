import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyCourses } from '../../services/enrollmentService';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses().then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalPoints = courses.reduce((s, c) => s + Number(c.points || 0), 0);
  const maxStreak = Math.max(...courses.map(c => Number(c.streak || 0)), 0);

  return (
    <>
      <h1 className="h3 mb-3">Student dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Enrolled courses</div><div className="h2">{courses.length}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Total points</div><div className="h2">{totalPoints}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Best streak</div><div className="h2">{maxStreak} days</div></div></div>
      </div>
      <div className="content-panel">
        <h2 className="h5">My courses</h2>
        {courses.length === 0 ? <p className="text-muted">Enroll in a course to get started!</p> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Course</th><th>Progress</th><th>Points</th><th>Streak</th></tr></thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c.enrollment_id}>
                    <td><strong>{c.title}</strong><br /><Link className="small" to={`/student/courses/${c.id}/lessons`}>View lessons</Link></td>
                    <td><div className="progress" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${c.progress_percentage || 0}%` }} /></div><small>{c.progress_percentage || 0}%</small></td>
                    <td>{c.points || 0}</td>
                    <td>{c.streak || 0} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
