import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach token to EVERY request if it exists
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle common errors and logging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response, config } = error;
    
    if (response) {
      if (response.status === 401) {
        console.warn("[API 401] Unauthorized - Redirecting to login");
        localStorage.removeItem('token');
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.replace('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
