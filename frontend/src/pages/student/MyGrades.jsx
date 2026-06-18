import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMySubmissions } from '../../services/submissionService';
import { uploadsBaseUrl } from '../../services/api';
import formatDate from '../../utils/formatDate';

export default function MyGrades() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMySubmissions()
      .then((response) => setSubmissions(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Grades and feedback</h1>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Assignment</th><th>Course</th><th>Submitted</th><th>File</th><th>Marks</th><th>Feedback</th></tr></thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.assignment_title}</td>
                <td>{submission.course_title}</td>
                <td>{formatDate(submission.submitted_at)}</td>
                <td>{submission.file_path ? <a href={`${uploadsBaseUrl}/${submission.file_path}`} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">Download</a> : 'No file'}</td>
                <td>{submission.marks_awarded ?? 'Pending'} / {submission.total_marks}</td>
                <td>{submission.feedback || 'No feedback yet'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
