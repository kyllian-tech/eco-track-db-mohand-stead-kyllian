const store = new Map();

async function get(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

async function set(key, value, ttlSeconds = 3600) {
  store.set(key, {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

async function del(key) {
  store.delete(key);
}

module.exports = { get, set, del };
