const router = require("express").Router();
const binsController = require("./bins.controllers");
const { validate } = require("../../middleware/validation.middleware");
const { auth } = require("../../middleware/auth.middleware");
const { authorize } = require("../../middleware/authorize.middleware");
const { createBinSchema, updateBinSchema } = require("./bins.schema");

router.get("/", binsController.getAll);
router.get("/:id", binsController.getById);
router.post("/", auth, authorize(["admin", "manager"]), validate(createBinSchema), binsController.create);
router.patch("/:id", auth, authorize(["admin", "manager", "collector"]), validate(updateBinSchema), binsController.update);
router.delete("/:id", auth, authorize(["admin"]), binsController.remove);

module.exports = router;
