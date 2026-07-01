'use strict';

const express = require('express');
const router = express.Router();
const MeetingController = require('./meeting.controller');
const { protect } = require('../../middleware/auth.middleware');

// Protect all meeting endpoints
router.use(protect);

router.get('/event/:eventId', MeetingController.getMeetingForEvent);
router.post('/',              MeetingController.createMeeting);
router.patch('/:id',          MeetingController.updateMeeting);
router.delete('/:id',         MeetingController.deleteMeeting);

module.exports = router;
