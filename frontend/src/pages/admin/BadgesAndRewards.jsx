import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getBadgeDefinitions, getLeaderboard } from '../../services/adminService';

export default function BadgesAndRewards() {
  const [badges, setBadges] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBadgeDefinitions(), getLeaderboard()]).then(([b, l]) => {
      setBadges(b.data); setLeaderboard(l.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const thresholds = [
    { points: 500, label: '2,000 UGX airtime' },
    { points: 1000, label: '5,000 UGX airtime' },
    { points: 2500, label: '10,000 UGX airtime' },
    { points: 5000, label: '25,000 UGX airtime' },
  ];

  return (
    <>
      <h1 className="h3 mb-3">Badges & Rewards</h1>
      <div className="row g-3">
        <div className="col-md-6">
          <div className="content-panel mb-3">
            <h2 className="h5">Available badges</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Icon</th><th>Badge</th><th>Description</th></tr></thead>
                <tbody>
                  {Object.entries(badges).map(([key, b]) => (
                    <tr key={key}><td style={{ fontSize: '1.5rem' }}>{b.icon}</td><td><strong>{b.name}</strong></td><td>{b.description}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="content-panel">
            <h2 className="h5">Airtime reward thresholds</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead><tr><th>Points required</th><th>Reward</th></tr></thead>
                <tbody>
                  {thresholds.map((t, i) => (
                    <tr key={i}><td><strong>{t.points}</strong> pts</td><td className="text-success fw-bold">{t.label}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="content-panel">
            <h2 className="h5">Top learners</h2>
            {leaderboard.length === 0 ? <p className="text-muted">No learners yet</p> : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead><tr><th>#</th><th>Name</th><th>Points</th><th>Streak</th></tr></thead>
                  <tbody>
                    {leaderboard.map((u, i) => (
                      <tr key={i}><td>{i + 1}</td><td><strong>{u.full_name}</strong></td><td>{u.points}</td><td>{u.streak} days</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
