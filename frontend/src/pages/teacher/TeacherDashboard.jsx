import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getTeacherCourses } from '../../services/courseService';

export default function TeacherDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherCourses()
      .then((response) => setCourses(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalStudents = courses.reduce((sum, course) => sum + Number(course.enrolled_students || 0), 0);

  return (
    <>
      <h1 className="h3 mb-3">Teacher dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Courses</div><div className="h2">{courses.length}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Students enrolled</div><div className="h2">{totalStudents}</div></div></div>
        <div className="col-md-4"><div className="stat-card"><div className="text-muted">Active courses</div><div className="h2">{courses.filter((course) => course.status === 'active').length}</div></div></div>
      </div>
      <div className="content-panel">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">Recent courses</h2>
          <Link className="btn btn-primary btn-sm" to="/teacher/courses/create">Create course</Link>
        </div>
        <hr />
        {courses.slice(0, 5).map((course) => (
          <div className="d-flex justify-content-between border-bottom py-2" key={course.id}>
            <span>{course.title}</span>
            <span className="text-muted">{course.enrolled_students || 0} students</span>
          </div>
        ))}
      </div>
    </>
  );
}
