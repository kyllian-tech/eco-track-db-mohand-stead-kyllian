const router = require('express').Router()
const c = require('../controllers/badgesControllers')

router.get('/', c.list)
router.get('/:id', c.getById)
router.post('/', c.create)
router.patch('/:id', c.update)
router.delete('/:id', c.remove)

module.exports = router
