import client from './client';

export const getProfiles = () => client.get('/api/profiles').then(r => r.data);
export const getProfileById = (id) => client.get(`/api/profiles/${id}`).then(r => r.data);
export const updateProfile = (id, data) => client.patch(`/api/profiles/${id}`, data).then(r => r.data);
