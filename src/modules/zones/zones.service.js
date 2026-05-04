const repo = require("./zones.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listZones() {
  return repo.findAll();
}

async function getZoneById(id) {
  const zone = await repo.findById(id);

  if (!zone) {
    throw httpError(404, "Zone introuvable");
  }

  return zone;
}

async function createZone(payload) {
  const { nom } = payload || {};

  if (!nom) {
    throw httpError(400, "nom est requis");
  }

  return repo.create(payload);
}

async function updateZone(id, payload) {
  const updated = await repo.update(id, payload);

  if (!updated) {
    throw httpError(404, "Zone introuvable");
  }

  return updated;
}

async function deleteZone(id) {
  return repo.remove(id);
}

module.exports = {
  listZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
};