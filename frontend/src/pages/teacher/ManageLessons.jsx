import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getLessonsByCourse, createLesson, deleteLesson } from '../../services/lessonService';

export default function ManageLessons() {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);

  async function load() {
    const r = await getLessonsByCourse(id);
    setLessons(r.data); setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  async function handleCreate(e) {
    e.preventDefault();
    await createLesson({ course_id: id, title, content, lesson_order: order });
    setMessage('Lesson created.'); setTitle(''); setContent(''); setOrder(lessons.length + 1);
    load();
  }

  async function handleDelete(lessonId) {
    if (!window.confirm('Deactivate this lesson?')) return;
    await deleteLesson(lessonId); setMessage('Lesson deactivated.'); load();
  }

  if (loading) return <LoadingSpinner />;
  return (
    <>
      <h1 className="h3 mb-3">Manage lessons</h1>
      <AlertMessage type="success" message={message} />
      <div className="row g-3">
        <div className="col-md-5">
          <div className="content-panel">
            <h2 className="h5">Add lesson</h2>
            <form onSubmit={handleCreate}>
              <div className="mb-2"><label className="form-label">Title</label><input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required /></div>
              <div className="mb-2"><label className="form-label">Order</label><input className="form-control" type="number" min="1" value={order} onChange={e => setOrder(e.target.value)} /></div>
              <div className="mb-2"><label className="form-label">Content</label><textarea className="form-control" rows="4" value={content} onChange={e => setContent(e.target.value)} /></div>
              <button className="btn btn-primary">Save lesson</button>
            </form>
          </div>
        </div>
        <div className="col-md-7">
          <div className="content-panel">
            <h2 className="h5">Lessons ({lessons.length})</h2>
            {lessons.length === 0 ? <p className="text-muted">No lessons yet</p> : (
              <div className="list-group">
                {lessons.map(l => (
                  <div className="list-group-item d-flex justify-content-between align-items-center" key={l.id}>
                    <div><strong>{l.lesson_order}.</strong> {l.title}<br /><small className="text-muted">{l.content?.slice(0, 60)}</small></div>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(l.id)}>Deactivate</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
