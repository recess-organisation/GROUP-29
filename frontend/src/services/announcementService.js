import api from './api';

export function getCourseAnnouncements(courseId) {
  return api.get(`/announcements/course/${courseId}`);
}

export function createAnnouncement(data) {
  return api.post('/announcements', data);
}

export function deleteAnnouncement(id) {
  return api.delete(`/announcements/${id}`);
}
