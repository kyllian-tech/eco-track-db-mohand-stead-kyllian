// src/modules/profiles/profiles.controller.js
const service = require("./profiles.service");

exports.list = async (req, res, next) => {
  try {
    const data = await service.listProfiles();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getProfileById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createProfile(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateProfile(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteProfile(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
