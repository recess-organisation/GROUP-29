import api from './api';

export function getLessonsByCourse(courseId) {
  return api.get(`/lessons/course/${courseId}`);
}

export function createLesson(data) {
  return api.post('/lessons', data);
}

export function updateLesson(id, data) {
  return api.put(`/lessons/${id}`, data);
}

export function deleteLesson(id) {
  return api.delete(`/lessons/${id}`);
}
