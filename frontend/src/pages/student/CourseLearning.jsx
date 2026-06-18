import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LessonList from '../../components/LessonList';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourse } from '../../services/courseService';
import { getMyCourses, updateProgress } from '../../services/enrollmentService';
import { getLessonsByCourse } from '../../services/lessonService';

export default function CourseLearning() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getCourse(id), getLessonsByCourse(id), getMyCourses()])
      .then(([courseResponse, lessonResponse, enrollmentResponse]) => {
        setCourse(courseResponse.data);
        setLessons(lessonResponse.data);
        const foundEnrollment = enrollmentResponse.data.find((item) => Number(item.id) === Number(id));
        setEnrollment(foundEnrollment);
        setProgress(foundEnrollment?.progress_percentage || 0);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleProgressSubmit(event) {
    event.preventDefault();
    if (!enrollment) return;
    setSaving(true);
    await updateProgress(enrollment.enrollment_id, progress);
    setSaving(false);
    setMessage('Progress updated.');
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3">{course?.title}</h1>
      <p className="text-muted">{course?.description}</p>
      <AlertMessage type="success" message={message} />
      <div className="content-panel mb-3">
        <form className="row g-2 align-items-end" onSubmit={handleProgressSubmit}>
          <div className="col-md-9">
            <label className="form-label">Course progress</label>
            <input className="form-range" type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(e.target.value)} />
          </div>
          <div className="col-md-1 fw-bold">{progress}%</div>
          <div className="col-md-2 d-grid"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button></div>
        </form>
      </div>
      <div className="content-panel">
        <h2 className="h5">Lessons and materials</h2>
        <LessonList lessons={lessons} />
      </div>
    </>
  );
}
