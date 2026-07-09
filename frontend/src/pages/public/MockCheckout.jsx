import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fakePayment } from '../../services/subscriptionService';
import AlertMessage from '../../components/AlertMessage';

const PLAN_DETAILS = {
  starter: { name: 'Starter', price: '$1.50/mo' },
  plus: { name: 'Plus', price: '$5.00/mo' },
  teacher_pro: { name: 'Teacher Pro', price: '$9.99/mo' },
  institution: { name: 'Institution', price: '$99.99/mo' }
};

export default function MockCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const planCode = searchParams.get('plan') || 'plus';
  const plan = PLAN_DETAILS[planCode] || PLAN_DETAILS.plus;

  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardName, setCardName] = useState('John Doe');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    setError('');
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await fakePayment(planCode);
      navigate('/subscription');
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 480 }}>
        <div className="text-center mb-4">
          <h1 className="h3 mb-1">Complete your payment</h1>
          <p className="text-muted mb-0">{plan.name} — {plan.price}</p>
        </div>

        <AlertMessage type="danger" message={error} />

        <div className="border rounded-3 p-4" style={{ background: '#F8F9FA' }}>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Card number</label>
              <input className="form-control" value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Cardholder name</label>
              <input className="form-control" value={cardName}
                onChange={(e) => setCardName(e.target.value)} required />
            </div>
            <div className="row mb-3">
              <div className="col-6">
                <label className="form-label">Expiry date</label>
                <input className="form-control" value={expiry}
                  onChange={(e) => setExpiry(e.target.value)} required />
              </div>
              <div className="col-6">
                <label className="form-label">CVV</label>
                <input className="form-control" value={cvv} type="password" maxLength={4}
                  onChange={(e) => setCvv(e.target.value)} required />
              </div>
            </div>
            <div className="small text-muted mb-3 text-center">
              This is a demo — no real payment will be charged.
            </div>
            <button className="btn btn-primary w-100" disabled={processing}>
              {processing
                ? <span><span className="spinner-border spinner-border-sm me-2" />Processing payment...</span>
                : `Pay ${plan.price}`}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
