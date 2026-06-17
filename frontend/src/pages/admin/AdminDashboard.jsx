import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getStats, getUsers, getLeaderboard } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getUsers(), getLeaderboard()]).then(([s, u, l]) => {
      setStats(s.data); setUsers(u.data); setLeaderboard(l.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Admin dashboard</h1>
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Users</div><div className="h2">{stats.totalUsers}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Courses</div><div className="h2">{stats.totalCourses}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Enrollments</div><div className="h2">{stats.totalEnrollments}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Lessons</div><div className="h2">{stats.totalLessons}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Diagnostics</div><div className="h2">{stats.totalDiagnostics}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Badges</div><div className="h2">{stats.totalBadges}</div></div></div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="content-panel h-100">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">Recent users</h2>
              <Link className="btn btn-outline-primary btn-sm" to="/admin/users">All users</Link>
            </div>
            <hr />
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead><tr><th>Name</th><th>Role</th><th>Status</th></tr></thead>
                <tbody>
                  {users.slice(0, 5).map(u => (
                    <tr key={u.id}>
                      <td><strong>{u.full_name}</strong><br /><small className="text-muted">{u.email}</small></td>
                      <td><span className={`badge ${u.role === 'admin' ? 'text-bg-warning' : u.role === 'teacher' ? 'text-bg-info' : u.role === 'parent' ? 'text-bg-primary' : 'text-bg-secondary'}`}>{u.role}</span></td>
                      <td><span className={`badge ${u.status === 'active' ? 'text-bg-success' : 'text-bg-danger'}`}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="content-panel h-100">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">Leaderboard</h2>
              <Link className="btn btn-outline-primary btn-sm" to="/admin/badges">Badges</Link>
            </div>
            <hr />
            {leaderboard.length === 0 ? <p className="text-muted">No learners yet</p> : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead><tr><th>#</th><th>Name</th><th>Points</th><th>Streak</th><th>Courses</th></tr></thead>
                  <tbody>
                    {leaderboard.slice(0, 5).map((u, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td><strong>{u.full_name}</strong></td>
                        <td>{u.points}</td>
                        <td>{u.streak} days</td>
                        <td>{u.courses_enrolled}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
