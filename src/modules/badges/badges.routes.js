const router = require('express').Router();
const c = require('./badges.controller');
const { authorize } = require('../../middleware/authorize.middleware');

const TOUS    = ["admin", "gestionnaire", "agent", "analyste", "citoyen"];

router.get('/',       authorize(TOUS),        c.list);
router.get('/:id',    authorize(TOUS),        c.getById);
router.post('/',      authorize(["admin"]),   c.create);
router.patch('/:id',  authorize(["admin"]),   c.update);
router.delete('/:id', authorize(["admin"]),   c.remove);

module.exports = router;
