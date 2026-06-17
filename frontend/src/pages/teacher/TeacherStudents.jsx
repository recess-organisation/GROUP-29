import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getTeacherCourses } from '../../services/courseService';
import { getCourseStudents } from '../../services/enrollmentService';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await getTeacherCourses();
        const all = [];
        for (const c of r.data) {
          try {
            const sR = await getCourseStudents(c.id);
            all.push(...sR.data.map(s => ({ ...s, course_title: c.title })));
          } catch (_) { /* skip */ }
        }
        setStudents(all);
      } catch (_) { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Student progress</h1>
      {students.length === 0 ? (
        <div className="content-panel"><p className="text-muted">No students enrolled in your courses yet.</p></div>
      ) : (
        <div className="content-panel">
          <div className="table-responsive">
            <table className="table align-middle">
              <thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Points</th><th>Streak</th><th>Enrolled</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={`${s.enrollment_id}`}>
                    <td><strong>{s.full_name}</strong><br /><small className="text-muted">{s.email}</small></td>
                    <td>{s.course_title}</td>
                    <td>
                      <div className="progress" style={{ height: 8, maxWidth: 100 }}><div className="progress-bar" style={{ width: `${s.progress_percentage || 0}%` }} /></div>
                      <small>{s.progress_percentage || 0}%</small>
                    </td>
                    <td>{s.points || 0}</td>
                    <td>{s.streak || 0}d</td>
                    <td><small>{new Date(s.enrolled_at).toLocaleDateString()}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
