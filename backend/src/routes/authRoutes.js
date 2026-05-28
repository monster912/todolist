'use strict';

const { Router } = require('express');
const { validateRegister, validateLogin } = require('../middlewares/validateAuth');
const authenticate = require('../middlewares/authenticate');
const authController = require('../controllers/authController');

const router = Router();

router.post('/register', validateRegister, authController.register);
router.post('/login',    validateLogin,    authController.login);
router.get('/me',        authenticate,     authController.getMe);
router.put('/me',        authenticate,     authController.updateMe);
router.delete('/me',     authenticate,     authController.deleteMe);

module.exports = router;
