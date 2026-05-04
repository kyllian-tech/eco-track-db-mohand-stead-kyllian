// src/modules/measurements/measurements.service.js
const repo = require("./measurements.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function assertInt8Id(id) {
  if (!/^\d+$/.test(String(id))) throw httpError(400, "id invalide (int8 attendu)");
}

function validateTaux(taux) {
  if (typeof taux !== "number") throw httpError(400, "taux_remplissage doit être un nombre");
  if (taux < 0 || taux > 100) throw httpError(400, "taux_remplissage doit être entre 0 et 100");
}

function validateNullableNumber(fieldName, value) {
  if (value !== null && typeof value !== "number") {
    throw httpError(400, `${fieldName} doit être un nombre`);
  }
}

async function listMeasurements(filters) {
  return repo.findAll(filters);
}

async function getMeasurementById(id) {
  assertInt8Id(id);
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Measurement introuvable");
  return data;
}

async function createMeasurement(payload) {
  const {
    container_id,
    taux_remplissage,
    temperature = null,
    batterie_niveau = null,
    timestamp = null,
  } = payload || {};

  if (!container_id || typeof taux_remplissage === "undefined") {
    throw httpError(400, "container_id et taux_remplissage sont requis");
  }

  validateTaux(taux_remplissage);
  if (temperature !== null) validateNullableNumber("temperature", temperature);
  if (batterie_niveau !== null) validateNullableNumber("batterie_niveau", batterie_niveau);

  const insertPayload = {
    container_id,
    taux_remplissage,
    temperature,
    batterie_niveau,
    ...(timestamp ? { timestamp } : {}),
  };

  return repo.create(insertPayload);
}

async function updateMeasurement(id, payload) {
  assertInt8Id(id);

  const { taux_remplissage, temperature, batterie_niveau, timestamp } = payload || {};
  const patch = {};

  if (typeof taux_remplissage !== "undefined") {
    validateTaux(taux_remplissage);
    patch.taux_remplissage = taux_remplissage;
  }

  if (typeof temperature !== "undefined") {
    validateNullableNumber("temperature", temperature);
    patch.temperature = temperature;
  }

  if (typeof batterie_niveau !== "undefined") {
    validateNullableNumber("batterie_niveau", batterie_niveau);
    patch.batterie_niveau = batterie_niveau;
  }

  if (typeof timestamp !== "undefined") patch.timestamp = timestamp;

  if (Object.keys(patch).length === 0) {
    throw httpError(400, "Aucun champ à mettre à jour");
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw httpError(404, "Measurement introuvable");

  return updated;
}

async function deleteMeasurement(id) {
  assertInt8Id(id);
  return repo.remove(id);
}

async function getLatestMeasurement(container_id) {
  if (!container_id) throw httpError(400, "container_id est requis");
  const one = await repo.findLatestByContainerId(container_id);
  if (!one) throw httpError(404, "Aucune mesure trouvée");
  return one;
}

module.exports = {
  listMeasurements,
  getMeasurementById,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getLatestMeasurement,
};
