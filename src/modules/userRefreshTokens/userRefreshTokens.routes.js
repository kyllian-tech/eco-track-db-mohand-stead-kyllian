// src/modules/userRefreshTokens/userRefreshTokens.routes.js
const router = require("express").Router();
const c = require("./userRefreshTokens.controller");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);

// route spécifique avant le delete par id
router.delete("/by-user/:user_id", c.removeByUser);
router.delete("/:id", c.remove);

module.exports = router;