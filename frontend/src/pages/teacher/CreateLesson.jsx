import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { createLesson } from '../../services/lessonService';

export default function CreateLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', content: '', lesson_order: 1, materials: null });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const data = new FormData();
    data.append('course_id', id);
    data.append('title', form.title);
    data.append('content', form.content);
    data.append('lesson_order', form.lesson_order);
    Array.from(form.materials || []).forEach((file) => data.append('materials', file));

    try {
      await createLesson(data);
      navigate(`/teacher/courses/${id}/lessons`);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not create lesson.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content-panel">
      <h1 className="h3">Create lesson</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <label className="form-label">Title</label>
        <input className="form-control mb-3" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <label className="form-label">Lesson order</label>
        <input className="form-control mb-3" type="number" min="1" value={form.lesson_order} onChange={(e) => setForm({ ...form, lesson_order: e.target.value })} />
        <label className="form-label">Content</label>
        <textarea className="form-control mb-3" rows="6" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        <label className="form-label">Materials</label>
        <input className="form-control mb-3" type="file" multiple onChange={(e) => setForm({ ...form, materials: e.target.files })} />
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save lesson'}</button>
      </form>
    </div>
  );
}
