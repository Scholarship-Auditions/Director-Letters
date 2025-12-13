import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    || (typeof window !== 'undefined' ? window.location.origin : undefined)
    || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3100'),
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
