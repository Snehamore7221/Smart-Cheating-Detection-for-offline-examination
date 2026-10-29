import axios from 'axios';

// Default to /api (handled by Vite proxy) or configured API URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000, // 2 minutes timeout for video processing
});

// Interceptor to inject JWT token into requests
API.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem('faculty_token');
    if (!token) {
      token = 'demo_faculty_token_dev';
      try {
        localStorage.setItem('faculty_token', token);
      } catch (e) {}
    }
    config.headers.Authorization = `Bearer ${token}`;

    // If sending FormData, ensure Content-Type is NOT manually forced so the browser sets the boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle network fallback and auth errors
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If request failed with Network Error or 504 on proxied /api, retry directly against http://localhost:5000/api
    if (
      originalRequest &&
      !originalRequest._retriedDirect &&
      (!error.response || error.code === 'ERR_NETWORK' || error.response?.status === 504) &&
      originalRequest.url &&
      !originalRequest.url.startsWith('http')
    ) {
      originalRequest._retriedDirect = true;
      originalRequest.baseURL = 'http://localhost:5000/api';
      console.log('[API Interceptor] Retrying request directly on http://localhost:5000/api...');
      return API(originalRequest);
    }

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('[API Auth Interceptor] Access denied:', error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export default API;
