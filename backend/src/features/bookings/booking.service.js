'use strict';

const BookingRepository = require('./booking.repository');
const EventRepository = require('../events/event.repository');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const BookingService = {
  /**
   * Book a free event for the current user.
   * Enforces: event exists, attendee limit, no duplicate booking.
   */
  bookEvent: async (userId, eventId) => {
    const event = await EventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

    if (event.status !== 'published') {
      throw new AppError('This event is not available for booking', 400, 'EVENT_UNAVAILABLE');
    }

    // Duplicate check (also enforced by DB unique index)
    const existing = await BookingRepository.findOne({ userId, eventId });
    if (existing && existing.status !== 'Cancelled') {
      throw new AppError('You are already registered for this event', 409, 'ALREADY_BOOKED');
    }

    // Attendee limit check
    if (event.attendeeLimit) {
      const count = await BookingRepository.countByEvent(eventId);
      if (count >= event.attendeeLimit) {
        throw new AppError('This event is fully booked', 409, 'EVENT_FULL');
      }
    }

    const booking = await BookingRepository.create({ userId, eventId });
    logger.info(`Booking created: user ${userId} for event ${eventId} [${booking.ticketNumber}]`);
    return booking;
  },

  /**
   * Get all bookings for the current user.
   */
  getMyBookings: async (userId) => {
    const bookings = await BookingRepository.findByUser(userId);
    // Filter out bookings where the event was deleted (populate returns null)
    return bookings.filter((b) => b.eventId !== null);
  },

  /**
   * Cancel a booking (only by the booking owner).
   */
  cancelBooking: async (bookingId, userId) => {
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');

    if (booking.userId.toString() !== userId.toString()) {
      throw new AppError('You are not authorized to cancel this booking', 403, 'FORBIDDEN');
    }

    if (booking.status === 'Cancelled') {
      throw new AppError('Booking is already cancelled', 400, 'ALREADY_CANCELLED');
    }

    const updated = await BookingRepository.updateById(bookingId, { status: 'Cancelled' });
    logger.info(`Booking cancelled: ${bookingId} by user ${userId}`);
    return updated;
  },
};

module.exports = BookingService;
