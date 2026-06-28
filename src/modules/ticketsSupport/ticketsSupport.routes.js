const router = require("express").Router();
const c = require("./ticketsSupport.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION = ["admin", "gestionnaire"];

router.get("/",       authorize(TOUS),      c.list);
router.get("/:id",    authorize(TOUS),      c.getById);
router.post("/",      authorize(TOUS),      c.create);     // tout le monde peut ouvrir un ticket
router.patch("/:id",  authorize(GESTION),   c.update);     // traitement par gestionnaire/admin
router.delete("/:id", authorize(["admin"]), c.remove);

module.exports = router;
