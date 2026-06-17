import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSmsLogs } from '../../services/adminService';

export default function SmsLog() {
  const [logs, setLogs] = useState([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(p) {
    setLoading(true);
    const r = await getSmsLogs(p ? { phone: p } : {});
    setLogs(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(phone);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">SMS log</h1>
      <div className="content-panel mb-3">
        <form className="row g-2" onSubmit={handleSearch}>
          <div className="col-auto"><input className="form-control" placeholder="Filter by phone" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="col-auto"><button className="btn btn-primary" type="submit">Search</button></div>
        </form>
      </div>
      <div className="content-panel">
        {logs.length === 0 ? <p className="text-muted">No SMS yet</p> : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Time</th><th>Phone</th><th>Direction</th><th>Message</th><th>Status</th></tr></thead>
              <tbody>
                {logs.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(s.created_at).toLocaleString()}</td>
                    <td>***{(s.phone_number || '').slice(-4)}</td>
                    <td><span className={`badge ${s.direction === 'outbound' ? 'text-bg-info' : 'text-bg-success'}`}>{s.direction}</span></td>
                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.message}</td>
                    <td>{s.status}</td>
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
