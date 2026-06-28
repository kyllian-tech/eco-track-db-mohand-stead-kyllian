import client from './client';

export const getSignalements = (params) => client.get('/api/signalement', { params }).then(r => r.data);
export const createSignalement = (data) => client.post('/api/signalement', data).then(r => r.data);
export const updateSignalement = (id, data) => client.patch(`/api/signalement/${id}`, data).then(r => r.data);
export const deleteSignalement = (id) => client.delete(`/api/signalement/${id}`).then(r => r.data);
