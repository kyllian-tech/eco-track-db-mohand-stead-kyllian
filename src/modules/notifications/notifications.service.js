// src/modules/notifications/notifications.service.js
const repo = require("./notifications.repository");

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

async function listNotifications({ user_id, est_lu } = {}) {
  const estLuBool = parseOptionalBoolean(est_lu);
  return repo.findAll({ user_id, est_lu: estLuBool });
}

async function getNotificationById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Notification introuvable");
  return data;
}

async function createNotification(payload) {
  const { user_id, titre, message, est_lu } = payload || {};

  if (!user_id || !titre || !message) {
    throw httpError(400, "user_id, titre et message sont requis");
  }

  const insertPayload = {
    user_id,
    titre,
    message,
    est_lu: typeof est_lu === "boolean" ? est_lu : false,
  };

  return repo.create(insertPayload);
}

async function updateNotification(id, payload) {
  const { titre, message, est_lu } = payload || {};
  const patch = {};

  if (typeof titre !== "undefined") patch.titre = titre;
  if (typeof message !== "undefined") patch.message = message;
  if (typeof est_lu !== "undefined") patch.est_lu = est_lu;

  if (Object.keys(patch).length === 0) {
    throw httpError(400, "Aucun champ à mettre à jour");
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw httpError(404, "Notification introuvable");

  return updated;
}

async function deleteNotification(id) {
  return repo.remove(id);
}

async function markNotificationAsRead(id) {
  const updated = await repo.update(id, { est_lu: true });
  if (!updated) throw httpError(404, "Notification introuvable");
  return updated;
}

module.exports = {
  listNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
};
