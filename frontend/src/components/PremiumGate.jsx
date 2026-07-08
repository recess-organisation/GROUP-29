import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMySubscription } from '../services/subscriptionService';
import UpgradePrompt from './UpgradePrompt';
import LoadingSpinner from './LoadingSpinner';

/**
 * PremiumGate — wraps content that requires a premium feature.
 *
 * Props:
 * - feature: string — the feature key to check (e.g. 'advanced_analytics', 'data_export')
 * - children: ReactNode — content to show if the user has access
 * - fallback: ReactNode — optional custom fallback if no access
 * - plan: 'starter' | 'plus' | 'teacher_pro' — which plan to recommend
 * - message: string — custom message for the upgrade prompt
 *
 * Usage:
 *   <PremiumGate feature="advanced_analytics">
 *     <AnalyticsCharts />
 *   </PremiumGate>
 */
export default function PremiumGate({ feature, children, fallback, plan = 'plus', message }) {
  const { user } = useAuth();
  const [planInfo, setPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    getMySubscription()
      .then((response) => setPlanInfo(response.data.plan))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return null;
  if (!user) return null; // Let ProtectedRoute handle auth
  if (!planInfo) return fallback || <UpgradePrompt plan={plan} message={message} />;

  const hasAccess = planInfo.features && planInfo.features[feature] === true;
  if (hasAccess) return children;

  return fallback || <UpgradePrompt plan={plan} message={message} />;
}
