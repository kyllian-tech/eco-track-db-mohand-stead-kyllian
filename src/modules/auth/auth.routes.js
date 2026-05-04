const router = require("express").Router();
const controller = require("./auth.controller");
const { validate } = require("../../middleware/validation.middleware");
const { authLimiter } = require("../../middleware/rate-limit.middleware");
const { registerSchema, loginSchema, refreshSchema } = require("./auth.schema");

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);

module.exports = router;
