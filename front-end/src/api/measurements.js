import client from './client';

export const getMeasurements = (params) => client.get('/api/measurements', { params }).then(r => r.data);
export const getLatestMeasurement = (container_id) =>
  client.get('/api/measurements/latest', { params: { container_id } }).then(r => r.data);
export const createMeasurement = (data) => client.post('/api/measurements', data).then(r => r.data);
