import api from './api';

export function getStats() { return api.get('/admin/stats'); }
export function getUsers() { return api.get('/admin/users'); }
export function getCourses() { return api.get('/admin/courses'); }
export function getLeaderboard() { return api.get('/admin/leaderboard'); }
export function getBadgeDefinitions() { return api.get('/admin/badges'); }
export function getSmsLogs(params) { return api.get('/admin/sms/logs', { params }); }
export function updateUserStatus(id, status) { return api.put(`/admin/users/${id}/status`, { status }); }
export function updateCourseStatus(id, status) { return api.put(`/admin/courses/${id}/status`, { status }); }
