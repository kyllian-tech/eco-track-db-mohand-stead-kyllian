const crypto = require("crypto");

function generateNonce() {
  return crypto.randomBytes(16).toString("base64");
}

function buildCsp(nonce, reportOnly = false) {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
    "block-all-mixed-content",
    `report-uri /api/csp-report`,
  ].join("; ");

  return { header: reportOnly ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy", value: directives };
}

function securityHeaders(options = {}) {
  const { cspReportOnly = false, hstsMaxAge = 31536000 } = options;

  return (req, res, next) => {
    const nonce = generateNonce();
    req.cspNonce = nonce;

    const csp = buildCsp(nonce, cspReportOnly);
    res.setHeader(csp.header, csp.value);
    res.setHeader("Strict-Transport-Security", `max-age=${hstsMaxAge}; includeSubDomains; preload`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "0");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("X-Download-Options", "noopen");
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    res.removeHeader("X-Powered-By");
    res.removeHeader("Server");

    next();
  };
}

function cspReportHandler(req, res) {
  const report = req.body;
  const logger = require("../utils/logger");
  logger.warn("CSP violation reported", { report, ip: req.ip });
  res.status(204).end();
}

module.exports = { securityHeaders, cspReportHandler };
