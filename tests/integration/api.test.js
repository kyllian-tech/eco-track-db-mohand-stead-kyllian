const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const USERS_FILE = path.resolve(__dirname, '../../src/data/users.json');
const TOKENS_FILE = path.resolve(__dirname, '../../src/data/refresh-tokens.json');

let server;
let baseUrl;
let app;

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  return { status: response.status, body };
}

test.before(async () => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  await fs.writeFile(USERS_FILE, '[]\n');
  await fs.writeFile(TOKENS_FILE, '[]\n');
  app = require('../../src/app');
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
});

test('GET /health returns 200', async () => {
  const { status, body } = await jsonFetch(`${baseUrl}/health`);
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('auth flow register -> login -> refresh works', async () => {
  const register = await jsonFetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ecotrack.local',
      password: 'password123',
      role: 'admin'
    })
  });

  assert.equal(register.status, 201);
  assert.equal(register.body.email, 'admin@ecotrack.local');

  const login = await jsonFetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@ecotrack.local',
      password: 'password123'
    })
  });

  assert.equal(login.status, 200);
  assert.ok(login.body.access_token);
  assert.ok(login.body.refresh_token);

  const refresh = await jsonFetch(`${baseUrl}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      refresh_token: login.body.refresh_token
    })
  });

  assert.equal(refresh.status, 200);
  assert.ok(refresh.body.access_token);
  assert.ok(refresh.body.refresh_token);
});

test('DELETE /api/bins/:id without token returns 401', async () => {
  const { status, body } = await jsonFetch(`${baseUrl}/api/bins/123`, {
    method: 'DELETE'
  });

  assert.equal(status, 401);
  assert.equal(body.error, 'UnauthorizedError');
});
