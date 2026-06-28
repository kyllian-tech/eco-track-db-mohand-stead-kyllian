const router = require("express").Router();
const c = require("./signalementPhotos.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION = ["admin", "gestionnaire"];

router.get("/",       authorize(TOUS),      c.list);
router.get("/:id",    authorize(TOUS),      c.getById);
router.post("/",      authorize(TOUS),      c.create);
router.delete("/:id", authorize(GESTION),  c.remove);

module.exports = router;
