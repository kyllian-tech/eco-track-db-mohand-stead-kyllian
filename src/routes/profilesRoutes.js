/**
 * Fichier : profilesRoutes.js
 * Rôle : Définition des routes HTTP liées aux profils.
 * Contenu : Associe des endpoints (GET/POST/PUT/DELETE) à des fonctions de controller.
 * Note : Les routes peuvent être protégées par le middleware auth.
 */

const router = require('express').Router()
const c = require('../controllers/profilesControllers')
// const { requireAuth } = require('../middleware/auth')

// router.use(requireAuth) // décommente si tu veux tout protéger

// GET /profiles -> récupère une liste de profils (ou le profil courant)
router.get('/', c.list)

// GET /profiles/:id -> récupère un profil précis
router.get('/:id', c.getById)

// POST /profiles -> crée un nouveau profil
router.post('/', c.create)

// PATCH /profiles/:id -> met à jour un profil existant
router.patch('/:id', c.update)

// DELETE /profiles/:id -> supprime un profil
router.delete('/:id', c.remove)

module.exports = router
