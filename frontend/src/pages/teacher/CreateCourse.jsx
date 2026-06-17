import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import { createCourse, getTiers, getSubjects } from '../../services/courseService';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ tier_id: '', subject_id: '', title: '', description: '', level: 'Beginner', duration: '', language_code: 'en' });
  const [error, setError] = useState('');

  useEffect(() => {
    getTiers().then(r => setTiers(r.data));
  }, []);

  useEffect(() => {
    if (form.tier_id) getSubjects({ tier_id: form.tier_id }).then(r => setSubjects(r.data));
    else setSubjects([]);
  }, [form.tier_id]);

  async function handleSubmit(e) {
    e.preventDefault(); setError('');
    try { await createCourse(form); navigate('/teacher/courses'); }
    catch (apiError) { setError(apiError.response?.data?.message || 'Could not create course.'); }
  }

  return (
    <div className="content-panel">
      <h1 className="h3">Create course</h1>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-8"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required /></div>
          <div className="col-md-4"><label className="form-label">Level</label><select className="form-select" value={form.level} onChange={e => setForm({...form, level: e.target.value})}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
          <div className="col-md-4"><label className="form-label">Learning tier</label><select className="form-select" value={form.tier_id} onChange={e => setForm({...form, tier_id: e.target.value, subject_id: ''})}><option value="">Select tier</option>{tiers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Subject</label><select className="form-select" value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})}><option value="">Select subject</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="col-md-4"><label className="form-label">Duration</label><input className="form-control" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="8 weeks" /></div>
          <div className="col-12"><label className="form-label">Description</label><textarea className="form-control" rows="5" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required /></div>
        </div>
        <button className="btn btn-primary mt-3">Save course</button>
      </form>
    </div>
  );
}
