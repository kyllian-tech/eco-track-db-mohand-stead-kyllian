const crypto = require("crypto");
const { UnauthorizedError } = require("./errors");

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value))
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function parseDuration(input, defaultSeconds) {
  if (!input) return defaultSeconds;
  if (typeof input === "number") return input;
  const match = String(input).match(/^(\d+)([smhd])$/i);
  if (!match) return defaultSeconds;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const map = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * map[unit];
}

function sign(payload, secret, expiresIn = "15m") {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + parseDuration(expiresIn, 900);
  const body = { ...payload, exp };
  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(body);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verify(token, secret) {
  if (!token) throw new UnauthorizedError("Token missing");
  const [encodedHeader, encodedPayload, providedSignature] = token.split(".");
  if (!encodedHeader || !encodedPayload || !providedSignature) {
    throw new UnauthorizedError("Malformed token");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  if (providedSignature !== expectedSignature) {
    throw new UnauthorizedError("Invalid token");
  }

  const payload = base64UrlDecode(encodedPayload);
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new UnauthorizedError("Token expired, please refresh");
  }

  return payload;
}

module.exports = { sign, verify };
