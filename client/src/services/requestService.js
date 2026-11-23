import api from './api.js';

export const create = (body) => api.post('/requests', body);
export const mine = (params) => api.get('/requests/my-requests', { params });
export const get = (id) => api.get(`/requests/${id}`);
export const update = (id, body) => api.put(`/requests/${id}`, body);
export const cancel = (id) => api.delete(`/requests/${id}`);
