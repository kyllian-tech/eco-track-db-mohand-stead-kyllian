// src/modules/routeSteps/routeSteps.service.js
const repo = require("./routeSteps.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listRouteSteps(filters) {
  return repo.findAll(filters);
}

async function getRouteStepById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Étape introuvable");
  return data;
}

async function listRouteStepsByRoute(route_id) {
  if (!route_id) throw httpError(400, "route_id requis");
  return repo.findByRouteId(route_id);
}

async function createRouteStep(payload) {
  const {
    route_id,
    container_id,
    ordre_passage,
    collecte_effectuee = false,
    heure_passage = null,
  } = payload || {};

  if (!route_id || !container_id || typeof ordre_passage === "undefined") {
    throw httpError(400, "route_id, container_id et ordre_passage sont requis");
  }

  const insertPayload = {
    route_id,
    container_id,
    ordre_passage,
    collecte_effectuee: typeof collecte_effectuee === "boolean" ? collecte_effectuee : false,
    heure_passage,
  };

  return repo.create(insertPayload);
}

async function updateRouteStep(id, payload) {
  const { ordre_passage, collecte_effectuee, heure_passage } = payload || {};
  const patch = {};

  if (typeof ordre_passage !== "undefined") patch.ordre_passage = ordre_passage;
  if (typeof collecte_effectuee !== "undefined") patch.collecte_effectuee = collecte_effectuee;
  if (typeof heure_passage !== "undefined") patch.heure_passage = heure_passage;

  if (Object.keys(patch).length === 0) {
    throw httpError(400, "Aucun champ à mettre à jour");
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw httpError(404, "Étape introuvable");

  return updated;
}

async function deleteRouteStep(id) {
  return repo.remove(id);
}

module.exports = {
  listRouteSteps,
  getRouteStepById,
  listRouteStepsByRoute,
  createRouteStep,
  updateRouteStep,
  deleteRouteStep,
};
