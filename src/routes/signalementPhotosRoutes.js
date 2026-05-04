/**
 * signalementPhotosRoutes.js
 */

const router = require("express").Router();
const c = require("../controllers/signalementPhotosControllers");

router.get("/", c.list);
router.get("/:id", c.getById);
router.post("/", c.create);
router.delete("/:id", c.remove);

module.exports = router;
