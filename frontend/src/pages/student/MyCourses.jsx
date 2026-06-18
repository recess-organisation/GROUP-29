import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMyCourses } from '../../services/enrollmentService';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCourses()
      .then((response) => setCourses(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My courses</h1>
        <Link className="btn btn-primary" to="/courses">Browse courses</Link>
      </div>
      <div className="row g-3">
        {courses.map((course) => (
          <div className="col-md-6" key={course.enrollment_id}>
            <div className="course-card">
              <span className="badge badge-soft mb-2">{course.category_name || 'General'}</span>
              <h2 className="h5">{course.title}</h2>
              <p className="text-muted">{course.description}</p>
              <div className="progress mb-3" role="progressbar">
                <div className="progress-bar" style={{ width: `${course.progress_percentage || 0}%` }}>{course.progress_percentage || 0}%</div>
              </div>
              <Link className="btn btn-primary btn-sm" to={`/student/courses/${course.id}/learn`}>Open learning page</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
