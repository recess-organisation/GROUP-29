import { useEffect, useState } from 'react';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { getProfile, updateProfile, changePassword } from '../services/userService';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Profile form
  const [form, setForm] = useState({ full_name: '', phone: '' });

  // Password form
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    getProfile()
      .then((response) => {
        setProfile(response.data);
        setForm({ full_name: response.data.full_name || '', phone: response.data.phone || '' });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await updateProfile(form);
      setProfile(response.data);
      setMessage('Profile updated successfully.');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPwSaving(true);
    setPwMessage('');
    setPwError('');

    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError('Passwords do not match.');
      setPwSaving(false);
      return;
    }

    try {
      await changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      setPwMessage('Password changed successfully.');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (apiError) {
      setPwError(apiError.response?.data?.message || 'Could not change password.');
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 640 }}>
        <h1 className="h3 mb-3">My profile</h1>

        {/* Profile details */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                 style={{ width: 64, height: 64, fontSize: '1.5rem', fontWeight: 700 }}>
              {(profile?.full_name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h5 className="mb-0">{profile?.full_name}</h5>
              <span className="text-muted small">{profile?.email} — <span className="badge bg-light text-dark">{profile?.role}</span></span>
            </div>
          </div>
        </div>

        <AlertMessage type="success" message={message} />
        <AlertMessage type="danger" message={error} />

        {/* Edit profile form */}
        <h2 className="h5 mb-2">Edit profile</h2>
        <form onSubmit={handleProfileSubmit} className="mb-4">
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input className="form-control" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" value={profile?.email || ''} disabled />
            <small className="text-muted">Email cannot be changed.</small>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <hr />

        {/* Change password form */}
        <h2 className="h5 mb-2">Change password</h2>
        <AlertMessage type="success" message={pwMessage} />
        <AlertMessage type="danger" message={pwError} />
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-3">
            <label className="form-label">Current password</label>
            <input className="form-control" type="password" value={pwForm.current_password}
              onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">New password</label>
            <input className="form-control" type="password" minLength={8} value={pwForm.new_password}
              onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm new password</label>
            <input className="form-control" type="password" minLength={8} value={pwForm.confirm_password}
              onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })} required />
          </div>
          <button className="btn btn-outline-primary" disabled={pwSaving}>
            {pwSaving ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  );
}
