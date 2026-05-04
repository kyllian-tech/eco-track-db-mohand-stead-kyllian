/**
 * Fichier : containersRoutes.js
 * Rôle : Définition des routes HTTP liées aux containers.
 *
 * Endpoints :
 * - GET    /api/containers
 * - GET    /api/containers/:id
 * - POST   /api/containers
 * - PATCH  /api/containers/:id
 * - DELETE /api/containers/:id
 */

const router = require("express").Router();
const c = require("../controllers/containersControllers");

// Liste (optionnel: ?zone_id=...&type=...)
router.get("/", c.list);

// Détail
router.get("/:id", c.getById);

// Création
router.post("/", c.create);

// Mise à jour partielle
router.patch("/:id", c.update);

// Suppression
router.delete("/:id", c.remove);

module.exports = router;
