import api from './api';

export function createAssignment(data) {
  return api.post('/assignments', data);
}

export function getAssignmentsByCourse(courseId) {
  return api.get(`/assignments/course/${courseId}`);
}

export function getAssignment(id) {
  return api.get(`/assignments/${id}`);
}

export function updateAssignment(id, data) {
  return api.put(`/assignments/${id}`, data);
}

export function deleteAssignment(id) {
  return api.delete(`/assignments/${id}`);
}
