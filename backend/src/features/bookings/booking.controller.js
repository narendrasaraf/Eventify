'use strict';

const BookingService = require('./booking.service');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * GET /api/v1/bookings — Current user's bookings
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await BookingService.getMyBookings(req.user.id);
  res.status(200).json({ status: 'success', data: { bookings } });
});

/**
 * POST /api/v1/bookings — Book an event
 */
const bookEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  if (!eventId) {
    return res.status(422).json({ status: 'fail', message: 'eventId is required' });
  }
  const booking = await BookingService.bookEvent(req.user.id, eventId);
  res.status(201).json({ status: 'success', data: { booking } });
});

/**
 * DELETE /api/v1/bookings/:id — Cancel a booking
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await BookingService.cancelBooking(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: { booking } });
});

module.exports = { getMyBookings, bookEvent, cancelBooking };
