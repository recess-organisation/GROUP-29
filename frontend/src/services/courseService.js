import api from './api';

export function getCourses(params = {}) {
  return api.get('/courses', { params });
}

export function getCategories() {
  return api.get('/courses/categories');
}

export function getCourse(id) {
  return api.get(`/courses/${id}`);
}

export function getTeacherCourses() {
  return api.get('/courses/teacher/my-courses');
}

export function createCourse(data) {
  return api.post('/courses', data);
}

export function updateCourse(id, data) {
  return api.put(`/courses/${id}`, data);
}

export function deleteCourse(id) {
  return api.delete(`/courses/${id}`);
}
