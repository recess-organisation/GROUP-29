import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';

function dashboardFor(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  if (role === 'parent') return '/parent';
  return '/student';
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const user = await login(form);
      navigate(location.state?.from?.pathname || dashboardFor(user.role));
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 480 }}>
        <h1 className="h3">Login</h1>
        <AlertMessage type="danger" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button className="btn btn-primary w-100" disabled={submitting}>{submitting ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="mt-3 mb-0 text-center">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </main>
  );
}
