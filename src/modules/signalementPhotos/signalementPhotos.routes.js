// src/modules/signalementPhotos/signalementPhotos.routes.js
const router = require("express").Router();
const c = require("./signalementPhotos.controller");

/** * GET /api/signalement-photos * Filtres optionnels : * - ?signalement_id=uuid */
router.get("/", c.list);

/** * GET /api/signalement-photos/:id */
router.get("/:id", c.getById);

/** * POST /api/signalement-photos */
router.post("/", c.create);

/** * DELETE /api/signalement-photos/:id */
router.delete("/:id", c.remove);

module.exports = router;
