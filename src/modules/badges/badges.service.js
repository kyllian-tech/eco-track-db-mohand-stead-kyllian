// src/services/badges.service.js
const badgesRepo = require("./bagdes.repository");

async function listBadges() {
  return badgesRepo.findAll();
}

async function getBadgeById(id) {
  return badgesRepo.findById(id);
}

async function createBadge(payload) {
  return badgesRepo.create(payload);
}

async function updateBadge(id, payload) {
  return badgesRepo.update(id, payload);
}

async function deleteBadge(id) {
  return badgesRepo.remove(id);
}

module.exports = {
  listBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  deleteBadge,
};
