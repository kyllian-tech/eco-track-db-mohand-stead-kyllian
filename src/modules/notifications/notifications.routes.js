const router = require("express").Router();
const c = require("./notifications.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION = ["admin", "gestionnaire"];

router.get("/",          authorize(TOUS),    c.list);      // chacun voit les siennes
router.get("/:id",       authorize(TOUS),    c.getById);
router.post("/",         authorize(GESTION), c.create);    // envoi par gestionnaire/admin
router.patch("/:id",     authorize(TOUS),    c.update);    // marquer comme lue
router.patch("/:id/read",authorize(TOUS),    c.markAsRead);
router.delete("/:id",    authorize(["admin"]), c.remove);

module.exports = router;
