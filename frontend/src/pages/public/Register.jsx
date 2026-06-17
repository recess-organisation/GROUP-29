import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'teacher' ? '/teacher' : user.role === 'admin' ? '/admin' : '/student');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Registration failed.');
    } finally { setSubmitting(false); }
  }

  return (
    <main className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 560 }}>
        <h1 className="h3">Create account</h1>
        <AlertMessage type="danger" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
            <div className="col-md-6"><label className="form-label">Role</label><select className="form-select" value={form.role} onChange={e => setForm({...form, role: e.target.value})}><option value="student">Student</option><option value="teacher">Teacher/Lecturer</option></select></div>
            <div className="col-12"><label className="form-label">Password</label><input className="form-control" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required /></div>
          </div>
          <button className="btn btn-primary w-100 mt-3" disabled={submitting}>{submitting ? 'Creating account...' : 'Register'}</button>
        </form>
        <p className="mt-3 mb-0 text-center">Already registered? <Link to="/login">Login</Link></p>
      </div>
    </main>
  );
}
