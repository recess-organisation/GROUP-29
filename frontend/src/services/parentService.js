import api from './api';

export function getParentDashboard() {
  return api.get('/parent/dashboard');
}

export function linkChild(email) {
  return api.post('/parent/children/link', { childEmail: email });
}

export function unlinkChild(childId) {
  return api.delete(`/parent/children/${childId}`);
}

export function getChildActivityLog(childId) {
  return api.get(`/parent/children/${childId}/activity`);
}

export function getChildDailyUsage(childId) {
  return api.get(`/parent/children/${childId}/usage`);
}

export function getChildRules(childId) {
  return api.get(`/parent/children/${childId}/rules`);
}

export function createRule(data) {
  return api.post('/parent/rules', data);
}

export function updateRule(id, data) {
  return api.put(`/parent/rules/${id}`, data);
}

export function deleteRule(id) {
  return api.delete(`/parent/rules/${id}`);
}
