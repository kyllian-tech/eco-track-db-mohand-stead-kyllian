const router = require("express").Router();
const c = require("./containers.controller");
const { authorize } = require("../../middleware/authorize.middleware");

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];
const GESTION = ["admin", "gestionnaire"];

router.get("/",       authorize(TOUS),         c.list);
router.get("/:id",    authorize(TOUS),         c.getById);
router.post("/",      authorize(GESTION),      c.create);
router.patch("/:id",  authorize(GESTION),      c.update);
router.delete("/:id", authorize(["admin"]),    c.remove);

module.exports = router;
