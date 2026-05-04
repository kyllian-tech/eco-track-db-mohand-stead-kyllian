// src/modules/signalementPhotos/signalementPhotos.controller.js
const service = require("./signalementPhotos.service");

exports.list = async (req, res, next) => {
  try {
    const data = await service.listPhotos({ signalement_id: req.query.signalement_id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getPhotoById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createPhoto(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deletePhoto(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
