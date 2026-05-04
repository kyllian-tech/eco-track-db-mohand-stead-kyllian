const { getSupabaseAdmin } = require("../../utils/supabase");

const startTime = Date.now();

async function getOverview() {
  return {
    status: "ok",
    uptime: process.uptime(),
    uptime_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "2.0.0",
    node_version: process.version,
  };
}

async function checkDatabase() {
  const start = Date.now();
  try {
    const client = getSupabaseAdmin();
    const { error } = await client.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    return { status: "ok", database: "supabase", latency_ms: Date.now() - start };
  } catch (error) {
    return { status: "error", database: "supabase", message: error.message, latency_ms: Date.now() - start };
  }
}

async function checkRedis() {
  return {
    status: process.env.REDIS_URL ? "degraded" : "not_configured",
    cache: process.env.REDIS_URL ? "redis-url-present" : "in-memory-fallback",
  };
}

// K8s liveness probe — confirms the process hasn't deadlocked
async function checkLiveness() {
  return {
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
}

// K8s readiness probe — confirms the app can serve traffic
async function checkReadiness() {
  const db = await checkDatabase();
  const redis = await checkRedis();

  const ready = db.status === "ok";
  return {
    status: ready ? "ready" : "not_ready",
    timestamp: new Date().toISOString(),
    checks: {
      database: db,
      cache: redis,
    },
  };
}

async function checkFull() {
  const [db, redis] = await Promise.allSettled([checkDatabase(), checkRedis()]);
  const mem = process.memoryUsage();

  return {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "2.0.0",
    checks: {
      database: db.status === "fulfilled" ? db.value : { status: "error", message: db.reason?.message },
      cache: redis.status === "fulfilled" ? redis.value : { status: "error", message: redis.reason?.message },
    },
    memory: {
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
      rss_mb: Math.round(mem.rss / 1024 / 1024),
    },
  };
}

module.exports = { getOverview, checkDatabase, checkRedis, checkLiveness, checkReadiness, checkFull };
