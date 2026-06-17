import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourses, updateCourseStatus } from '../../services/adminService';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    const r = await getCourses();
    setCourses(r.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatus(id, status) {
    await updateCourseStatus(id, status);
    setMessage(`Course ${status}`);
    load();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Manage courses</h1>
      <AlertMessage type="success" message={message} />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Title</th><th>Teacher</th><th>Tier</th><th>Subject</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {courses.map(c => (
              <tr key={c.id}>
                <td><strong>{c.title}</strong></td>
                <td>{c.teacher_name}</td>
                <td>{c.tier_name || '—'}</td>
                <td>{c.subject_name || '—'}</td>
                <td><span className={`badge ${c.status === 'active' ? 'text-bg-success' : 'text-bg-danger'}`}>{c.status}</span></td>
                <td>
                  {c.status === 'active'
                    ? <button className="btn btn-outline-danger btn-sm" onClick={() => handleStatus(c.id, 'inactive')}>Deactivate</button>
                    : <button className="btn btn-outline-success btn-sm" onClick={() => handleStatus(c.id, 'active')}>Activate</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
