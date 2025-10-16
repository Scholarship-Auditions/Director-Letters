import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? 'http://directors-letters-env.eba-2b62phwu.us-east-2.elasticbeanstalk.com'
    : 'http://localhost:3100',
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