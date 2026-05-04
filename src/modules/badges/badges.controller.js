// src/controllers/badgesControllers.js
const badgesService = require("./badges.service");

exports.list = async (req, res, next) => {
  try {
    const data = await badgesService.listBadges();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await badgesService.getBadgeById(id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await badgesService.createBadge(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await badgesService.updateBadge(id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await badgesService.deleteBadge(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
