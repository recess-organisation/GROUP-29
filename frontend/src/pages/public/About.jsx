export default function About() {
  return (
    <main className="page-shell">
      <div className="content-panel">
        <h1 className="h3">About UGScholar</h1>
        <p>UGScholar is an adaptive learning platform designed for Uganda, following the NCDC syllabus. It is accessible via USSD on any MTN or Airtel line — no smartphone or internet required.</p>
        <div className="row g-3 mt-2">
          <div className="col-md-4"><div className="stat-card"><h2 className="h5">📚 NCDC Syllabus</h2><p className="mb-0 text-muted">Content aligned with Uganda's national curriculum for Primary, O-Level, A-Level, and Adult Literacy.</p></div></div>
          <div className="col-md-4"><div className="stat-card"><h2 className="h5">🔐 Parental Controls</h2><p className="mb-0 text-muted">Age-verified access with parent PIN for learners under 18.</p></div></div>
          <div className="col-md-4"><div className="stat-card"><h2 className="h5">🏆 Airtime Rewards</h2><p className="mb-0 text-muted">Top learners earn MTN/Airtel airtime based on points and streaks.</p></div></div>
        </div>
      </div>
    </main>
  );
}
