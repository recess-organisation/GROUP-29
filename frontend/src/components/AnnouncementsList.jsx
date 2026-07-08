import { useEffect, useState } from 'react';
import AlertMessage from './AlertMessage';
import LoadingSpinner from './LoadingSpinner';
import { getCourseAnnouncements, createAnnouncement, deleteAnnouncement } from '../services/announcementService';
import { useAuth } from '../context/AuthContext';
import formatDate from '../utils/formatDate';

export default function AnnouncementsList({ courseId, canManage = false }) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });
  const [creating, setCreating] = useState(false);

  async function loadAnnouncements() {
    try {
      const response = await getCourseAnnouncements(courseId);
      setAnnouncements(response.data);
    } catch {
      // Silently fail — announcements are supplementary
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId) loadAnnouncements();
  }, [courseId]);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      await createAnnouncement({ course_id: courseId, title: form.title, message: form.message });
      setMessage('Announcement posted.');
      setForm({ title: '', message: '' });
      setShowForm(false);
      loadAnnouncements();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Could not create announcement.');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAnnouncement(id);
      setMessage('Announcement deleted.');
      loadAnnouncements();
    } catch {
      setError('Could not delete announcement.');
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="announcements-section">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h3 className="h5 mb-0">Announcements</h3>
        {canManage && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'New announcement'}
          </button>
        )}
      </div>

      <AlertMessage type="success" message={message} />
      <AlertMessage type="danger" message={error} />

      {showForm && canManage && (
        <form onSubmit={handleCreate} className="content-panel mb-3 p-3">
          <div className="mb-2">
            <input className="form-control" placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="mb-2">
            <textarea className="form-control" rows={3} placeholder="Message" value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <button className="btn btn-primary btn-sm" disabled={creating}>
            {creating ? 'Posting...' : 'Post announcement'}
          </button>
        </form>
      )}

      {announcements.length === 0 && !loading && (
        <p className="text-muted small">No announcements yet.</p>
      )}

      {announcements.map((announcement) => (
        <div key={announcement.id} className="border rounded-3 p-3 mb-2">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <strong>{announcement.title}</strong>
              <p className="mb-0 mt-1">{announcement.message}</p>
            </div>
            {canManage && (
              <button className="btn btn-outline-danger btn-sm ms-2" onClick={() => handleDelete(announcement.id)}>×</button>
            )}
          </div>
          <small className="text-muted">
            {announcement.author_name} — {formatDate(announcement.created_at)}
          </small>
        </div>
      ))}
    </div>
  );
}
