import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { resetPassword } from '../../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setSubmitting(false);
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setSubmitting(false);
      return;
    }

    try {
      await resetPassword(token, form.password);
      navigate('/login', { state: { message: 'Password reset successful. You can now log in.' } });
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <main className="page-shell">
        <div className="content-panel mx-auto" style={{ maxWidth: 480 }}>
          <h1 className="h3">Invalid reset link</h1>
          <AlertMessage type="danger" message="This password reset link is invalid or missing. Please request a new one." />
          <Link to="/forgot-password" className="btn btn-primary">Request new link</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 480 }}>
        <h1 className="h3">Set new password</h1>
        <AlertMessage type="danger" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">New password</label>
            <input className="form-control" type="password" minLength={8} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm new password</label>
            <input className="form-control" type="password" minLength={8} value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
          </div>
          <button className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </main>
  );
}
