import { useEffect, useState } from 'react';
import { adminGetSubscriptions, adminGetSubscriptionStats, adminAssignPlan, adminCancelSubscription } from '../../services/subscriptionService';
import { getUsers } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import Modal from '../../components/Modal';

export default function ManageSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ userId: '', planCode: 'plus', periodMonths: 1 });
  const [assigning, setAssigning] = useState(false);
  const [users, setUsers] = useState([]);
  const [cancelingId, setCancelingId] = useState(null);

  async function loadData() {
    try {
      const [subResponse, statsResponse, usersResponse] = await Promise.all([
        adminGetSubscriptions(page),
        adminGetSubscriptionStats(),
        getUsers()
      ]);
      setSubscriptions(subResponse.data.data);
      setTotal(subResponse.data.total);
      setStats(statsResponse.data);
      setUsers(usersResponse.data);
    } catch {
      setError('Could not load subscription data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [page]);

  async function handleAssign(e) {
    e.preventDefault();
    setAssigning(true);
    setError('');
    try {
      await adminAssignPlan(assignForm.userId, assignForm.planCode, assignForm.periodMonths);
      setMessage('Plan assigned.');
      setShowAssign(false);
      loadData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not assign plan.');
    } finally {
      setAssigning(false);
    }
  }

  async function handleCancel(subscriptionId) {
    setCancelingId(null);
    try {
      await adminCancelSubscription(subscriptionId);
      setMessage('Subscription canceled.');
      loadData();
    } catch {
      setError('Could not cancel subscription.');
    }
  }

  if (loading) return <LoadingSpinner />;

  const totalPages = Math.ceil(total / 20);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Subscriptions</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAssign(true)}>Assign plan</button>
      </div>

      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />

      {/* Stats cards */}
      {stats && (
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <div className="stat-card">
              <div className="text-muted">Active subscriptions</div>
              <div className="h2">{stats.activeSubscriptions}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="text-muted">Total revenue</div>
              <div className="h2">${Number(stats.totalRevenue).toFixed(2)}</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <div className="text-muted">By plan</div>
              <div className="small">
                {stats.byPlan?.map((p) => (
                  <span key={p.code} className="me-2">{p.name}: <strong>{p.count}</strong></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscriptions table */}
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>User</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Provider</th>
              <th>Period end</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 && (
              <tr><td colSpan={6} className="text-center text-muted py-4">No subscriptions yet.</td></tr>
            )}
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td>{sub.user_name}<br /><small className="text-muted">{sub.user_email}</small></td>
                <td><span className="badge bg-light text-dark">{sub.plan_name}</span></td>
                <td><span className={`badge ${sub.status === 'active' || sub.status === 'trialing' ? 'bg-success' : sub.status === 'canceled' ? 'bg-warning' : 'bg-secondary'}`}>{sub.status}</span></td>
                <td>{sub.payment_provider}</td>
                <td>{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}</td>
                <td>
                  {sub.status === 'active' && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setCancelingId(sub.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-light btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="py-1 small">Page {page} of {totalPages}</span>
          <button className="btn btn-light btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      {/* Assign plan modal */}
      {showAssign && (
        <Modal title="Assign plan" onCancel={() => setShowAssign(false)}>
          <form onSubmit={handleAssign}>
            <div className="mb-3">
              <label className="form-label">User</label>
              <select className="form-select" value={assignForm.userId}
                onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })} required>
                <option value="">Select user...</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Plan</label>
              <select className="form-select" value={assignForm.planCode}
                onChange={(e) => setAssignForm({ ...assignForm, planCode: e.target.value })}>
                <option value="starter">Starter</option>
                <option value="plus">Plus</option>
                <option value="teacher_pro">Teacher Pro</option>
                <option value="institution">Institution</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Duration (months)</label>
              <input className="form-control" type="number" min="1" value={assignForm.periodMonths}
                onChange={(e) => setAssignForm({ ...assignForm, periodMonths: parseInt(e.target.value) || 1 })} />
            </div>
            <button className="btn btn-primary w-100" disabled={assigning}>
              {assigning ? 'Assigning...' : 'Assign plan'}
            </button>
          </form>
        </Modal>
      )}

      {/* Confirm cancel modal */}
      {cancelingId && (
        <Modal
          title="Cancel subscription"
          message="Cancel this subscription? The user will lose access to premium features."
          confirmText="Cancel subscription"
          danger
          onCancel={() => setCancelingId(null)}
          onConfirm={() => handleCancel(cancelingId)}
        />
      )}
    </>
  );
}
