import api from './api';

export function getPlans() {
  return api.get('/subscriptions/plans');
}

export function getMySubscription() {
  return api.get('/subscriptions/my');
}

export function createCheckoutSession(planCode) {
  return api.post('/subscriptions/create-checkout', { planCode });
}

export function cancelSubscription() {
  return api.post('/subscriptions/cancel');
}

export function getCheckoutSuccess(sessionId) {
  return api.get(`/subscriptions/success?session_id=${sessionId}`);
}

// ── Admin ────────────────────────────────────────────────────────────────────

export function adminGetSubscriptions(page = 1) {
  return api.get(`/admin/subscriptions?page=${page}`);
}

export function adminGetSubscriptionStats() {
  return api.get('/admin/subscriptions/stats');
}

export function adminAssignPlan(userId, planCode, periodMonths = 1) {
  return api.post('/admin/subscriptions/assign', { userId, planCode, periodMonths });
}

export function adminCancelSubscription(id) {
  return api.post(`/admin/subscriptions/${id}/cancel`);
}

export function adminUpdatePlan(id, data) {
  return api.put(`/admin/plans/${id}`, data);
}
