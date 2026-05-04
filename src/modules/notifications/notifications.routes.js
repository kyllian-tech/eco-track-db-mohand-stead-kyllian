/**
 * Fichier : notifications.routes.js
 * Rôle : Définition des routes HTTP liées aux notifications.
 * Endpoints :
 * - GET    /api/notifications
 * - GET    /api/notifications/:id
 * - POST   /api/notifications
 * - PATCH  /api/notifications/:id
 * - PATCH  /api/notifications/:id/read   (optionnel : marque comme lue)
 * - DELETE /api/notifications/:id
 */

// src/modules/notifications/notifications.routes.js
const router = require("express").Router();
const c = require("./notifications.controller");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

// route dédiée "read" (optionnelle mais propre)
router.patch("/:id/read", c.markAsRead);

module.exports = router;
