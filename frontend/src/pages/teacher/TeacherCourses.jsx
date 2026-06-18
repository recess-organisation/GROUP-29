import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import CourseCard from '../../components/CourseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { deleteCourse, getTeacherCourses } from '../../services/courseService';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function loadCourses() {
    const response = await getTeacherCourses();
    setCourses(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleDelete(id) {
    setDeletingId(id);
    await deleteCourse(id);
    setDeletingId(null);
    setDeleting(null);
    setMessage('Course deactivated.');
    loadCourses();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My courses</h1>
        <Link className="btn btn-primary" to="/teacher/courses/create">Create course</Link>
      </div>
      <AlertMessage type="success" message={message} />
      {deleting && (
        <Modal
          title="Deactivate course"
          message="Deactivate this course? Students will no longer see it as active."
          confirmText="Deactivate"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
      <div className="row g-3">
        {courses.map((course) => (
          <div className="col-lg-6" key={course.id}>
            <CourseCard course={course} showManageLink />
            <div className="d-flex gap-2 mt-2">
              <Link className="btn btn-outline-primary btn-sm" to={`/teacher/courses/${course.id}/edit`}>Edit</Link>
              <button className="btn btn-outline-danger btn-sm" disabled={deletingId === course.id} onClick={() => setDeleting(course.id)}>
                {deletingId === course.id ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
