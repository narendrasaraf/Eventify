'use strict';

const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { protect } = require('../../middleware/auth.middleware');

/**
 * Booking Routes — /api/v1/bookings
 * All routes require authentication.
 */
router.use(protect);

router.get('/',    bookingController.getMyBookings);
router.post('/',   bookingController.bookEvent);
router.delete('/:id', bookingController.cancelBooking);

module.exports = router;
