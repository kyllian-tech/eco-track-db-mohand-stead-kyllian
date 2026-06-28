const isDev = process.env.NODE_ENV !== "production";

function createRateLimiter({ windowMs, max, keyGenerator, message }) {
  const store = new Map();

  return (req, res, next) => {
    // En développement, les limiteurs auth sont désactivés pour faciliter les tests
    if (isDev) return next();

    const now = Date.now();
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const entry = store.get(key);

    if (!entry || entry.resetTime <= now) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= max) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: message || "Rate limit exceeded",
        retry_after_ms: entry.resetTime - now,
      });
    }

    entry.count += 1;
    store.set(key, entry);
    return next();
  };
}

const apiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "General API rate limit exceeded",
  keyGenerator: (req) => req.user?.sub || req.ip,
});

// Limiter strict pour la connexion uniquement (protection brute force)
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many authentication attempts. Please try again later.",
  keyGenerator: (req) => req.ip,
});

// Limiter souple pour l'inscription (moins critique que le login)
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many registration attempts. Please try again later.",
  keyGenerator: (req) => req.ip,
});

const measurementLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many measurement creations for this bin",
  keyGenerator: (req) => `${req.user?.sub || req.ip}:${req.body?.container_id || req.body?.bin_id || "unknown"}`,
});

module.exports = { createRateLimiter, apiLimiter, authLimiter, registerLimiter, measurementLimiter };
