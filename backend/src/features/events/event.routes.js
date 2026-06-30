'use strict';

const express = require('express');
const router = express.Router();
const eventController = require('./event.controller');
const { createEventRules, listEventsRules } = require('./event.validation');
const { protect } = require('../../middleware/auth.middleware');
const { uploadPoster } = require('../../middleware/upload.middleware');

/**
 * Event Routes — /api/v1/events
 */

// Public
router.get('/',    listEventsRules, eventController.listEvents);
router.get('/my',  protect, eventController.getMyEvents);
router.get('/:id', eventController.getEvent);

// Protected
router.post(
  '/',
  protect,
  uploadPoster,
  createEventRules,
  eventController.createEvent
);

router.patch('/:id', protect, eventController.updateEvent);
router.delete('/:id', protect, eventController.deleteEvent);

module.exports = router;
