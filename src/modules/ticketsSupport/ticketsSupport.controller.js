// src/modules/ticketsSupport/ticketsSupport.controller.js
const service = require("./ticketsSupport.service");

exports.list = async (req, res, next) => {
  try {
    const { statut, priorite, user_id } = req.query;
    const data = await service.listTickets({ statut, priorite, user_id });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await service.getTicketById(req.params.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = await service.createTicket(req.body);
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const data = await service.updateTicket(req.params.id, req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteTicket(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
