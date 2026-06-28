const router = require("express").Router();
const c = require("./routes.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const GESTION       = ["admin", "gestionnaire"];
const GESTION_AGENT = ["admin", "gestionnaire", "agent"];

router.get("/",       authorize(GESTION_AGENT), c.list);
router.get("/:id",    authorize(GESTION_AGENT), c.getById);
router.post("/",      authorize(GESTION),       c.create);
router.patch("/:id",  authorize(GESTION_AGENT), c.update);  // agent change le statut
router.delete("/:id", authorize(GESTION),       c.remove);

module.exports = router;
