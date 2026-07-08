import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMySubscription, cancelSubscription } from '../services/subscriptionService';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import PremiumGate from '../components/PremiumGate';

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

export default function SubscriptionManage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMySubscription()
      .then((response) => setData(response.data))
      .catch(() => setError('Could not load subscription info.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel() {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of the billing period.')) return;
    setCanceling(true);
    try {
      await cancelSubscription();
      setMessage('Subscription canceled.');
      // Reload
      const response = await getMySubscription();
      setData(response.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not cancel.');
    } finally {
      setCanceling(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const { plan, subscription } = data || {};
  const isPremium = plan?.planCode !== 'free';
  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';

  return (
    <div className="page-shell">
      <div className="content-panel mx-auto" style={{ maxWidth: 640 }}>
        <h1 className="h3 mb-3">Subscription</h1>
        <AlertMessage type="success" message={message} />
        <AlertMessage type="danger" message={error} />

        {/* Current plan card */}
        <div className="border rounded-3 p-4 mb-3"
             style={{ background: isPremium ? 'linear-gradient(135deg, #FFF0F0, #FFE4E4)' : '#F8F9FA' }}>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h4 className="mb-1">{plan?.planName || 'Free'}</h4>
              <p className="text-muted mb-0">
                {isPremium ? `${subscription?.status === 'trialing' ? 'Trial' : 'Active'} — started ${formatDate(subscription?.current_period_start)}` : 'Basic plan'}
              </p>
              {subscription?.current_period_end && (
                <small className="text-muted">
                  {isActive ? `Renews ${formatDate(subscription.current_period_end)}` : `Expired ${formatDate(subscription.current_period_end)}`}
                </small>
              )}
            </div>
            {!isPremium && (
              <Link to="/pricing" className="btn btn-primary">Upgrade</Link>
            )}
          </div>
        </div>

        {/* Plan features */}
        {plan?.features && (
          <div className="mb-3">
            <h5 className="mb-2">Features included in your plan</h5>
            <div className="row g-2">
              {Object.entries(plan.features).map(([key, value]) => (
                <div key={key} className="col-md-6">
                  <span className={value ? 'text-success' : 'text-muted'}>
                    {value ? '✓' : '—'} {key.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Limits info */}
        {plan && (
          <div className="mb-3">
            <h5 className="mb-2">Plan limits</h5>
            <ul className="list-unstyled">
              <li><strong>Max courses:</strong> {plan.maxCourses === -1 ? 'Unlimited' : plan.maxCourses}</li>
              <li><strong>Max enrollments:</strong> {plan.maxEnrollments === -1 ? 'Unlimited' : plan.maxEnrollments}</li>
              <li><strong>Max parental rules:</strong> {plan.maxParentalRules === -1 ? 'Unlimited' : `Up to ${plan.maxParentalRules} per child`}</li>
            </ul>
          </div>
        )}

        {/* Cancel action */}
        {isActive && isPremium && (
          <button className="btn btn-outline-danger" onClick={handleCancel} disabled={canceling}>
            {canceling ? 'Canceling...' : 'Cancel subscription'}
          </button>
        )}

        <hr />

        {/* Premium-gated features preview */}
        <h5 className="mb-2">Premium features</h5>
        <PremiumGate feature="advanced_analytics" message="Upgrade to Premium to access advanced analytics, certificates, data export, and more.">
          <p className="text-success">✓ You have access to all premium features.</p>
        </PremiumGate>
      </div>
    </div>
  );
}
