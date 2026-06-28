const router = require("express").Router();
const c = require("./userBadges.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION = ["admin", "gestionnaire"];

router.get("/",  authorize(TOUS),    c.list);     // chacun voit ses badges
router.post("/", authorize(GESTION), c.create);   // attribution par gestionnaire/admin
router.delete("/", authorize(["admin"]), c.remove);

module.exports = router;
