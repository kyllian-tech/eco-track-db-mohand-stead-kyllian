const router = require('express').Router()
const c = require('../controllers/challengesControllers')

// GET /api/challenges -> liste des challenges
router.get('/', c.list)

// GET /api/challenges/:id -> challenge par id
router.get('/:id', c.getById)

// POST /api/challenges -> création
router.post('/', c.create)

// PATCH /api/challenges/:id -> mise à jour
router.patch('/:id', c.update)

// DELETE /api/challenges/:id -> suppression
router.delete('/:id', c.remove)

module.exports = router
