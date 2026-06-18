import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourses, updateCourseStatus } from '../../services/adminService';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);

  async function loadCourses() {
    const response = await getCourses();
    setCourses(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function toggleStatus(course) {
    setToggling(course.id);
    const status = course.status === 'active' ? 'inactive' : 'active';
    await updateCourseStatus(course.id, status);
    setToggling(null);
    setMessage(`Course marked ${status}.`);
    loadCourses();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Manage courses</h1>
      <AlertMessage type="success" message={message} />
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Course</th><th>Teacher</th><th>Category</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.title}</td>
                <td>{course.teacher_name}</td>
                <td>{course.category_name || 'General'}</td>
                <td>{course.status}</td>
                <td><button className="btn btn-outline-primary btn-sm" disabled={toggling === course.id} onClick={() => toggleStatus(course)}>{toggling === course.id ? 'Toggling...' : 'Toggle status'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
