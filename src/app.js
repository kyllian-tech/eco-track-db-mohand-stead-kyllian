const express = require("express");
const cors = require("cors");
const { requestLogger } = require("./middleware/request-logger.middleware");
const { apiLimiter, measurementLimiter, authLimiter } = require("./middleware/rate-limit.middleware");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const { securityHeaders, cspReportHandler } = require("./middleware/security-headers.middleware");
const { compressionMiddleware } = require("./middleware/compression.middleware");
const { metricsMiddleware } = require("./middleware/metrics.middleware");
const { tracingMiddleware } = require("./utils/tracing");
const { auth } = require("./middleware/auth.middleware");
const logger = require("./utils/logger");

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Trace-Id", "traceparent"],
  exposedHeaders: ["X-Trace-Id", "traceparent", "Retry-After"],
  credentials: false,
};

function safeMount(path, loader, middlewares = []) {
  try {
    const router = loader();
    app.use(path, ...middlewares, router);
  } catch (error) {
    logger.warn("Route mount skipped", { path, reason: error.message });
  }
}

// Core middlewares — order matters
app.use(tracingMiddleware);
app.use(securityHeaders({ cspReportOnly: process.env.NODE_ENV !== "production" }));
app.use(cors(corsOptions));
app.use(compressionMiddleware());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(requestLogger);
app.use(metricsMiddleware);

// CSP violation reporting (must be before auth)
app.post("/api/csp-report", express.json({ type: "application/csp-report", limit: "50kb" }), cspReportHandler);

// Infrastructure endpoints (no auth required)
safeMount("/health", () => require("./modules/health/health.routes"));
safeMount("/metrics", () => require("./modules/metrics/metrics.routes"));

// Auth endpoints (with stricter rate limiting)
safeMount("/api/auth", () => require("./modules/auth/auth.routes"), [authLimiter]);

// Protected API endpoints
const apiMiddlewares = [apiLimiter, auth];
safeMount("/api/profiles", () => require("./modules/profiles/profiles.routes"), apiMiddlewares);
safeMount("/api/badges", () => require("./modules/badges/badges.routes"), apiMiddlewares);
safeMount("/api/challenges", () => require("./modules/challenges/challenges.routes"), apiMiddlewares);
safeMount("/api/containers", () => require("./modules/containers/containers.routes"), apiMiddlewares);
safeMount("/api/measurements", () => require("./modules/measurements/measurements.routes"), [apiLimiter, measurementLimiter]);
safeMount("/api/notifications", () => require("./modules/notifications/notifications.routes"), apiMiddlewares);
safeMount("/api/routes", () => require("./modules/routes/routes.routes"), apiMiddlewares);
safeMount("/api/route-steps", () => require("./modules/routeSteps/routeSteps.routes"), apiMiddlewares);
safeMount("/api/signalement", () => require("./modules/signalement/signalement.routes"), apiMiddlewares);
safeMount("/api/signalement-photos", () => require("./modules/signalementPhotos/signalementPhotos.routes"), apiMiddlewares);
safeMount("/api/tickets-support", () => require("./modules/ticketsSupport/ticketsSupport.routes"), apiMiddlewares);
safeMount("/api/user-badges", () => require("./modules/userBadges/userBadges.routes"), apiMiddlewares);
safeMount("/api/user-refresh-tokens", () => require("./modules/userRefreshTokens/userRefreshTokens.routes"), apiMiddlewares);
safeMount("/api/zones", () => require("./modules/zones/zones.routes"), apiMiddlewares);
safeMount("/api/bins", () => require("./modules/bins/bins.routes"), apiMiddlewares);
safeMount("/api/ml", () => require("./modules/ml/ml.routes"), apiMiddlewares);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
