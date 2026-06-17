import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourse } from '../../services/courseService';
import { getLessonsByCourse, createLesson, updateLesson, deleteLesson } from '../../services/lessonService';

const emptyForm = { course_id: '', title: '', content: '', lesson_order: 1, materials: [] };

export default function ManageLessons() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...emptyForm, course_id: id });
  const [editing, setEditing] = useState(null);

  async function load() {
    const [cR, lR] = await Promise.all([getCourse(id), getLessonsByCourse(id)]);
    setCourse(cR.data); setLessons(lR.data); setLoading(false);
  }
  useEffect(() => { load(); }, [id]);

  function resetForm() { setForm({ ...emptyForm, course_id: id }); setEditing(null); }

  function startEdit(lesson) {
    setForm({ course_id: id, title: lesson.title, content: lesson.content || '', lesson_order: lesson.lesson_order, materials: [] });
    setEditing(lesson.id);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.append('course_id', id);
    fd.append('title', form.title);
    fd.append('content', form.content);
    fd.append('lesson_order', form.lesson_order);
    for (const file of form.materials) fd.append('materials', file);

    if (editing) {
      await updateLesson(editing, fd);
      setMessage('Lesson updated.');
    } else {
      await createLesson(fd);
      setMessage('Lesson created.');
    }
    resetForm();
    load();
  }

  async function handleDelete(lessonId) {
    if (!window.confirm('Deactivate this lesson?')) return;
    await deleteLesson(lessonId);
    setMessage('Lesson deactivated.');
    load();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Lessons: {course?.title}</h1>
      </div>
      <AlertMessage type="success" message={message} />
      <div className="row g-3">
        <div className="col-md-5">
          <div className="content-panel">
            <h2 className="h5">{editing ? 'Edit lesson' : 'Add lesson'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-2"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
              <div className="row mb-2">
                <div className="col-6"><label className="form-label">Order</label><input className="form-control" type="number" min="1" value={form.lesson_order} onChange={e => setForm({...form, lesson_order: e.target.value})} /></div>
              </div>
              <div className="mb-2"><label className="form-label">Content</label><textarea className="form-control" rows="5" value={form.content} onChange={e => setForm({...form, content: e.target.value})} /></div>
              <div className="mb-2"><label className="form-label">Materials (images, PDFs, etc.)</label><input className="form-control" type="file" multiple onChange={e => setForm({...form, materials: [...e.target.files]})} /></div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary">{editing ? 'Update' : 'Save'} lesson</button>
                {editing && <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>Cancel</button>}
              </div>
            </form>
          </div>
        </div>
        <div className="col-md-7">
          <div className="content-panel">
            <h2 className="h5">Lessons ({lessons.length})</h2>
            {lessons.length === 0 ? <p className="text-muted">No lessons yet</p> : (
              <div className="list-group">
                {lessons.map(l => (
                  <div className="list-group-item" key={l.id}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div><strong>{l.lesson_order}.</strong> {l.title}</div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-primary btn-sm" onClick={() => startEdit(l)}>Edit</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(l.id)}>Deactivate</button>
                      </div>
                    </div>
                    {l.content && <small className="text-muted">{l.content.slice(0, 120)}</small>}
                    {l.materials?.length > 0 && <div className="mt-1"><small className="text-info">{l.materials.length} material(s)</small></div>}
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
