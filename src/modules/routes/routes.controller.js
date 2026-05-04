// src/modules/routes/routes.controller.js
const service = require("./routes.service");

exports.list = async (req, res, next) => {
  try {
    const { statut, agent_id } = req.query;
    const data = await service.listRoutes({ statut, agent_id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getRouteById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createRoute(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateRoute(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteRoute(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
