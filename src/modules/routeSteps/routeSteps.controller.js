// src/modules/routeSteps/routeSteps.controller.js
const service = require("./routeSteps.service");

exports.list = async (req, res, next) => {
  try {
    const { route_id, container_id } = req.query;
    const data = await service.listRouteSteps({ route_id, container_id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.listByRoute = async (req, res, next) => {
  try {
    const data = await service.listRouteStepsByRoute(req.params.route_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getRouteStepById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createRouteStep(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateRouteStep(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteRouteStep(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
