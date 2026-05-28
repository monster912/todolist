'use strict';

const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const validateCategory = require('../middlewares/validateCategory');
const categoryController = require('../controllers/categoryController');

const router = Router();

router.use(authenticate);

router.get('/',      categoryController.getAll);
router.post('/',     validateCategory, categoryController.create);
router.put('/:id',   validateCategory, categoryController.update);
router.delete('/:id',                  categoryController.remove);

module.exports = router;
