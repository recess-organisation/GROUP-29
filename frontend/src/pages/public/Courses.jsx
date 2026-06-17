import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getCourses, getTiers, getSubjects } from '../../services/courseService';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', tier: '', subject: '', language: '' });

  useEffect(() => {
    getTiers().then(r => setTiers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.tier) getSubjects({ tier_id: filters.tier }).then(r => setSubjects(r.data)).catch(() => {});
    else setSubjects([]);
  }, [filters.tier]);

  useEffect(() => {
    getCourses(filters).then(r => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-shell">
      <h1 className="h3 mb-3">Course catalog</h1>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input className="form-control" placeholder="Search courses..." value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filters.tier}
            onChange={e => setFilters({ ...filters, tier: e.target.value, subject: '' })}>
            <option value="">All tiers</option>
            {tiers.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select" value={filters.subject}
            onChange={e => setFilters({ ...filters, subject: e.target.value })} disabled={!filters.tier}>
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>
      {courses.length === 0 ? (
        <div className="content-panel"><p className="text-muted">No courses found.</p></div>
      ) : (
        <div className="row g-3">
          {courses.map(c => (
            <div className="col-md-6" key={c.id}>
              <div className="course-card d-flex flex-column">
                <h5>{c.title}</h5>
                <p className="text-muted flex-grow-1">{c.description}</p>
                <div className="small text-muted mb-2">
                  <div>Teacher: {c.teacher_name} | Tier: {c.tier_name || '—'} | Subject: {c.subject_name || '—'}</div>
                  <div>Level: {c.level} | Duration: {c.duration || 'Self-paced'} | Students: {c.enrolled_students || 0}</div>
                </div>
                <Link className="btn btn-primary btn-sm align-self-start" to={`/courses/${c.id}`}>View course</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
