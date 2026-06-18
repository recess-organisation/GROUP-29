import api from './api';

export function enrollInCourse(courseId) {
  return api.post(`/enrollments/${courseId}`);
}

export function getMyCourses() {
  return api.get('/enrollments/my-courses');
}

export function getCourseStudents(courseId) {
  return api.get(`/enrollments/course/${courseId}`);
}

export function updateProgress(enrollmentId, progress_percentage) {
  return api.put(`/enrollments/${enrollmentId}/progress`, { progress_percentage });
}
