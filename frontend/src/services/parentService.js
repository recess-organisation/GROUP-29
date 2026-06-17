import api from './api';

export function getMyChildren() { return api.get('/users/parent/children'); }
export function linkChild(email) { return api.post('/users/parent/children', { email }); }
export function getChildProgress(studentId) { return api.get(`/users/parent/children/${studentId}`); }
