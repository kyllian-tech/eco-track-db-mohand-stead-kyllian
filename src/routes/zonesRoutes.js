/**
 * Fichier : zonesRoutes.js
 * Rôle : Définition des routes HTTP liées aux zones.
 *
 * Endpoints :
 * - GET    /api/zones
 * - GET    /api/zones/:id
 * - POST   /api/zones
 * - PATCH  /api/zones/:id
 * - DELETE /api/zones/:id
 */

const router = require("express").Router();
const c = require("../controllers/zonesControllers");

// Liste
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
