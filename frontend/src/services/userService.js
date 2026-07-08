import api from './api';

export function getProfile() {
  return api.get('/users/profile');
}

export function updateProfile(data) {
  return api.put('/users/profile', data);
}

export function changePassword(data) {
  return api.put('/users/change-password', data);
}
