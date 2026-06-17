import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getStats } from '../../services/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats().then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Admin dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Users</div><div className="h2">{stats.totalUsers}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Courses</div><div className="h2">{stats.totalCourses}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Enrollments</div><div className="h2">{stats.totalEnrollments}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Lessons</div><div className="h2">{stats.totalLessons}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Diagnostics</div><div className="h2">{stats.totalDiagnostics}</div></div></div>
        <div className="col-md-4 col-lg-2"><div className="stat-card"><div className="text-muted">Badges</div><div className="h2">{stats.totalBadges}</div></div></div>
      </div>
    </>
  );
}
