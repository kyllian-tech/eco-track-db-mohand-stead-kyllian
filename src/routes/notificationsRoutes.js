/**
 * Fichier : notificationsRoutes.js
 * Rôle : Définition des routes HTTP liées aux notifications.
 * Endpoints :
 * - GET    /api/notifications
 * - GET    /api/notifications/:id
 * - POST   /api/notifications
 * - PATCH  /api/notifications/:id
 * - PATCH  /api/notifications/:id/read   (optionnel : marque comme lue)
 * - DELETE /api/notifications/:id
 */

const router = require("express").Router();
const c = require("../controllers/notificationsControllers");

// Liste (optionnel: ?user_id=...&est_lu=true|false)
router.get("/", c.list);

// Détail
router.get("/:id", c.getById);

// Création
router.post("/", c.create);

// Mise à jour partielle
router.patch("/:id", c.update);

// Marquer comme lue (bonus)
router.patch("/:id/read", c.markAsRead);

// Suppression
router.delete("/:id", c.remove);

module.exports = router;
