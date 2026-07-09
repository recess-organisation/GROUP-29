import axios from 'axios';

// All service files import this configured Axios instance.
// The interceptor attaches the JWT so individual API calls stay short and readable.

// Detect local development vs production
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Use VITE_API_URL env var, or default to localhost for dev, or relative /api for production
const apiUrl = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
  baseURL: apiUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ugscholar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadsBaseUrl = import.meta.env.VITE_UPLOADS_URL || (isLocalhost ? 'http://localhost:5000' : '');
export default api;
