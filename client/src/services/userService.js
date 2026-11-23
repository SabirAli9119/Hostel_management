import api from './api.js';

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (body) => api.put('/users/profile', body);
export const getDashboard = () => api.get('/users/dashboard');
