import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero-band">
        <div className="container">
          <div className="col-lg-7">
            <span className="badge text-bg-light mb-3">NITA-U Compliant Learning Platform</span>
            <h1 className="display-4 fw-bold">UGScholar</h1>
            <p className="lead">Uganda's adaptive learning platform. Access lessons via USSD, SMS, or web. Learn in 5 local languages. Earn points, badges, and airtime rewards.</p>
            <div className="d-flex gap-2">
              <Link className="btn btn-light" to="/courses">Browse courses</Link>
              <Link className="btn btn-outline-light" to="/register">Create account</Link>
            </div>
          </div>
        </div>
      </section>
      <main className="page-shell">
        <div className="row g-3 mb-4">
          <div className="col-md-4"><div className="stat-card"><h2 className="h5">🌍 Multi-Language</h2><p className="mb-0 text-muted">Luganda, Runyankole, Acholi, Ateso, English</p></div></div>
          <div className="col-md-4"><div className="stat-card"><h2 className="h5">📱 USSD Access</h2><p className="mb-0 text-muted">Dial *285# on any phone — no smartphone needed</p></div></div>
          <div className="col-md-4"><div className="stat-card"><h2 className="h5">🎮 Gamified</h2><p className="mb-0 text-muted">Points, streaks, badges & airtime rewards</p></div></div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="content-panel h-100">
              <h2 className="h5">For Students</h2>
              <p className="text-muted">Take diagnostic quizzes, learn at your pace, compete on the leaderboard, and earn airtime for top performance.</p>
              <Link className="btn btn-primary btn-sm" to="/register">Start learning</Link>
            </div>
          </div>
          <div className="col-md-6">
            <div className="content-panel h-100">
              <h2 className="h5">For Teachers</h2>
              <p className="text-muted">Create courses aligned with NCDC syllabus, upload lessons and materials, track student progress.</p>
              <Link className="btn btn-outline-primary btn-sm" to="/register">Create account</Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
