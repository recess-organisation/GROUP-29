import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import { createAssignment } from '../../services/assignmentService';
import { getTeacherCourses } from '../../services/courseService';

export default function CreateAssignment() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course_id: '', title: '', instructions: '', due_date: '', total_marks: 100, attachment: null });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTeacherCourses().then((response) => setCourses(response.data));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      await createAssignment(data);
      setMessage('Assignment created.');
      setForm({ course_id: '', title: '', instructions: '', due_date: '', total_marks: 100, attachment: null });
      setError('');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not create assignment.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="content-panel">
      <h1 className="h3">Create assignment</h1>
      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Course</label>
            <select className="form-select" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} required>
              <option value="">Choose course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Due date</label>
            <input className="form-control" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Total marks</label>
            <input className="form-control" type="number" value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Attachment</label>
            <input className="form-control" type="file" onChange={(e) => setForm({ ...form, attachment: e.target.files[0] })} />
          </div>
          <div className="col-12">
            <label className="form-label">Instructions</label>
            <textarea className="form-control" rows="5" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} required />
          </div>
        </div>
        <button className="btn btn-primary mt-3" disabled={saving}>{saving ? 'Creating...' : 'Create assignment'}</button>
      </form>
    </div>
  );
}
