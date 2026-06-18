import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyCourses } from '../../services/enrollmentService';
import { getMySubmissions } from '../../services/submissionService';

export default function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyCourses(), getMySubmissions()])
      .then(([courseResponse, submissionResponse]) => {
        setCourses(courseResponse.data);
        setSubmissions(submissionResponse.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const averageProgress = courses.length
    ? Math.round(courses.reduce((sum, course) => sum + Number(course.progress_percentage || 0), 0) / courses.length)
    : 0;

  return (
    <>
      <h1 className="h3 mb-3">Student dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Enrolled courses</div><div className="h2">{courses.length}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Average progress</div><div className="h2">{averageProgress}%</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Submissions</div><div className="h2">{submissions.length}</div></div></div>
      </div>
      <div className="content-panel">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">Continue learning</h2>
          <Link className="btn btn-primary btn-sm" to="/courses">Browse more</Link>
        </div>
        <hr />
        {courses.slice(0, 5).map((course) => (
          <div className="d-flex justify-content-between align-items-center border-bottom py-2" key={course.enrollment_id}>
            <span>{course.title}</span>
            <Link className="btn btn-outline-primary btn-sm" to={`/student/courses/${course.id}/learn`}>Open</Link>
          </div>
        ))}
      </div>
    </>
  );
}
