'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { signupSchema, loginSchema, updateProfileSchema, validate } = require('../validators/authValidator');

router.post('/register', validate(signupSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);
router.put('/profile', requireAuth, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
