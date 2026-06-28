const router = require("express").Router();
const controller = require("./auth.controller");
const { validate } = require("../../middleware/validation.middleware");
const { authLimiter, registerLimiter } = require("../../middleware/rate-limit.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const { auth } = require("../../middleware/auth.middleware");
const { registerSchema, loginSchema, refreshSchema, adminCreateSchema } = require("./auth.schema");

router.post("/register", registerLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.post("/refresh", validate(refreshSchema), controller.refresh);
router.post("/admin-create", auth, authorize(["admin"]), validate(adminCreateSchema), controller.adminCreate);

module.exports = router;
