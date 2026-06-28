import client from './client';

export const getNotifications = (params) => client.get('/api/notifications', { params }).then(r => r.data);
export const markAsRead = (id) => client.patch(`/api/notifications/${id}/read`).then(r => r.data);
export const updateNotification = (id, data) => client.patch(`/api/notifications/${id}`, data).then(r => r.data);
export const deleteNotification = (id) => client.delete(`/api/notifications/${id}`).then(r => r.data);
