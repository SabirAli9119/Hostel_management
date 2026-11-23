import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // sends the HttpOnly JWT cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const AUTH_CALLS = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/me', '/auth/change-password'];

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && !AUTH_CALLS.some((p) => url.startsWith(p))) {
      // Session expired: AuthContext listens and clears the user.
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
