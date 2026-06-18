import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAssignmentsByCourse } from '../../services/assignmentService';
import { getMyCourses } from '../../services/enrollmentService';
import formatDate from '../../utils/formatDate';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      const courseResponse = await getMyCourses();
      const assignmentLists = await Promise.all(
        courseResponse.data.map((course) => getAssignmentsByCourse(course.id).then((response) => response.data.map((assignment) => ({
          ...assignment,
          course_title: course.title
        }))))
      );
      setAssignments(assignmentLists.flat());
      setLoading(false);
    }

    loadAssignments();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3 mb-3">Assignments</h1>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Assignment</th><th>Course</th><th>Due</th><th>Marks</th><th></th></tr></thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td>{assignment.title}</td>
                <td>{assignment.course_title}</td>
                <td>{formatDate(assignment.due_date)}</td>
                <td>{assignment.total_marks}</td>
                <td><Link className="btn btn-primary btn-sm" to={`/student/assignments/${assignment.id}/submit`}>Submit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
