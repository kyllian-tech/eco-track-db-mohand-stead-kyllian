/**
 * Endpoints :
 * - GET    /api/user-badges
 * - POST   /api/user-badges
 * - DELETE /api/user-badges
 */

const router = require("express").Router();
const c = require("../controllers/userBadgesControllers");

router.get("/", c.list);
router.post("/", c.create);
router.delete("/", c.remove);

module.exports = router;
