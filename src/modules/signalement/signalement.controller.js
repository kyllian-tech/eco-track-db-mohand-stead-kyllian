// src/modules/signalements/signalements.controller.js
const service = require("./signalement.service");

exports.list = async (req, res, next) => {
  try {
    const { statut, user_id, container_id } = req.query;
    const data = await service.listSignalements({ statut, user_id, container_id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getSignalementById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createSignalement(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateSignalement(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteSignalement(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
