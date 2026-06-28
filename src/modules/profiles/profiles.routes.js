const router = require("express").Router();
const c = require("./profiles.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION = ["admin", "gestionnaire"];

router.get("/",       authorize(GESTION),   c.list);       // liste complète : admin/gestionnaire
router.get("/:id",    authorize(TOUS),      c.getById);    // chacun peut voir son profil
router.post("/",      authorize(["admin"]), c.create);
router.patch("/:id",  authorize(GESTION),   c.update);
router.delete("/:id", authorize(["admin"]), c.remove);

module.exports = router;
