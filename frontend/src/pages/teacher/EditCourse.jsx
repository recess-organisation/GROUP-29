import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourse, updateCourse, getTiers, getSubjects } from '../../services/courseService';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getCourse(id), getTiers()]).then(([cR, tR]) => {
      setForm(cR.data); setTiers(tR.data);
      if (cR.data.tier_id) getSubjects({ tier_id: cR.data.tier_id }).then(r => setSubjects(r.data));
    });
  }, [id]);

  useEffect(() => {
    if (form?.tier_id) getSubjects({ tier_id: form.tier_id }).then(r => setSubjects(r.data));
    else setSubjects([]);
  }, [form?.tier_id]);

  async function handleSubmit(e) {
    e.preventDefault();
    try { await updateCourse(id, form); navigate('/teacher/courses'); }
    catch (apiError) { setError(apiError.response?.data?.message || 'Could not update course.'); }
  }

  if (!form) return <LoadingSpinner />;
  return (
    <div className="content-panel">
      <h1 className="h3">Edit course</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
          <div className="col-md-4"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
          <div className="col-md-4"><label className="form-label">Tier</label><select className="form-select" value={form.tier_id || ''} onChange={e => setForm({...form, tier_id: e.target.value, subject_id: ''})}><option value="">Select</option>{tiers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Subject</label><select className="form-select" value={form.subject_id || ''} onChange={e => setForm({...form, subject_id: e.target.value})}><option value="">Select</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Duration</label><input className="form-control" value={form.duration || ''} onChange={e => setForm({...form, duration: e.target.value})} /></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="5" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
        </div>
        <button className="btn btn-primary mt-3">Update course</button>
      </form>
    </div>
  );
}
