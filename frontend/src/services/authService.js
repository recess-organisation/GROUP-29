import api from './api';

export function login(credentials) {
  return api.post('/auth/login', credentials);
}

export function register(data) {
  return api.post('/auth/register', data);
}

export function getCurrentUser() {
  return api.get('/auth/me');
}

export function forgotPassword(email) {
  return api.post('/auth/forgot-password', { email });
}

export function resetPassword(token, password) {
  return api.post('/auth/reset-password', { token, password });
}
