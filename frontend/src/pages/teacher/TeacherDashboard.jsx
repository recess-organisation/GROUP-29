import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getTeacherCourses } from '../../services/courseService';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const r = await getTeacherCourses();
        setCourses(r.data);
        const allStudents = [];
        for (const c of r.data) {
          try {
            const sR = await import('../../services/enrollmentService').then(m => m.getCourseStudents(c.id));
            allStudents.push(...sR.data.map(s => ({ ...s, course_title: c.title })));
          } catch (_) { /* no students yet */ }
        }
        setStudents(allStudents);
      } catch (_) { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalStudents = courses.reduce((s, c) => s + Number(c.enrolled_students || 0), 0);
  const totalLessons = courses.reduce((s) => s + 1, 0); // simplified
  const activeCourses = courses.filter(c => c.status === 'active');

  return (
    <>
      <h1 className="h3 mb-3">Teacher dashboard</h1>
      <div className="row g-3 mb-3">
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Courses</div><div className="h2">{courses.length}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Active courses</div><div className="h2">{activeCourses.length}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">Students</div><div className="h2">{totalStudents}</div></div></div>
        <div className="col-md-3"><div className="stat-card"><div className="text-muted">New this week</div><div className="h2">{students.filter(s => new Date(s.enrolled_at) > new Date(Date.now() - 7*86400000)).length}</div></div></div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="content-panel h-100">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">My courses</h2>
              <Link className="btn btn-primary btn-sm" to="/teacher/courses/create">Create course</Link>
            </div>
            <hr />
            {courses.length === 0 ? <p className="text-muted">No courses yet.</p> : (
              <div className="list-group">
                {courses.map(c => (
                  <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{c.title}</strong><br />
                      <small className="text-muted">{c.enrolled_students || 0} students · {c.status}</small>
                    </div>
                    <div className="d-flex gap-1">
                      <Link className="btn btn-outline-primary btn-sm" to={`/teacher/courses/${c.id}/edit`}>Edit</Link>
                      <Link className="btn btn-primary btn-sm" to={`/teacher/courses/${c.id}/lessons`}>Lessons</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="content-panel h-100">
            <h2 className="h5">Recent students</h2>
            <hr />
            {students.length === 0 ? <p className="text-muted">No students enrolled yet.</p> : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Enrolled</th></tr></thead>
                  <tbody>
                    {students.slice(0, 10).map(s => (
                      <tr key={`${s.enrollment_id}`}>
                        <td>{s.full_name}</td>
                        <td><small>{s.course_title}</small></td>
                        <td><div className="progress" style={{ height: 6, width: 60 }}><div className="progress-bar" style={{ width: `${s.progress_percentage || 0}%` }} /></div><small>{s.progress_percentage || 0}%</small></td>
                        <td><small>{new Date(s.enrolled_at).toLocaleDateString()}</small></td>
                      </tr>
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
