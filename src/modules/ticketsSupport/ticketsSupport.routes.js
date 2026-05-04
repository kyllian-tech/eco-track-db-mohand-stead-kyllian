/**
 * Endpoints :
 * - GET    /api/tickets-support
 * - GET    /api/tickets-support/:id
 * - POST   /api/tickets-support
 * - PATCH  /api/tickets-support/:id
 * - DELETE /api/tickets-support/:id
 */

// src/modules/ticketsSupport/ticketsSupport.routes.js
const router = require("express").Router();
const c = require("./ticketsSupport.controller");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
