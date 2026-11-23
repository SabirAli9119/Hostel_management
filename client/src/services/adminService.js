import api from './api.js';

export const dashboard = () => api.get('/admin/dashboard');

export const users = (params) => api.get('/admin/users', { params });
export const user = (id) => api.get(`/admin/users/${id}`);
export const updateUser = (id, body) => api.put(`/admin/users/${id}`, body);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export const rooms = (params) => api.get('/admin/rooms', { params });
export const room = (id) => api.get(`/admin/rooms/${id}`);
export const createRoom = (body) => api.post('/admin/rooms', body);
export const updateRoom = (id, body) => api.put(`/admin/rooms/${id}`, body);
export const deleteRoom = (id) => api.delete(`/admin/rooms/${id}`);
export const assignUser = (roomId, userId) => api.post(`/admin/rooms/${roomId}/assign-user`, { userId });
export const removeUser = (roomId, userId) => api.post(`/admin/rooms/${roomId}/remove-user`, { userId });

export const requests = (params) => api.get('/admin/requests', { params });
export const request = (id) => api.get(`/admin/requests/${id}`);
export const updateRequest = (id, body) => api.put(`/admin/requests/${id}`, body);
