'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { protect } = require('../../middleware/auth.middleware');

// Apply protection to all notification endpoints
router.use(protect);

router.get('/', notificationController.getMyNotifications);
router.post('/read-all', notificationController.markAllRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
