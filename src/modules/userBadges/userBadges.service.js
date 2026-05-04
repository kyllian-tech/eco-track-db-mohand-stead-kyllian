// src/modules/userBadges/userBadges.service.js
const repo = require("./userBadges.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listUserBadges(filters) {
  return repo.findAll(filters);
}

async function createUserBadge(payload) {
  const { user_id, badge_id } = payload || {};

  if (!user_id || !badge_id) {
    throw httpError(400, "user_id et badge_id sont requis");
  }

  const existing = await repo.findOne(user_id, badge_id);
  if (existing) {
    throw httpError(409, "Ce badge est déjà attribué à cet utilisateur");
  }

  return repo.create({ user_id, badge_id });
}

async function deleteUserBadge(payload) {
  const { user_id, badge_id } = payload || {};

  if (!user_id || !badge_id) {
    throw httpError(400, "user_id et badge_id sont requis");
  }

  const existing = await repo.findOne(user_id, badge_id);
  if (!existing) {
    throw httpError(404, "Attribution de badge introuvable");
  }

  return repo.remove(user_id, badge_id);
}

module.exports = {
  listUserBadges,
  createUserBadge,
  deleteUserBadge,
};