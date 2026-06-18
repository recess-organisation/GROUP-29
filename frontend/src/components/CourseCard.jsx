import { Link } from 'react-router-dom';

export default function CourseCard({ course, onEnroll, showManageLink = false, enrolling }) {
  return (
    <div className="course-card d-flex flex-column">
      <div className="d-flex justify-content-between gap-2 mb-2">
        <span className="badge badge-soft">{course.category_name || 'General'}</span>
        <span className="badge text-bg-light">{course.level}</span>
      </div>
      <h5>{course.title}</h5>
      <p className="text-muted flex-grow-1">{course.description}</p>
      <div className="small text-muted mb-3">
        <div>Teacher: {course.teacher_name || 'You'}</div>
        <div>Duration: {course.duration || 'Self-paced'}</div>
      </div>
      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-outline-primary btn-sm" to={`/courses/${course.id}`}>Details</Link>
        {onEnroll && (
          <button className="btn btn-success btn-sm" disabled={enrolling === course.id} onClick={() => onEnroll(course.id)}>
            {enrolling === course.id ? 'Enrolling...' : 'Enroll'}
          </button>
        )}
        {showManageLink && <Link className="btn btn-primary btn-sm" to={`/teacher/courses/${course.id}/lessons`}>Manage</Link>}
      </div>
    </div>
  );
}
