// src/modules/notifications/notifications.controller.js
const service = require("./notifications.service");

exports.list = async (req, res, next) => {
  try {
    const { user_id, est_lu } = req.query;
    const data = await service.listNotifications({ user_id, est_lu });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getNotificationById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createNotification(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateNotification(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteNotification(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const data = await service.markNotificationAsRead(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
