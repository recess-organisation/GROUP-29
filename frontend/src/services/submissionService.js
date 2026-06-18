import api from './api';

export function submitAssignment(assignmentId, data) {
  return api.post(`/submissions/${assignmentId}`, data);
}

export function getMySubmissions() {
  return api.get('/submissions/my-submissions');
}

export function getAssignmentSubmissions(assignmentId) {
  return api.get(`/submissions/assignment/${assignmentId}`);
}

export function gradeSubmission(id, data) {
  return api.put(`/submissions/${id}/grade`, data);
}
