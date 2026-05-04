// src/modules/profiles/profiles.service.js
const repo = require("./profiles.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listProfiles() {
  return repo.findAll();
}

async function getProfileById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Profile introuvable");
  return data;
}

async function createProfile(payload) {
  const { id, email = null, role = "user", points = 0, avatar_url = null } =
    payload || {};

  if (!id) throw httpError(400, "id (auth.users.id) requis");

  // règle simple (éviter admin “gratuit”)
  const safeRole = role === "admin" ? "user" : role;

  const insertPayload = { id, email, role: safeRole, points, avatar_url };
  return repo.create(insertPayload);
}

async function updateProfile(id, patch) {
  // règle simple : empêcher update role via cet endpoint (optionnel mais recommandé)
  const safePatch = { ...patch };
  if (Object.prototype.hasOwnProperty.call(safePatch, "role")) {
    delete safePatch.role;
  }

  const data = await repo.update(id, safePatch);
  if (!data) throw httpError(404, "Profile introuvable");
  return data;
}

async function deleteProfile(id) {
  return repo.remove(id);
}

module.exports = {
  listProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
};
