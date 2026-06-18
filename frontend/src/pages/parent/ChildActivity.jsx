import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getChildActivityLog, getChildDailyUsage } from '../../services/parentService';
import formatDate from '../../utils/formatDate';

export default function ChildActivity() {
  const { childId } = useParams();
  const [logs, setLogs] = useState([]);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getChildActivityLog(childId),
      getChildDailyUsage(childId)
    ]).then(([logResponse, usageResponse]) => {
      setLogs(logResponse.data);
      setUsage(usageResponse.data);
    }).finally(() => setLoading(false));
  }, [childId]);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Child activity</h1>
        <Link className="btn btn-outline-primary btn-sm" to="/parent">Back to dashboard</Link>
      </div>

      {usage.length > 0 && (
        <div className="content-panel mb-3">
          <h2 className="h5 mb-2">Daily usage</h2>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Activity</th>
                  <th>Minutes used</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((row) => (
                  <tr key={`${row.usage_date}-${row.activity}`}>
                    <td>{row.usage_date}</td>
                    <td>{row.activity}</td>
                    <td>{row.minutes_used}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="content-panel">
        <h2 className="h5 mb-2">Activity log</h2>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Access</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="3" className="text-muted text-center">No activity recorded yet.</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i}>
                    <td>{log.activity}</td>
                    <td>
                      <span className={`badge ${log.allowed ? 'badge-soft' : 'alert-danger'}`}>
                        {log.allowed ? 'Allowed' : 'Blocked'}
                      </span>
                    </td>
                    <td>{formatDate(log.checked_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
