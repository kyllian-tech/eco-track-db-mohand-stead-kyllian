// src/modules/routes/routes.service.js
const repo = require("./routes.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listRoutes(filters) {
  return repo.findAll(filters);
}

async function getRouteById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Route introuvable");
  return data;
}

async function createRoute(payload) {
  const {
    nom,
    date_prevue,
    statut,
    agent_id = null,
    distance_estimee_km = null,
  } = payload || {};

  if (!nom || !date_prevue || !statut) {
    throw httpError(400, "nom, date_prevue et statut sont requis");
  }

  return repo.create({ nom, date_prevue, statut, agent_id, distance_estimee_km });
}

async function updateRoute(id, payload) {
  const { nom, date_prevue, statut, agent_id, distance_estimee_km } = payload || {};

  const patch = {};
  if (typeof nom !== "undefined") patch.nom = nom;
  if (typeof date_prevue !== "undefined") patch.date_prevue = date_prevue;
  if (typeof statut !== "undefined") patch.statut = statut;
  if (typeof agent_id !== "undefined") patch.agent_id = agent_id;
  if (typeof distance_estimee_km !== "undefined") patch.distance_estimee_km = distance_estimee_km;

  if (Object.keys(patch).length === 0) {
    throw httpError(400, "Aucun champ à mettre à jour");
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw httpError(404, "Route introuvable");

  return updated;
}

async function deleteRoute(id) {
  return repo.remove(id);
}

module.exports = { listRoutes, getRouteById, createRoute, updateRoute, deleteRoute };
