const router = require('express').Router()
const c = require('../controllers/profilesControllers')
// const { requireAuth } = require('../middleware/auth')

// router.use(requireAuth) // décommente si tu veux tout protéger

router.get('/', c.list)
router.get('/:id', c.getById)
router.post('/', c.create)
router.patch('/:id', c.update)
router.delete('/:id', c.remove)

module.exports = router
