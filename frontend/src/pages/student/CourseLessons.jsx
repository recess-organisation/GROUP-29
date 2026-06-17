import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourse } from '../../services/courseService';
import { getLessonsByCourse } from '../../services/lessonService';
import { uploadsBaseUrl } from '../../services/api';

export default function CourseLessons() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cR, lR] = await Promise.all([getCourse(id), getLessonsByCourse(id)]);
        setCourse(cR.data);
        setLessons(lR.data);
        if (lR.data.length > 0) setActiveLesson(lR.data[0]);
      } catch (_) { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!course) return <div className="content-panel"><p className="text-muted">Course not found.</p></div>;

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <div className="content-panel">
          <h2 className="h5 mb-3">{course.title} — lessons</h2>
          {lessons.length === 0 ? (
            <p className="text-muted">No lessons available yet.</p>
          ) : (
            <div className="list-group">
              {lessons.map(l => (
                <button key={l.id} className={`list-group-item list-group-item-action ${activeLesson?.id === l.id ? 'active' : ''}`}
                  onClick={() => setActiveLesson(l)}>
                  <strong>{l.lesson_order}.</strong> {l.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="col-md-8">
        {activeLesson ? (
          <div className="content-panel">
            <h1 className="h4 mb-3">{activeLesson.title}</h1>
            <div style={{ whiteSpace: 'pre-wrap' }}>{activeLesson.content}</div>
            {activeLesson.materials?.length > 0 && (
              <div className="mt-3">
                <h2 className="h5">Materials</h2>
                <ul className="list-group">
                  {activeLesson.materials.map(m => (
                    <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {m.file_name}
                      <a className="btn btn-sm btn-outline-primary" href={`${uploadsBaseUrl}/${m.file_path}`} target="_blank" rel="noopener noreferrer">Download</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="content-panel"><p className="text-muted">Select a lesson to view.</p></div>
        )}
      </div>
    </div>
  );
}
