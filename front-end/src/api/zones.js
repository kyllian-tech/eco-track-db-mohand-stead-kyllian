import client from './client';

export const getZones = () => client.get('/api/zones').then(r => r.data);
