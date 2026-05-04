const { recordHttpRequest } = require("../modules/metrics/metrics.service");

function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const durationSeconds = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || "unknown";
    recordHttpRequest(req.method, route, res.statusCode, durationSeconds);
  });

  next();
}

module.exports = { metricsMiddleware };
