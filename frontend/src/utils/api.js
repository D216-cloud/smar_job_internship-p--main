import axios from 'axios';

const API_BASE_URL = 'https://smar-job-internship-p-main-backendd.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject('Session expired. Redirecting to login.');
    }
    return Promise.reject(error);
  }
);

export default api;

// Example usage:
// import api from '@/utils/api';
// api.get('/api/jobs').then(res => console.log(res.data));

// To store token after login:
// localStorage.setItem('token', receivedToken);
// To retrieve token:
// const token = localStorage.getItem('token');
