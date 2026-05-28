'use strict';

const { Router } = require('express');
const authenticate = require('../middlewares/authenticate');
const userController = require('../controllers/userController');

const router = Router();

router.use(authenticate);

router.patch('/me/settings', userController.updateSettings);

module.exports = router;
