/**
 * Fichier : signalements.routes.js
 * Endpoints :
 * - GET    /api/signalements
 * - GET    /api/signalements/:id
 * - POST   /api/signalements
 * - PATCH  /api/signalements/:id
 * - DELETE /api/signalements/:id
 */


// src/modules/signalements/signalements.routes.js
const router = require("express").Router();
const c = require("./signalement.controller");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
