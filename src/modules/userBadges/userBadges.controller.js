// src/modules/userBadges/userBadges.controller.js
const service = require("./userBadges.service");

exports.list = async (req, res, next) => {
  try {
    const { user_id, badge_id } = req.query;
    const data = await service.listUserBadges({ user_id, badge_id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createUserBadge(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteUserBadge(req.body);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};