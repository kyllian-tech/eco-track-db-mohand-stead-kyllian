// src/modules/profiles/profiles.routes.js
const router = require("express").Router();
const c = require("./profiles.controller");

// GET /api/profiles -> liste des profils
router.get("/", c.list);

// GET /api/profiles/:id -> profil par id
router.get("/:id", c.getById);

// POST /api/profiles -> création
router.post("/", c.create);

// PATCH /api/profiles/:id -> mise à jour
router.patch("/:id", c.update);

// DELETE /api/profiles/:id -> suppression
router.delete("/:id", c.remove);

module.exports = router;
