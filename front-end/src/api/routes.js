import client from './client';

export const getRoutes = (params) => client.get('/api/routes', { params }).then(r => r.data);
export const createRoute = (data) => client.post('/api/routes', data).then(r => r.data);
export const updateRoute = (id, data) => client.patch(`/api/routes/${id}`, data).then(r => r.data);
export const deleteRoute = (id) => client.delete(`/api/routes/${id}`).then(r => r.data);
export const getRouteSteps = (routeId) => client.get(`/api/route-steps/by-route/${routeId}`).then(r => r.data);
