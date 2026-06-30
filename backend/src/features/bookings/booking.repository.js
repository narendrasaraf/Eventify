'use strict';

const Booking = require('../../models/Booking');

const BookingRepository = {
  findById: (id) => Booking.findById(id).populate('eventId'),

  findByUser: (userId) =>
    Booking.find({ userId, status: { $ne: 'Cancelled' } })
      .populate({ path: 'eventId', match: { isDeleted: false } })
      .sort({ bookingDate: -1 }),

  findByEvent: (eventId) =>
    Booking.find({ eventId, status: { $ne: 'Cancelled' } }).populate('userId', 'name email'),

  findOne: (filter) => Booking.findOne(filter),

  create: (data) => Booking.create(data),

  updateById: (id, updates) =>
    Booking.findByIdAndUpdate(id, updates, { new: true }),

  countByEvent: (eventId) =>
    Booking.countDocuments({ eventId, status: { $ne: 'Cancelled' } }),
};

module.exports = BookingRepository;
