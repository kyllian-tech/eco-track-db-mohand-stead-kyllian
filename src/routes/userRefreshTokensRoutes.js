/**
 * Endpoints :
 * - GET    /api/user-refresh-tokens
 * - GET    /api/user-refresh-tokens/:id
 * - POST   /api/user-refresh-tokens
 * - PATCH  /api/user-refresh-tokens/:id
 * - DELETE /api/user-refresh-tokens/:id
 * - DELETE /api/user-refresh-tokens/by-user/:user_id
 */

const router = require("express").Router();
const c = require("../controllers/userRefreshTokensControllers");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/by-user/:user_id", c.removeByUser);
router.delete("/:id", c.remove);

module.exports = router;
