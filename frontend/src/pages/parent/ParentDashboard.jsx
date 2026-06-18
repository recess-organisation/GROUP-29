import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';
import Modal from '../../components/Modal';
import { getParentDashboard, linkChild, unlinkChild, getChildRules, createRule, updateRule, deleteRule } from '../../services/parentService';
import { useAuth } from '../../context/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ACTIVITIES = ['LESSON', 'ASSIGNMENT', 'QUIZ', 'GENERAL'];

export default function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [linkEmail, setLinkEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [unlinking, setUnlinking] = useState(null);
  const [linking, setLinking] = useState(false);
  const [rules, setRules] = useState({});
  const [expandedChild, setExpandedChild] = useState(null);
  const [ruleForm, setRuleForm] = useState(null);
  const [editRuleId, setEditRuleId] = useState(null);
  const [deletingRule, setDeletingRule] = useState(null);

  async function loadDashboard() {
    try {
      const response = await getParentDashboard();
      setData(response.data);
    } catch (err) {
      setError('Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDashboard(); }, []);

  async function loadRules(childId) {
    const response = await getChildRules(childId);
    setRules((prev) => ({ ...prev, [childId]: response.data }));
  }

  function toggleExpand(childId) {
    if (expandedChild === childId) {
      setExpandedChild(null);
      return;
    }
    setExpandedChild(childId);
    if (!rules[childId]) loadRules(childId);
  }

  async function handleLinkChild(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLinking(true);
    try {
      await linkChild(linkEmail);
      setMessage('Child linked successfully.');
      setLinkEmail('');
      loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not link child.');
    } finally {
      setLinking(false);
    }
  }

  async function handleUnlink(childId) {
    setUnlinking(null);
    await unlinkChild(childId);
    setMessage('Child unlinked.');
    loadDashboard();
  }

  function openRuleForm(childId, rule = null) {
    if (rule) {
      setRuleForm({
        child_id: childId,
        day_of_week: rule.day_of_week ?? '',
        start_time: rule.start_time || '',
        end_time: rule.end_time || '',
        max_daily_minutes: rule.max_daily_minutes || '',
        activity: rule.activity || '',
        action: rule.action
      });
      setEditRuleId(rule.id);
    } else {
      setRuleForm({
        child_id: childId,
        day_of_week: '',
        start_time: '',
        end_time: '',
        max_daily_minutes: '',
        activity: '',
        action: 'block'
      });
      setEditRuleId(null);
    }
  }

  async function handleSaveRule(e) {
    e.preventDefault();
    const payload = {
      child_id: ruleForm.child_id,
      day_of_week: ruleForm.day_of_week === '' ? null : Number(ruleForm.day_of_week),
      start_time: ruleForm.start_time || null,
      end_time: ruleForm.end_time || null,
      max_daily_minutes: ruleForm.max_daily_minutes ? Number(ruleForm.max_daily_minutes) : null,
      activity: ruleForm.activity || null,
      action: ruleForm.action
    };

    try {
      if (editRuleId) {
        await updateRule(editRuleId, payload);
        setMessage('Rule updated.');
      } else {
        await createRule(payload);
        setMessage('Rule created.');
      }
      setRuleForm(null);
      setEditRuleId(null);
      loadRules(ruleForm.child_id);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save rule.');
    }
  }

  async function handleDeleteRule(ruleId) {
    setDeletingRule(null);
    await deleteRule(ruleId);
    setMessage('Rule deleted.');
    if (expandedChild) loadRules(expandedChild);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Parent dashboard</h1>
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />
      {unlinking && (
        <Modal
          title="Unlink child"
          message="Unlink this child? They will no longer be monitored through your account."
          confirmText="Unlink"
          danger
          onCancel={() => setUnlinking(null)}
          onConfirm={() => handleUnlink(unlinking)}
        />
      )}
      {deletingRule && (
        <Modal
          title="Delete rule"
          message="Delete this rule permanently?"
          confirmText="Delete"
          danger
          onCancel={() => setDeletingRule(null)}
          onConfirm={() => handleDeleteRule(deletingRule)}
        />
      )}

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="text-muted">Linked children</div>
            <div className="h2">{data?.children?.length || 0}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="text-muted">Active rules</div>
            <div className="h2">{data?.children?.reduce((a, c) => a + (c.rule_count || 0), 0) || 0}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="text-muted">Account</div>
            <div className="h6 mt-2">{user?.full_name}</div>
          </div>
        </div>
      </div>

      <div className="content-panel mb-3">
        <h2 className="h5 mb-3">Link a child</h2>
        <form className="row g-2" onSubmit={handleLinkChild}>
          <div className="col-md-6">
            <input className="form-control" placeholder="Student email address" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)} required />
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-primary" type="submit" disabled={linking}>{linking ? 'Linking...' : 'Link child'}</button>
          </div>
        </form>
      </div>

      <div className="content-panel mb-3">
        <h2 className="h5 mb-3">Your children</h2>
        {data?.children?.length === 0 ? (
          <p className="text-muted mb-0">No children linked yet. Use the form above to link a student.</p>
        ) : (
          <div>
            {data?.children?.map((child) => (
              <div key={child.id} className="border rounded-3 p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{child.full_name}</strong>
                    <span className="text-muted ms-2 small">{child.email}</span>
                    <span className="ms-3 badge badge-soft">{child.status}</span>
                    <span className="ms-2 text-muted small">{child.today_minutes || 0}min used today</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Link className="btn btn-outline-primary btn-sm" to={`/parent/children/${child.id}/activity`}>Activity</Link>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => toggleExpand(child.id)}>
                      {expandedChild === child.id ? 'Hide rules' : `Rules (${child.rule_count || 0})`}
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => setUnlinking(child.id)}>Unlink</button>
                  </div>
                </div>

                {expandedChild === child.id && (
                  <div className="mt-3">
                    {rules[child.id]?.length > 0 ? (
                      <div className="table-responsive mb-2">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Day</th>
                              <th>Time</th>
                              <th>Daily limit</th>
                              <th>Activity</th>
                              <th>Action</th>
                              <th>Status</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {rules[child.id].map((rule) => (
                              <tr key={rule.id}>
                                <td>{rule.day_of_week !== null ? DAYS[rule.day_of_week] : 'Every day'}</td>
                                <td>{rule.start_time && rule.end_time ? `${rule.start_time.slice(0, 5)} - ${rule.end_time.slice(0, 5)}` : 'Any time'}</td>
                                <td>{rule.max_daily_minutes ? `${rule.max_daily_minutes} min` : 'Unlimited'}</td>
                                <td>{rule.activity || 'All'}</td>
                                <td><span className={`badge ${rule.action === 'block' ? 'text-bg-danger' : 'text-bg-success'}`}>{rule.action}</span></td>
                                <td><span className={`badge ${rule.enabled ? 'badge-soft' : 'text-bg-secondary'}`}>{rule.enabled ? 'Active' : 'Disabled'}</span></td>
                                <td>
                                  <button className="btn btn-outline-primary btn-sm me-1" onClick={() => openRuleForm(child.id, rule)}>Edit</button>
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => setDeletingRule(rule.id)}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small mb-2">No rules yet. Create one below.</p>
                    )}

                    {ruleForm && ruleForm.child_id === child.id && (
                      <form className="border rounded-2 p-3 bg-light" onSubmit={handleSaveRule}>
                        <div className="row g-2 align-items-end">
                          <div className="col-md-2">
                            <label className="form-label small">Day</label>
                            <select className="form-select form-select-sm" value={ruleForm.day_of_week} onChange={(e) => setRuleForm({ ...ruleForm, day_of_week: e.target.value })}>
                              <option value="">Every day</option>
                              {DAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
                            </select>
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small">Start time</label>
                            <input className="form-control form-control-sm" type="time" value={ruleForm.start_time} onChange={(e) => setRuleForm({ ...ruleForm, start_time: e.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small">End time</label>
                            <input className="form-control form-control-sm" type="time" value={ruleForm.end_time} onChange={(e) => setRuleForm({ ...ruleForm, end_time: e.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small">Daily limit (min)</label>
                            <input className="form-control form-control-sm" type="number" min="1" value={ruleForm.max_daily_minutes} onChange={(e) => setRuleForm({ ...ruleForm, max_daily_minutes: e.target.value })} />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label small">Activity</label>
                            <select className="form-select form-select-sm" value={ruleForm.activity} onChange={(e) => setRuleForm({ ...ruleForm, activity: e.target.value })}>
                              <option value="">All</option>
                              {ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                          <div className="col-md-1">
                            <label className="form-label small">Action</label>
                            <select className="form-select form-select-sm" value={ruleForm.action} onChange={(e) => setRuleForm({ ...ruleForm, action: e.target.value })}>
                              <option value="block">Block</option>
                              <option value="allow">Allow</option>
                            </select>
                          </div>
                          <div className="col-md-1 d-grid">
                            <button className="btn btn-primary btn-sm" type="submit">{editRuleId ? 'Save' : 'Add'}</button>
                          </div>
                        </div>
                      </form>
                    )}

                    {(!ruleForm || ruleForm.child_id !== child.id) && (
                      <button className="btn btn-outline-primary btn-sm" onClick={() => openRuleForm(child.id)}>+ Add rule</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
