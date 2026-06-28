import client from './client';

export const loginApi = (email, password) =>
  client.post('/api/auth/login', { email, password }).then((r) => r.data);

export const registerApi = (email, password, full_name, role = 'citoyen') =>
  client.post('/api/auth/register', { email, password, full_name, role }).then((r) => r.data);

export const refreshApi = (refresh_token) =>
  client.post('/api/auth/refresh', { refresh_token }).then((r) => r.data);

export const adminCreateUserApi = (data) =>
  client.post('/api/auth/admin-create', data).then((r) => r.data);
