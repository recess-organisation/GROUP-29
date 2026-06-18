import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAssignment } from '../../services/assignmentService';
import { submitAssignment } from '../../services/submissionService';
import formatDate from '../../utils/formatDate';

export default function SubmitAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [form, setForm] = useState({ comments: '', submission: null });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getAssignment(id).then((response) => setAssignment(response.data));
  }, [id]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    data.append('comments', form.comments);
    if (form.submission) data.append('submission', form.submission);

    try {
      await submitAssignment(id, data);
      navigate('/student/grades');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not submit assignment.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!assignment) return <LoadingSpinner />;

  return (
    <div className="content-panel">
      <h1 className="h3">{assignment.title}</h1>
      <p>{assignment.instructions}</p>
      <p className="text-muted">Due: {formatDate(assignment.due_date)} | Total marks: {assignment.total_marks}</p>
      <AlertMessage type="danger" message={error} />
      <form onSubmit={handleSubmit}>
        <label className="form-label">Submission file</label>
        <input className="form-control mb-3" type="file" onChange={(e) => setForm({ ...form, submission: e.target.files[0] })} />
        <label className="form-label">Comments</label>
        <textarea className="form-control mb-3" rows="4" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />
        <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit assignment'}</button>
      </form>
    </div>
  );
}
