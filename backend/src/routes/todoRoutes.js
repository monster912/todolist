'use strict';

const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const { validateCreateTodo, validateUpdateTodo } = require('../middlewares/validateTodo');
const todoController = require('../controllers/todoController');

const router = Router();

router.use(authenticate);

router.get('/',           todoController.getAll);
router.post('/',          validateCreateTodo, todoController.create);
router.get('/:id',        todoController.getOne);
router.put('/:id',        validateUpdateTodo, todoController.update);
router.patch('/:id/done', todoController.toggleDone);
router.delete('/:id',     todoController.remove);

module.exports = router;
