const logger = require("../utils/logger");

function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: `No route matches ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  logger.error(err.message || "Unhandled error", {
    name: err.name,
    statusCode: err.statusCode || err.status || 500,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(err.statusCode || err.status || 500).json({
    error: err.name || "InternalServerError",
    message: err.message || "Something went wrong",
    details: err.details,
  });
}

module.exports = { notFoundHandler, errorHandler };
