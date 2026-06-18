import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { createCategory, getAdminCategories, updateCategory } from '../../services/adminService';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toggling, setToggling] = useState(null);

  async function loadCategories() {
    const response = await getAdminCategories();
    setCategories(response.data);
    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    await createCategory(form);
    setForm({ name: '', description: '' });
    setSubmitting(false);
    setMessage('Category created.');
    loadCategories();
  }

  async function toggleStatus(category) {
    setToggling(category.id);
    const status = category.status === 'active' ? 'inactive' : 'active';
    await updateCategory(category.id, { status });
    setToggling(null);
    setMessage(`Category marked ${status}.`);
    loadCategories();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Manage categories</h1>
      <AlertMessage type="success" message={message} />
      <div className="content-panel mb-3">
        <form className="row g-2" onSubmit={handleSubmit}>
          <div className="col-md-4">
            <input className="form-control" placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="col-md-6">
            <input className="form-control" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Adding...' : 'Add'}</button>
          </div>
        </form>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Name</th><th>Description</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description}</td>
                <td>{category.status}</td>
                <td><button className="btn btn-outline-primary btn-sm" disabled={toggling === category.id} onClick={() => toggleStatus(category)}>{toggling === category.id ? 'Toggling...' : 'Toggle status'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
