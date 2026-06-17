import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getChildProgress } from '../../services/parentService';

export default function ChildProgress() {
  const { id } = useParams();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildProgress(id).then(r => { setChild(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!child) return <div className="content-panel"><p className="text-muted">Child not found.</p></div>;

  return (
    <>
      <h1 className="h3 mb-3">{child.full_name} — progress</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Points</div><div className="h2">{child.points || 0}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Streak</div><div className="h2">{child.streak || 0} days</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Courses</div><div className="h2">{child.courses_count || 0}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Badges</div><div className="h2">{child.badges_count || 0}</div></div></div>
      </div>

      {child.courses?.length > 0 && (
        <div className="content-panel">
          <h2 className="h5">Course progress</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Course</th><th>Progress</th><th>Points</th><th>Status</th></tr></thead>
              <tbody>
                {child.courses.map(c => (
                  <tr key={c.course_id}>
                    <td>{c.title}</td>
                    <td>
                      <div className="progress" style={{ height: 8 }}><div className="progress-bar" style={{ width: `${c.progress_percentage || 0}%` }} /></div>
                      <small>{c.progress_percentage || 0}%</small>
                    </td>
                    <td>{c.points || 0}</td>
                    <td><span className={`badge ${c.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {child.diagnostics?.length > 0 && (
        <div className="content-panel mt-3">
          <h2 className="h5">Diagnostic results</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Date</th><th>Tier</th><th>Score</th><th>Gaps detected</th></tr></thead>
              <tbody>
                {child.diagnostics.map(d => (
                  <tr key={d.id}>
                    <td>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td>{d.tier}</td>
                    <td>{d.score}/{d.total}</td>
                    <td>{d.gap_detected ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
