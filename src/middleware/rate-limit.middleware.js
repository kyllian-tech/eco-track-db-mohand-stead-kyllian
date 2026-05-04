function createRateLimiter({ windowMs, max, keyGenerator, message }) {
  const store = new Map();

  return (req, res, next) => {
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

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again later.",
  keyGenerator: (req) => req.ip,
});

const measurementLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many measurement creations for this bin",
  keyGenerator: (req) => `${req.user?.sub || req.ip}:${req.body?.container_id || req.body?.bin_id || "unknown"}`,
});

module.exports = { createRateLimiter, apiLimiter, authLimiter, measurementLimiter };
