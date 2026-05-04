// src/modules/containers/containers.controller.js
const service = require("./containers.service");

exports.list = async (req, res, next) => {
  try {
    const { zone_id, type } = req.query;
    const data = await service.listContainers({ zone_id, type });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.getContainerById(id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createContainer(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.updateContainer(id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.deleteContainer(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
