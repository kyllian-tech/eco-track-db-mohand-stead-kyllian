/**
 * Fichier : routesRoutes.js
 * Rôle : Définition des routes HTTP liées aux routes.
 *
 * Endpoints :
 * - GET    /api/routes
 * - GET    /api/routes/:id
 * - POST   /api/routes
 * - PATCH  /api/routes/:id
 * - DELETE /api/routes/:id
 */

const router = require("express").Router();
const c = require("../controllers/routesControllers");

// Liste (filtres optionnels : ?statut=...&agent_id=...)
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
