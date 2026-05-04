/**
 * Endpoints :
 * - GET    /api/user-badges
 * - POST   /api/user-badges
 * - DELETE /api/user-badges
 */

// src/modules/userBadges/userBadges.routes.js
const router = require("express").Router();
const c = require("./userBadges.controller");

router.get("/", c.list);
router.post("/", c.create);
router.delete("/", c.remove);

module.exports = router;