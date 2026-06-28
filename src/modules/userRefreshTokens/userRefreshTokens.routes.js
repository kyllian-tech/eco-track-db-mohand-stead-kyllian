const router = require("express").Router();
const c = require("./userRefreshTokens.controller");
const { authorize } = require("../../middleware/authorize.middleware");

// Gestion interne des tokens — admin uniquement
router.get("/",                    authorize(["admin"]), c.list);
router.get("/:id",                 authorize(["admin"]), c.getById);
router.post("/",                   authorize(["admin"]), c.create);
router.patch("/:id",               authorize(["admin"]), c.update);
router.delete("/by-user/:user_id", authorize(["admin"]), c.removeByUser);
router.delete("/:id",              authorize(["admin"]), c.remove);

module.exports = router;
