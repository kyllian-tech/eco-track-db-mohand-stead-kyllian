// src/modules/userRefreshTokens/userRefreshTokens.controller.js
const service = require("./userRefreshTokens.service");

exports.list = async (req, res, next) => {
  try {
    const { user_id, active } = req.query;
    const data = await service.listRefreshTokens({ user_id, active });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getRefreshTokenById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createRefreshToken(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateRefreshToken(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteRefreshToken(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.removeByUser = async (req, res, next) => {
  try {
    await service.revokeRefreshTokensByUser(req.params.user_id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};