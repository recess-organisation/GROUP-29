import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getStats } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then((response) => setStats(response.data));
  }, []);

  if (!stats) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Admin dashboard</h1>
      <div className="row g-3">
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Users</div><div className="h2">{stats.users}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Courses</div><div className="h2">{stats.courses}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Enrollments</div><div className="h2">{stats.enrollments}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Submissions</div><div className="h2">{stats.submissions}</div></div></div>
      </div>
    </>
  );
}
