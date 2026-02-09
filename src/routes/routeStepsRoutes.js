/**
 * Fichier : routeStepsRoutes.js
 * Endpoints :
 * - GET    /api/route-steps
 * - GET    /api/route-steps/by-route/:route_id
 * - GET    /api/route-steps/:id
 * - POST   /api/route-steps
 * - PATCH  /api/route-steps/:id
 * - DELETE /api/route-steps/:id
 */

const router = require("express").Router();
const c = require("../controllers/routeStepsControllers");

router.get("/", c.list);
router.get("/by-route/:route_id", c.listByRoute);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
