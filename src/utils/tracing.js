const crypto = require("crypto");

// OpenTelemetry-compatible tracing without external dependencies
// For production, replace with @opentelemetry/sdk-node

const activeSpans = new Map();

class Span {
  constructor(name, parentId = null) {
    this.traceId = parentId ? activeSpans.get(parentId)?.traceId : crypto.randomBytes(16).toString("hex");
    this.spanId = crypto.randomBytes(8).toString("hex");
    this.parentId = parentId;
    this.name = name;
    this.startTime = Date.now();
    this.attributes = {};
    this.events = [];
    this.status = "ok";
  }

  setAttribute(key, value) {
    this.attributes[key] = value;
    return this;
  }

  addEvent(name, attributes = {}) {
    this.events.push({ name, timestamp: Date.now(), attributes });
    return this;
  }

  setStatus(status, message) {
    this.status = status;
    if (message) this.attributes["error.message"] = message;
    return this;
  }

  end() {
    this.duration = Date.now() - this.startTime;
    activeSpans.delete(this.spanId);
    if (process.env.OTEL_DEBUG === "true") {
      const logger = require("./logger");
      logger.debug("span.end", {
        traceId: this.traceId,
        spanId: this.spanId,
        name: this.name,
        duration: this.duration,
        status: this.status,
        attributes: this.attributes,
      });
    }
    return this;
  }
}

function startSpan(name, parentId = null) {
  const span = new Span(name, parentId);
  activeSpans.set(span.spanId, span);
  return span;
}

function tracingMiddleware(req, res, next) {
  const traceId = req.headers["traceparent"]?.split("-")[1] || crypto.randomBytes(16).toString("hex");
  const span = startSpan(`${req.method} ${req.path}`);
  span.traceId = traceId;
  span.setAttribute("http.method", req.method);
  span.setAttribute("http.url", req.url);
  span.setAttribute("http.user_agent", req.headers["user-agent"] || "");
  span.setAttribute("net.peer.ip", req.ip);

  req.span = span;
  req.traceId = traceId;

  res.setHeader("X-Trace-Id", traceId);
  res.setHeader("traceparent", `00-${traceId}-${span.spanId}-01`);

  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    span.setAttribute("http.status_code", res.statusCode);
    if (res.statusCode >= 500) span.setStatus("error");
    span.end();
    return originalEnd(...args);
  };

  next();
}

module.exports = { startSpan, tracingMiddleware, Span };
