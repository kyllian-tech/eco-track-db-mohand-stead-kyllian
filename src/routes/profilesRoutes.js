/**
 * Fichier : profilesRoutes.js
 * Rôle : Définition des routes HTTP liées aux profils.
 * Contenu : Associe des endpoints (GET/POST/PUT/DELETE) à des fonctions de controller.
 */

const router = require("express").Router();
const c = require("../controllers/profilesControllers");

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
