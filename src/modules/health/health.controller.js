const service = require("./health.service");

async function overview(req, res, next) {
  try {
    const data = await service.getOverview();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function database(req, res, next) {
  try {
    const data = await service.checkDatabase();
    res.status(data.status === "ok" ? 200 : 503).json(data);
  } catch (error) {
    next(error);
  }
}

async function redis(req, res, next) {
  try {
    const data = await service.checkRedis();
    res.status(data.status === "error" ? 503 : 200).json(data);
  } catch (error) {
    next(error);
  }
}

// K8s liveness probe
async function liveness(req, res, next) {
  try {
    const data = await service.checkLiveness();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

// K8s readiness probe
async function readiness(req, res, next) {
  try {
    const data = await service.checkReadiness();
    res.status(data.status === "ready" ? 200 : 503).json(data);
  } catch (error) {
    next(error);
  }
}

// Full health report
async function full(req, res, next) {
  try {
    const data = await service.checkFull();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = { overview, database, redis, liveness, readiness, full };
