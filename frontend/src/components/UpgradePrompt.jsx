import { Link } from 'react-router-dom';

/**
 * UpgradePrompt — a banner or inline prompt encouraging users to upgrade.
 *
 * Props:
 * - message: string (optional, default shown)
 * - plan: 'starter' | 'plus' | 'teacher_pro' (which plan to recommend)
 * - compact: boolean (small inline version vs banner)
 * - className: string (additional CSS classes)
 */
export default function UpgradePrompt({ message, plan = 'plus', compact = false, className = '' }) {
  const planLabels = { starter: 'Starter', plus: 'Plus', teacher_pro: 'Teacher Pro' };
  const planLabel = planLabels[plan] || 'Plus';

  if (compact) {
    return (
      <small className={`text-muted d-block ${className}`}>
        <Link to={`/pricing?plan=${plan}`} className="text-decoration-none">
          🔒 Upgrade to <strong>{planLabel}</strong> to unlock this feature
        </Link>
      </small>
    );
  }

  return (
    <div className={`content-panel text-center py-4 ${className}`}
         style={{ background: 'linear-gradient(135deg, #FFF0F0 0%, #FFE4E4 100%)' }}>
      <div className="mb-2" style={{ fontSize: '2rem' }}>🔒</div>
      <h5 className="mb-1">Premium feature</h5>
      <p className="text-muted mb-3">{message || `Upgrade to ${planLabel} to access this feature and more.`}</p>
      <Link to={`/pricing?plan=${plan}`} className="btn btn-primary">
        See plans
      </Link>
    </div>
  );
}
