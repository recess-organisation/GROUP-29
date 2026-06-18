import { useEffect, useState } from 'react';
import AlertMessage from '../../components/AlertMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { getAssignmentsByCourse } from '../../services/assignmentService';
import { getTeacherCourses } from '../../services/courseService';
import { getAssignmentSubmissions, gradeSubmission } from '../../services/submissionService';
import { uploadsBaseUrl } from '../../services/api';
import formatDate from '../../utils/formatDate';

export default function ViewSubmissions() {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null);
  const [marksValue, setMarksValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    getTeacherCourses()
      .then((response) => setCourses(response.data))
      .finally(() => setLoading(false));
  }, []);

  async function loadAssignments(courseId) {
    setSelectedCourse(courseId);
    setSelectedAssignment('');
    setSubmissions([]);
    if (courseId) {
      const response = await getAssignmentsByCourse(courseId);
      setAssignments(response.data);
    }
  }

  async function loadSubmissions(assignmentId) {
    setSelectedAssignment(assignmentId);
    if (assignmentId) {
      const response = await getAssignmentSubmissions(assignmentId);
      setSubmissions(response.data);
    }
  }

  function startGrade(submission) {
    setGrading(submission);
    setMarksValue(submission.marks_awarded || '');
    setShowFeedback(false);
  }

  function confirmMarks() {
    setShowFeedback(true);
  }

  async function confirmFeedback() {
    await gradeSubmission(grading.id, { marks_awarded: marksValue, feedback: feedbackValue });
    setMessage('Submission graded.');
    setGrading(null);
    setShowFeedback(false);
    loadSubmissions(selectedAssignment);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">View submissions</h1>
      <AlertMessage type="success" message={message} />
      {grading && !showFeedback && (
        <Modal
          title="Grade submission"
          message={`Student: ${grading.student_name}`}
          confirmText="Next"
          inputLabel="Marks awarded"
          inputType="number"
          inputValue={marksValue}
          onInputChange={setMarksValue}
          onCancel={() => setGrading(null)}
          onConfirm={confirmMarks}
        />
      )}
      {grading && showFeedback && (
        <Modal
          title="Grade submission"
          message={`Marks: ${marksValue}`}
          confirmText="Submit"
          inputLabel="Feedback"
          inputValue={feedbackValue}
          onInputChange={setFeedbackValue}
          onCancel={() => { setGrading(null); setShowFeedback(false); }}
          onConfirm={confirmFeedback}
        />
      )}
      <div className="content-panel mb-3">
        <div className="row g-2">
          <div className="col-md-6">
            <select className="form-select" value={selectedCourse} onChange={(e) => loadAssignments(e.target.value)}>
              <option value="">Choose course</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <select className="form-select" value={selectedAssignment} onChange={(e) => loadSubmissions(e.target.value)}>
              <option value="">Choose assignment</option>
              {assignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Student</th><th>Submitted</th><th>File</th><th>Comments</th><th>Status</th><th>Marks</th><th>Action</th></tr></thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.student_name}<br /><span className="text-muted small">{submission.student_email}</span></td>
                <td>{formatDate(submission.submitted_at)}</td>
                <td>{submission.file_path ? <a href={`${uploadsBaseUrl}/${submission.file_path}`} target="_blank" rel="noreferrer" className="btn btn-outline-secondary btn-sm">Download</a> : 'No file'}</td>
                <td className="text-muted small">{submission.comments || '—'}</td>
                <td>{submission.status}</td>
                <td>{submission.marks_awarded ?? 'Not graded'}</td>
                <td><button className="btn btn-outline-primary btn-sm" onClick={() => startGrade(submission)}>Grade</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
