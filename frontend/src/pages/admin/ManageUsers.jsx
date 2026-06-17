import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUsers, updateUserStatus } from '../../services/adminService';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    const r = await getUsers();
    setUsers(r.data);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleStatus(id, status) {
    await updateUserStatus(id, status);
    setMessage(`User ${status}`);
    loadUsers();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Manage users</h1>
      <AlertMessage type="success" message={message} />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.full_name}</strong></td>
                <td>{u.email}</td>
                <td>{u.phone || '—'}</td>
                <td><span className={`badge ${u.role === 'admin' ? 'text-bg-warning' : u.role === 'teacher' ? 'text-bg-info' : 'text-bg-secondary'}`}>{u.role}</span></td>
                <td><span className={`badge ${u.status === 'active' ? 'text-bg-success' : 'text-bg-danger'}`}>{u.status}</span></td>
                <td>
                  {u.status === 'active'
                    ? <button className="btn btn-outline-danger btn-sm" onClick={() => handleStatus(u.id, 'inactive')}>Deactivate</button>
                    : <button className="btn btn-outline-success btn-sm" onClick={() => handleStatus(u.id, 'active')}>Activate</button>
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
