// src/modules/ticketsSupport/ticketsSupport.service.js
const repo = require("./ticketsSupport.repository");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

async function listTickets(filters) {
  return repo.findAll(filters);
}

async function getTicketById(id) {
  const data = await repo.findById(id);
  if (!data) throw httpError(404, "Ticket introuvable");
  return data;
}

async function createTicket(payload) {
  const { user_id, sujet, message, statut, priorite } = payload || {};

  if (!user_id || !sujet || !message || !statut || !priorite) {
    throw httpError(400, "user_id, sujet, message, statut et priorite sont requis");
  }

  return repo.create({ user_id, sujet, message, statut, priorite });
}

async function updateTicket(id, payload) {
  const { sujet, message, statut, priorite } = payload || {};
  const patch = {};

  if (typeof sujet !== "undefined") patch.sujet = sujet;
  if (typeof message !== "undefined") patch.message = message;
  if (typeof statut !== "undefined") patch.statut = statut;
  if (typeof priorite !== "undefined") patch.priorite = priorite;

  if (Object.keys(patch).length === 0) {
    throw httpError(400, "Aucun champ à mettre à jour");
  }

  const updated = await repo.update(id, patch);
  if (!updated) throw httpError(404, "Ticket introuvable");

  return updated;
}

async function deleteTicket(id) {
  return repo.remove(id);
}

module.exports = { listTickets, getTicketById, createTicket, updateTicket, deleteTicket };
