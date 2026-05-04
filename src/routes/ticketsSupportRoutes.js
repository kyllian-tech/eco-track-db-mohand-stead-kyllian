/**
 * Endpoints :
 * - GET    /api/tickets-support
 * - GET    /api/tickets-support/:id
 * - POST   /api/tickets-support
 * - PATCH  /api/tickets-support/:id
 * - DELETE /api/tickets-support/:id
 */

const router = require("express").Router();
const c = require("../controllers/ticketsSupportControllers");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
