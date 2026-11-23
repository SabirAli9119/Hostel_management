import api from './api.js';

export const register = (body) => api.post('/auth/register', body);
export const login = (body) => api.post('/auth/login', body);
export const logout = () => api.post('/auth/logout');
export const resetPassword = (body) => api.post('/auth/reset-password', body);
export const me = () => api.get('/auth/me');
export const changePassword = (body) => api.post('/auth/change-password', body);
