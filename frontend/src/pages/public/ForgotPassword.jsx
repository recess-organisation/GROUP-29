import { useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { forgotPassword } from '../../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 480 }}>
        <h1 className="h3">Forgot password</h1>
        <p className="text-muted">Enter your email address and we'll send you a reset link.</p>
        <AlertMessage type="success" message={message} />
        <AlertMessage type="danger" message={error} />
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-100" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="mt-3 mb-0 text-center">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </main>
  );
}
