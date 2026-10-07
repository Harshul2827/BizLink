import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: format error payload and handle unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error status code
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('bizlink_token');
        localStorage.removeItem('bizlink_user');
        // Only redirect if not already on auth pages
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }

      const formattedError = new Error(data?.error?.message || data?.message || 'An unexpected error occurred');
      formattedError.statusCode = status;
      formattedError.code = data?.error?.code || 'UNKNOWN_ERROR';
      formattedError.details = data?.error?.details || null;
      return Promise.reject(formattedError);
    } else if (error.request) {
      // Network error / no response received
      const networkError = new Error('Unable to connect to BizLink server. Please check your network connection.');
      networkError.statusCode = 0;
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export default api;
