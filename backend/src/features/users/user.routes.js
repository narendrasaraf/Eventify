'use strict';

const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middleware/auth.middleware');

/**
 * User Routes — /api/v1/users
 */
router.use(protect);

router.get('/me',   userController.getMe);
router.patch('/me', userController.updateMe);

module.exports = router;
