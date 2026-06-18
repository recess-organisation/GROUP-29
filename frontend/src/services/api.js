import axios from 'axios';

// All service files import this configured Axios instance.
// The interceptor attaches the JWT so individual API calls stay short and readable.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ugscholar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadsBaseUrl = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:5000';
export default api;
