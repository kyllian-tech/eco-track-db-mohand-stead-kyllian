// src/modules/containers/containers.service.js
const repo = require("./containers.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isGeoJsonPoint(position) {
  return (
    position &&
    typeof position === "object" &&
    position.type === "Point" &&
    Array.isArray(position.coordinates) &&
    position.coordinates.length === 2
  );
}

async function listContainers(filters) {
  return repo.findAll(filters);
}

async function getContainerById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Container introuvable");
  return data;
}

async function createContainer(payload) {
  const { code, type, capacite_litres, position, zone_id, derniere_maintenance } =
    payload || {};

  // champs requis (métier)
  if (!code || !type || !capacite_litres || !position || !zone_id) {
    throw httpError(
      400,
      "code, type, capacite_litres, position et zone_id sont requis"
    );
  }

  // validation GeoJSON
  if (!isGeoJsonPoint(position)) {
    throw httpError(400, "position doit être un GeoJSON Point valide");
  }

  return repo.createViaRpc({
    code,
    type,
    capacite_litres,
    position_geojson: JSON.stringify(position),
    zone_id,
    derniere_maintenance,
  });
}

async function updateContainer(id, payload) {
  const { code, type, capacite_litres, position, zone_id, derniere_maintenance } =
    payload || {};

  // logique NOCHANGE / null / stringified
  let position_geojson = "__NOCHANGE__";
  if (typeof position !== "undefined") {
    if (position === null) {
      position_geojson = null;
    } else if (!isGeoJsonPoint(position)) {
      throw httpError(400, "position doit être un GeoJSON Point valide");
    } else {
      position_geojson = JSON.stringify(position);
    }
  }

  const data = await repo.updateViaRpc({
    id,
    code,
    type,
    capacite_litres,
    position_geojson,
    zone_id,
    derniere_maintenance,
  });

  if (!data) throw httpError(404, "Container introuvable");
  return data;
}

async function deleteContainer(id) {
  return repo.remove(id);
}

module.exports = {
  listContainers,
  getContainerById,
  createContainer,
  updateContainer,
  deleteContainer,
};
