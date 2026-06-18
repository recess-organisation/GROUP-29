import api from './api';

export function getStats() {
  return api.get('/admin/stats');
}

export function getUsers() {
  return api.get('/admin/users');
}

export function getCourses() {
  return api.get('/admin/courses');
}

export function updateUserStatus(id, status) {
  return api.put(`/admin/users/${id}/status`, { status });
}

export function updateCourseStatus(id, status) {
  return api.put(`/admin/courses/${id}/status`, { status });
}

export function getAdminCategories() {
  return api.get('/admin/categories');
}

export function createCategory(data) {
  return api.post('/admin/categories', data);
}

export function updateCategory(id, data) {
  return api.put(`/admin/categories/${id}`, data);
}
