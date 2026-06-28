const router = require("express").Router();
const c = require("./measurements.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS          = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION       = ["admin", "gestionnaire"];
const GESTION_AGENT = ["admin", "gestionnaire", "agent"];

router.get("/",       authorize(TOUS),          c.list);
router.get("/latest", authorize(TOUS),          c.latest);
router.get("/:id",    authorize(TOUS),          c.getById);
router.post("/",      authorize(GESTION_AGENT), c.create);   // agent valide une collecte
router.patch("/:id",  authorize(GESTION),       c.update);
router.delete("/:id", authorize(["admin"]),     c.remove);

module.exports = router;
