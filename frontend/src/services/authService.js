import api from './api';

export function login(credentials) { return api.post('/auth/login', credentials); }
export function register(data) { return api.post('/auth/register', data); }
export function getCurrentUser() { return api.get('/auth/me'); }
