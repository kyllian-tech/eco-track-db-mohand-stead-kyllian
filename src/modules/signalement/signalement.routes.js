const router = require("express").Router();
const c = require("./signalement.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS          = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION_AGENT = ["admin", "gestionnaire", "agent"];
const GESTION       = ["admin", "gestionnaire"];

router.get("/",       authorize(TOUS),          c.list);
router.get("/:id",    authorize(TOUS),          c.getById);
router.post("/",      authorize(TOUS),          c.create);        // tout le monde peut signaler
router.patch("/:id",  authorize(GESTION_AGENT), c.update);        // valider/modifier statut
router.delete("/:id", authorize(["admin"]),     c.remove);

module.exports = router;
