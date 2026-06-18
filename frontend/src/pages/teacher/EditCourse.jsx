import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCategories, getCourse, updateCourse } from '../../services/courseService';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getCourse(id), getCategories()]).then(([courseResponse, categoryResponse]) => {
      setForm(courseResponse.data);
      setCategories(categoryResponse.data);
    });
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateCourse(id, form);
      navigate('/teacher/courses');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not update course.');
    } finally {
      setSaving(false);
    }
  }

  if (!form) return <LoadingSpinner />;

  return (
    <div className="content-panel">
      <h1 className="h3">Edit course</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category_id || ''} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">Choose category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Level</label>
            <input className="form-control" value={form.level || ''} onChange={(e) => setForm({ ...form, level: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Duration</label>
            <input className="form-control" value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
        </div>
        <button className="btn btn-primary mt-3" disabled={saving}>{saving ? 'Updating...' : 'Update course'}</button>
      </form>
    </div>
  );
}
