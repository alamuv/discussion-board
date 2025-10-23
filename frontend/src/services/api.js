import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable cookie-based auth
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response: ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized - redirecting to login');
      // Could dispatch logout action here
    }
    console.error('[API] Response error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default api;

