import client from './client';

export const getContainers = (params) => client.get('/api/containers', { params }).then(r => r.data);
export const getContainerById = (id) => client.get(`/api/containers/${id}`).then(r => r.data);
export const createContainer = (data) => client.post('/api/containers', data).then(r => r.data);
export const updateContainer = (id, data) => client.patch(`/api/containers/${id}`, data).then(r => r.data);
export const deleteContainer = (id) => client.delete(`/api/containers/${id}`).then(r => r.data);
