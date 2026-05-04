// src/modules/signalements/signalements.service.js
const repo = require("./signalement.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function validateLonLat(longitude, latitude) {
  if (longitude !== null && typeof longitude !== "number") {
    throw httpError(400, "longitude doit être un nombre");
  }
  if (latitude !== null && typeof latitude !== "number") {
    throw httpError(400, "latitude doit être un nombre");
  }
  if (longitude !== null && (longitude < -180 || longitude > 180)) {
    throw httpError(400, "longitude doit être entre -180 et 180");
  }
  if (latitude !== null && (latitude < -90 || latitude > 90)) {
    throw httpError(400, "latitude doit être entre -90 et 90");
  }
}

async function listSignalements(filters) {
  return repo.findAll(filters);
}

async function getSignalementById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Signalement introuvable");
  return data;
}

async function createSignalement(payload) {
  const {
    user_id,
    container_id,
    type_incident,
    description = null,
    statut,
    longitude = null,
    latitude = null,
  } = payload || {};

  if (!user_id || !container_id || !type_incident || !statut) {
    throw httpError(400, "user_id, container_id, type_incident et statut sont requis");
  }

  validateLonLat(longitude, latitude);

  return repo.create({
    user_id,
    container_id,
    type_incident,
    description,
    statut,
    longitude,
    latitude,
  });
}

async function updateSignalement(id, payload) {
  const { type_incident, description, statut, longitude, latitude } = payload || {};
  const patch = {};

  if (typeof type_incident !== "undefined") patch.type_incident = type_incident;
  if (typeof description !== "undefined") patch.description = description;
  if (typeof statut !== "undefined") patch.statut = statut;

  if (typeof longitude !== "undefined") {
    validateLonLat(longitude, null);
    patch.longitude = longitude;
  }

  if (typeof latitude !== "undefined") {
    validateLonLat(null, latitude);
    patch.latitude = latitude;
  }

  if (Object.keys(patch).length === 0) {
    throw httpError(400, "Aucun champ à mettre à jour");
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw httpError(404, "Signalement introuvable");

  return updated;
}

async function deleteSignalement(id) {
  return repo.remove(id);
}

module.exports = {
  listSignalements,
  getSignalementById,
  createSignalement,
  updateSignalement,
  deleteSignalement,
};
