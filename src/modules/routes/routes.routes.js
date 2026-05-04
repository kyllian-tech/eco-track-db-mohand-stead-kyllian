// src/modules/routes/routes.routes.js
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
const c = require("./routes.controller");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
