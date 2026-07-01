'use strict';

const Meeting = require('../../models/Meeting');

/**
 * MeetingRepository — Data access layer for Jitsi Meetings collection.
 */
const MeetingRepository = {
  create: (data) => Meeting.create(data),

  findByEventId: (eventId) => Meeting.findOne({ eventId }),

  findById: (id) => Meeting.findById(id),

  updateById: (id, updates) =>
    Meeting.findByIdAndUpdate(id, updates, { new: true, runValidators: true }),

  deleteById: (id) => Meeting.findByIdAndDelete(id),
};

module.exports = MeetingRepository;
