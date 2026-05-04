const logger = require("./logger");

const SECURITY_EVENTS = {
  AUTH_LOGIN_SUCCESS: "auth.login.success",
  AUTH_LOGIN_FAILURE: "auth.login.failure",
  AUTH_LOGOUT: "auth.logout",
  AUTH_REFRESH: "auth.refresh",
  AUTH_REGISTER: "auth.register",
  ACCESS_DENIED: "access.denied",
  RATE_LIMIT_HIT: "rate_limit.hit",
  VALIDATION_FAILURE: "validation.failure",
  SUSPICIOUS_PAYLOAD: "security.suspicious_payload",
  TOKEN_EXPIRED: "auth.token.expired",
  TOKEN_INVALID: "auth.token.invalid",
  ADMIN_ACTION: "admin.action",
  DATA_ACCESS: "data.access",
  DATA_MUTATION: "data.mutation",
};

function auditLog(event, context = {}) {
  const payload = {
    audit: true,
    event,
    timestamp: new Date().toISOString(),
    actor: context.userId || context.ip || "anonymous",
    ip: context.ip,
    userId: context.userId,
    resource: context.resource,
    action: context.action,
    result: context.result || "success",
    meta: context.meta || {},
  };

  if (context.result === "failure" || event.includes("failure") || event.includes("denied")) {
    logger.warn(`AUDIT:${event}`, payload);
  } else {
    logger.info(`AUDIT:${event}`, payload);
  }
}

function auditMiddleware(resource, action) {
  return (req, res, next) => {
    const originalEnd = res.end.bind(res);

    res.end = function (...args) {
      const success = res.statusCode < 400;
      auditLog(success ? SECURITY_EVENTS.DATA_ACCESS : SECURITY_EVENTS.ACCESS_DENIED, {
        userId: req.user?.sub,
        ip: req.ip,
        resource,
        action,
        result: success ? "success" : "failure",
        meta: { method: req.method, path: req.path, status: res.statusCode },
      });
      return originalEnd(...args);
    };

    next();
  };
}

module.exports = { auditLog, auditMiddleware, SECURITY_EVENTS };
