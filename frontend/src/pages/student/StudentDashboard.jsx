import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyCourses } from '../../services/enrollmentService';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses().then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalPoints = courses.reduce((s, c) => s + Number(c.points || 0), 0);
  const maxStreak = Math.max(...courses.map(c => Number(c.streak || 0)), 0);
  const completedCourses = courses.filter(c => c.enrollment_status === 'completed').length;
  const avgProgress = courses.length > 0
    ? Math.round(courses.reduce((s, c) => s + Number(c.progress_percentage || 0), 0) / courses.length)
    : 0;

  return (
    <>
      <h1 className="h3 mb-3">Student dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Enrolled courses</div><div className="h2">{courses.length}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Total points</div><div className="h2">{totalPoints}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Best streak</div><div className="h2">{maxStreak} days</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Avg progress</div><div className="h2">{avgProgress}%</div></div></div>
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="content-panel">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">My courses</h2>
              <Link className="btn btn-outline-primary btn-sm" to="/courses">Browse courses</Link>
            </div>
            <hr />
            {courses.length === 0 ? (
              <p className="text-muted">You are not enrolled in any courses. <Link to="/courses">Browse the catalog</Link> to get started!</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead><tr><th>Course</th><th>Progress</th><th>Points</th><th>Streak</th><th></th></tr></thead>
                  <tbody>
                    {courses.map(c => (
                      <tr key={c.enrollment_id}>
                        <td><strong>{c.title}</strong><br /><small className="text-muted">{c.tier_name || ''} {c.subject_name || ''}</small></td>
                        <td>
                          <div className="progress" style={{ height: 8, maxWidth: 120 }}><div className="progress-bar" style={{ width: `${c.progress_percentage || 0}%` }} /></div>
                          <small>{c.progress_percentage || 0}%</small>
                        </td>
                        <td><strong>{c.points || 0}</strong></td>
                        <td>{c.streak || 0}d</td>
                        <td><Link className="btn btn-primary btn-sm" to={`/student/courses/${c.id}/lessons`}>Study</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-panel mb-3">
            <h2 className="h5">Quick stats</h2>
            <hr />
            <div className="mb-2"><small className="text-muted">Completed courses</small><div className="fw-bold">{completedCourses}</div></div>
            <div className="mb-2"><small className="text-muted">Active courses</small><div className="fw-bold">{courses.filter(c => c.enrollment_status === 'active').length}</div></div>
            <div className="mb-2"><small className="text-muted">Total points earned</small><div className="fw-bold">{totalPoints}</div></div>
            <div className="mb-2"><small className="text-muted">Learning streak</small><div className="fw-bold">{maxStreak} days</div></div>
          </div>

          <div className="content-panel">
            <h2 className="h5">Resources</h2>
            <hr />
            <Link className="btn btn-outline-primary btn-sm w-100 mb-2" to="/courses">Browse all courses</Link>
            <Link className="btn btn-outline-primary btn-sm w-100" to="/about">About UGScholar</Link>
          </div>
        </div>
      </div>
    </>
  );
}
