// src/modules/measurements/measurements.routes.js
const router = require("express").Router();
const c = require("./measurements.controller");

router.get("/", c.list);
router.get("/latest", c.latest); // IMPORTANT: avant "/:id"
router.get("/:id", c.getById);
router.post("/", c.create);
router.patch("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
