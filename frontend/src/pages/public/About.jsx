export default function About() {
  return (
    <main className="page-shell">
      <div className="content-panel">
        <h1 className="h3">About UG Scholar</h1>
        <p>
          UG Scholar is an adaptive learning platform designed to personalize education.
          It intelligently recommends courses, tracks your progress, and adapts to your
          learning style — making education more effective and engaging.
        </p>
        <div className="row g-3 mt-2">
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="h5">Adaptive Learning</h2>
              <p className="mb-0 text-muted">Courses adapt to your pace with smart recommendations and personalized content delivery.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="h5">Progress Tracking</h2>
              <p className="mb-0 text-muted">Visual progress indicators, achievement milestones, and detailed performance analytics.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="h5">Role Based</h2>
              <p className="mb-0 text-muted">Dedicated dashboards for students, teachers, and administrators with role-specific tools.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
