import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getMyChildren } from '../../services/parentService';

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyChildren().then(r => setChildren(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalPoints = children.reduce((s, c) => s + Number(c.points || 0), 0);
  const totalCourses = children.reduce((s, c) => s + Number(c.courses_count || 0), 0);

  return (
    <>
      <h1 className="h3 mb-3">Parent dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Children</div><div className="h2">{children.length}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Total courses</div><div className="h2">{totalCourses}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Total points</div><div className="h2">{totalPoints}</div></div></div>
      </div>

      <div className="content-panel mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">My children</h2>
          <Link className="btn btn-primary btn-sm" to="/parent/children">Manage</Link>
        </div>
        <hr />
        {children.length === 0 ? (
          <p className="text-muted">No children linked yet. Register your child or ask them to use your code.</p>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Name</th><th>Courses</th><th>Points</th><th>Streak</th><th></th></tr></thead>
              <tbody>
                {children.map(c => (
                  <tr key={c.student_id}>
                    <td><strong>{c.full_name}</strong></td>
                    <td>{c.courses_count || 0}</td>
                    <td>{c.points || 0}</td>
                    <td>{c.streak || 0} days</td>
                    <td><Link className="btn btn-outline-primary btn-sm" to={`/parent/children/${c.student_id}`}>View progress</Link></td>
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
