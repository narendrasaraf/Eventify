'use strict';

const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { signupRules, loginRules } = require('./auth.validation');
const { protect } = require('../../middleware/auth.middleware');
const { authRateLimiter } = require('../../middleware/rateLimit.middleware');

/**
 * Auth Routes — /api/v1/auth
 * All validation middleware runs before controllers.
 * Rate limiter applied to sensitive endpoints.
 */

// Local auth
router.post('/signup', authRateLimiter, signupRules, authController.signup);
router.post('/login',  authRateLimiter, loginRules,  authController.login);
router.post('/logout',  authController.logout);
router.post('/refresh', authController.refresh);

// Current user
router.get('/me', protect, authController.getMe);

// Google OAuth
router.get('/google',          authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

module.exports = router;
