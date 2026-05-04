// src/modules/challenges/challenges.service.js
const repo = require("./challenges.repository");

function notFoundChallenge() {
  const err = new Error("Challenge introuvable");
  err.statusCode = 404;
  return err;
}

async function listChallenges() {
  return repo.findAll();
}

async function getChallengeById(id) {
  return repo.findById(id);
}

async function createChallenge(payload) {
  return repo.create(payload);
}

async function updateChallenge(id, payload) {
  const data = await repo.update(id, payload);

  // Supabase update + select retourne souvent un tableau
  if (!data || data.length === 0) throw notFoundChallenge();

  return data[0];
}

async function deleteChallenge(id) {
  return repo.remove(id);
}

module.exports = {
  listChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
};
