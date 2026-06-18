import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { createCourse, getCategories } from '../../services/courseService';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category_id: '', level: 'Beginner', duration: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then((response) => setCategories(response.data));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      await createCourse(form);
      navigate('/teacher/courses');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not create course.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content-panel">
      <h1 className="h3">Create course</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Choose category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Level</label>
            <select className="form-select" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Duration</label>
            <input className="form-control" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="8 weeks" />
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
        </div>
        <button className="btn btn-primary mt-3" disabled={saving}>{saving ? 'Saving...' : 'Save course'}</button>
      </form>
    </div>
  );
}
