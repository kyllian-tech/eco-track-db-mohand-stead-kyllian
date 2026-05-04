const binsRepository = require("./bins.repository");
const { NotFoundError, ValidationError } = require("../../utils/errors");

async function listBins(filters = {}) {
  return binsRepository.findAll(filters);
}

async function listBinsByZone(zone_id) {
  if (!zone_id) {
    throw new ValidationError("zone_id est requis");
  }

  return binsRepository.findAll({ zone_id });
}

async function getBinById(id) {
  const bin = await binsRepository.findById(id);
  if (!bin) throw new NotFoundError("Poubelle introuvable");
  return bin;
}

async function createBin(payload) {
  const { code, type, capacite_litres, zone_id } = payload || {};
  if (!code || !type || !capacite_litres || !zone_id) {
    throw new ValidationError("code, type, capacite_litres et zone_id sont requis");
  }
  return binsRepository.create(payload);
}

async function updateBin(id, payload) {
  await getBinById(id);
  return binsRepository.update(id, payload);
}

async function deleteBin(id) {
  await getBinById(id);
  return binsRepository.delete(id);
}

function calculateAverageFillRate(bins) {
  if (!Array.isArray(bins) || bins.length === 0) return 0;
  const validBins = bins.filter((bin) => typeof bin.taux_remplissage === "number");
  if (validBins.length === 0) return 0;
  const total = validBins.reduce((sum, bin) => sum + bin.taux_remplissage, 0);
  return total / validBins.length;
}

function getPriorityBins(bins) {
  if (!Array.isArray(bins)) {
    throw new ValidationError("bins doit être un tableau");
  }

  return bins.filter((bin) => typeof bin.taux_remplissage === "number" && bin.taux_remplissage > 85);
}

module.exports = {
  listBins,
  listBinsByZone,
  getBinById,
  createBin,
  updateBin,
  deleteBin,
  calculateAverageFillRate,
  getPriorityBins,
};
