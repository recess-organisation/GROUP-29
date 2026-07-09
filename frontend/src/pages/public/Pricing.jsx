import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPlans, createCheckoutSession } from '../../services/subscriptionService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import AlertMessage from '../../components/AlertMessage';

const TIER_COLORS = {
  0: { bg: '#F8F9FA', border: '#E2E6EA', badge: '' },
  1: { bg: '#E8F5E9', border: '#66BB6A', badge: 'bg-success' },
  2: { bg: '#FFF0F0', border: '#FF6B6B', badge: 'bg-primary' },
  3: { bg: '#E3F2FD', border: '#42A5F5', badge: 'bg-info' },
  4: { bg: '#1E293B', border: '#334155', badge: 'bg-dark' }
};

const TIER_ICONS = {
  0: '🚀',
  1: '🌱',
  2: '⭐',
  3: '👨‍🏫',
  4: '🏢'
};

export default function Pricing() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const highlightedPlan = searchParams.get('plan');

  useEffect(() => {
    getPlans()
      .then((response) => setPlans(response.data))
      .catch(() => setError('Could not load plans.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleUpgrade(planCode) {
    if (!user) return;
    setCheckoutLoading(true);
    setError('');
    try {
      const response = await createCheckoutSession(planCode);
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (apiError) {
      const msg = apiError.response?.data?.message;
      setError(msg || 'Could not initiate checkout.');
      return;
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <main className="page-shell">
      <div className="text-center mb-4">
        <h1 className="h2 mb-1">Choose your plan</h1>
        <p className="text-muted">Unlock more features as you grow with UG Scholar.</p>
      </div>

      <AlertMessage type="danger" message={error} />

      <div className="row g-3 justify-content-center">
        {plans.map((plan) => {
          const colors = TIER_COLORS[plan.tier_level] || TIER_COLORS[0];
          const isHighlighted = highlightedPlan === plan.code;
          const isFree = plan.code === 'free';
          const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;

          const featureLabels = [
            { key: 'unlimited_enrollments', label: 'Unlimited course enrollments' },
            { key: 'unlimited_courses', label: 'Unlimited course creation' },
            { key: 'advanced_analytics', label: 'Advanced analytics' },
            { key: 'certificates', label: 'Completion certificates' },
            { key: 'data_export', label: 'Data export (CSV)' },
            { key: 'course_reviews', label: 'Course reviews & ratings' },
            { key: 'bulk_enrollment', label: 'Bulk enrollment (CSV)' },
            { key: 'api_access', label: 'API access' },
            { key: 'email_reports', label: 'Email reports' },
            { key: 'priority_support', label: 'Priority support' },
            { key: 'white_label', label: 'White-label branding' },
            { key: 'custom_branding', label: 'Custom branding' }
          ];

          return (
            <div key={plan.id} className={`col-md-6 col-lg-3 d-flex`}>
              <div className={`card w-100 ${isHighlighted ? 'shadow-lg border-2' : ''}`}
                   style={{ borderColor: isHighlighted ? colors.border : undefined, borderRadius: 12 }}>
                <div className="card-body d-flex flex-column">
                  <div className="mb-2" style={{ fontSize: '2rem' }}>{TIER_ICONS[plan.tier_level]}</div>
                  <h5 className="card-title mb-1">{plan.name}</h5>
                  <p className="text-muted small mb-2">{plan.description}</p>
                  <div className="mb-3">
                    <span className="h3 fw-bold">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted small"> / {plan.interval === 'year' ? 'year' : 'month'}</span>
                    )}
                  </div>

                  <ul className="list-unstyled mb-3 flex-grow-1">
                    {featureLabels.map(({ key, label }) => {
                      const included = features[key] === true;
                      const limited =
                        key === 'unlimited_enrollments' && plan.max_enrollments > 0 && plan.max_enrollments !== -1
                          ? ` (max ${plan.max_enrollments})`
                          : key === 'unlimited_courses' && plan.max_courses > 0 && plan.max_courses !== -1
                            ? ` (max ${plan.max_courses})`
                            : '';
                      return (
                        <li key={key} className="mb-1 small">
                          {included ? <span className="text-success me-1">✓</span> : <span className="text-muted me-1">—</span>}
                          {label}{limited}
                        </li>
                      );
                    })}
                  </ul>

                  {isFree ? (
                    <Link to="/register" className="btn btn-outline-primary w-100">
                      Get started
                    </Link>
                  ) : user ? (
                    <button className="btn btn-primary w-100" onClick={() => handleUpgrade(plan.code)}
                            disabled={checkoutLoading}>
                      {checkoutLoading ? 'Processing...' : 'Upgrade'}
                    </button>
                  ) : (
                    <Link to="/login" className="btn btn-primary w-100">
                      Login to upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
