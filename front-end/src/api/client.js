import axios from 'axios';

const ACCESS_TOKEN_KEY = 'ecotrack_access_token';
const REFRESH_TOKEN_KEY = 'ecotrack_refresh_token';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const client = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
});

// Attache le token JWT à chaque requête
client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// File d'attente des requêtes en attente pendant le refresh
let isRefreshing = false;
let queue = [];

function flushQueue(error, token = null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

// Sur 401 : tente un refresh automatique, puis rejoue la requête
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Ne pas intercepter les endpoints d'auth (login/register/refresh)
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/api/auth/')
    ) {
      return Promise.reject(error);
    }

    // Si un refresh est déjà en cours, mettre en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) throw new Error('no_refresh_token');

      const { data } = await axios.post('/api/auth/refresh', {
        refresh_token: refreshToken,
      });

      setTokens(data.access_token, data.refresh_token);
      flushQueue(null, data.access_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return client(original);
    } catch (err) {
      flushQueue(err, null);
      clearTokens();
      localStorage.removeItem('ecotrack_user');
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;
