// src/modules/userRefreshTokens/userRefreshTokens.service.js
const repo = require("./userRefreshTokens.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function parseOptionalBoolean(value) {
  if (typeof value === "undefined") return undefined;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

async function listRefreshTokens({ user_id, active } = {}) {
  return repo.findAll({ user_id, active: parseOptionalBoolean(active) });
}

async function getRefreshTokenById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Refresh token introuvable");
  return data;
}

async function createRefreshToken(payload) {
  const { user_id, token, expires_at = null } = payload || {};

  if (!user_id || !token) {
    throw httpError(400, "user_id et token sont requis");
  }

  if (typeof token !== "string" || token.length < 20) {
    throw httpError(400, "token invalide (trop court)");
  }

  const insertPayload = {
    user_id,
    token,
    ...(expires_at ? { expires_at } : {}),
  };

  return repo.create(insertPayload);
}

async function updateRefreshToken(id, payload) {
  const { expires_at } = payload || {};

  if (typeof expires_at === "undefined") {
    throw httpError(400, "expires_at est requis");
  }

  const updated = await repo.updateExpiresAt(id, expires_at);
  if (!updated) throw httpError(404, "Refresh token introuvable");

  return updated;
}

async function deleteRefreshToken(id) {
  return repo.remove(id);
}

async function revokeRefreshTokensByUser(user_id) {
  if (!user_id) throw httpError(400, "user_id requis");
  return repo.removeByUser(user_id);
}

module.exports = {
  listRefreshTokens,
  getRefreshTokenById,
  createRefreshToken,
  updateRefreshToken,
  deleteRefreshToken,
  revokeRefreshTokensByUser,
};