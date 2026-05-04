/**
 * Fichier : measurementsRoutes.js
 * Rôle : Définition des routes HTTP liées aux measurements.
 *
 * Endpoints :
 * - GET    /api/measurements
 * - GET    /api/measurements/latest?container_id=...
 * - GET    /api/measurements/:id
 * - POST   /api/measurements
 * - PATCH  /api/measurements/:id
 * - DELETE /api/measurements/:id
 */

const router = require("express").Router();
const c = require("../controllers/measurementsControllers");

// Liste (filtres: ?container_id=...&from=...&to=...&limit=...)
router.get("/", c.list);

// Dernière mesure d'un container (ex: ?container_id=uuid)
router.get("/latest", c.latest);

// Détail (id = int8)
router.get("/:id", c.getById);

// Création
router.post("/", c.create);

// Mise à jour partielle
router.patch("/:id", c.update);

// Suppression
router.delete("/:id", c.remove);

module.exports = router;
