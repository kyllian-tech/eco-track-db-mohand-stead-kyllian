// src/modules/measurements/measurements.controller.js
const service = require("./measurements.service");

exports.list = async (req, res, next) => {
  try {
    const { container_id, from, to, limit } = req.query;
    const data = await service.listMeasurements({ container_id, from, to, limit });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getMeasurementById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createMeasurement(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateMeasurement(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteMeasurement(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.latest = async (req, res, next) => {
  try {
    const data = await service.getLatestMeasurement(req.query.container_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
