import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyChildren, linkChild } from '../../services/parentService';

export default function MyChildren() {
  const [children, setChildren] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  async function load() {
    try {
      const r = await getMyChildren();
      setChildren(r.data);
    } catch (_) { /* ignore */ }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleLink(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await linkChild(email);
      setMessage('Child linked successfully!');
      setEmail('');
      load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not link child.');
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">My children</h1>
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />

      <div className="row g-3">
        <div className="col-md-5">
          <div className="content-panel">
            <h2 className="h5">Link a child</h2>
            <form onSubmit={handleLink}>
              <div className="mb-2"><label className="form-label">Child's email</label><input className="form-control" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@example.ug" /></div>
              <button className="btn btn-primary">Link child</button>
            </form>
          </div>
        </div>
        <div className="col-md-7">
          <div className="content-panel">
            <h2 className="h5">Linked children ({children.length})</h2>
            {children.length === 0 ? (
              <p className="text-muted">No children linked yet. Enter their email to get started.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead><tr><th>Name</th><th>Email</th><th>Courses</th><th>Points</th><th></th></tr></thead>
                  <tbody>
                    {children.map(c => (
                      <tr key={c.student_id}>
                        <td><strong>{c.full_name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.courses_count || 0}</td>
                        <td>{c.points || 0}</td>
                        <td><Link className="btn btn-outline-primary btn-sm" to={`/parent/children/${c.student_id}`}>Progress</Link></td>
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
