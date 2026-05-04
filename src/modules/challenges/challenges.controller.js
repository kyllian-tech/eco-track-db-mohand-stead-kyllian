// src/modules/challenges/challenges.controller.js
const service = require("./challenges.service");

exports.list = async (req, res, next) => {
  try {
    const data = await service.listChallenges();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.getChallengeById(id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createChallenge(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await service.updateChallenge(id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await service.deleteChallenge(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
