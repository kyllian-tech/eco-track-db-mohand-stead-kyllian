// src/modules/signalementPhotos/signalementPhotos.service.js
const repo = require("./signalementPhotos.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function isValidHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

async function listPhotos({ signalement_id } = {}) {
  return repo.findAll({ signalement_id });
}

async function getPhotoById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Photo introuvable");
  return data;
}

async function createPhoto(payload) {
  const { signalement_id, photo_url } = payload || {};

  if (!signalement_id || !photo_url) {
    throw httpError(400, "signalement_id et photo_url sont requis");
  }

  if (!isValidHttpUrl(photo_url)) {
    throw httpError(400, "photo_url doit être une URL valide");
  }

  return repo.create({ signalement_id, photo_url });
}

async function deletePhoto(id) {
  return repo.remove(id);
}

module.exports = { listPhotos, getPhotoById, createPhoto, deletePhoto };
