'use strict';

const crypto = require('crypto');
const MeetingRepository = require('./meeting.repository');
const Event = require('../../models/Event');
const Booking = require('../../models/Booking');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const MeetingService = {
  /**
   * Automatically generate Jitsi room credentials for an event.
   */
  createMeeting: async ({ eventId, organizerId, password = '' }) => {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    // Check if meeting already exists
    const existing = await MeetingRepository.findByEventId(eventId);
    if (existing) {
      return existing;
    }

    // Generate unique Jitsi room name
    const randomHash = crypto.randomBytes(4).toString('hex');
    const sanitizedTitle = event.eventName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substr(0, 20);
    const roomName = `eventify_${sanitizedTitle}_${eventId}_${randomHash}`;
    const roomUrl = `https://meet.jit.si/${roomName}`;

    const meeting = await MeetingRepository.create({
      eventId,
      roomName,
      roomUrl,
      meetingType: 'Jitsi',
      password,
      organizerId,
      startTime: event.startDate,
      endTime: event.endDate,
      status: 'Active',
    });

    logger.info(`Jitsi Meet room automatically configured: ${roomName} for event ${eventId}`);
    return meeting;
  },

  /**
   * Retrieves Jitsi room credentials with strict permission validation.
   */
  getMeetingForEvent: async (eventId, userId) => {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    const meeting = await MeetingRepository.findByEventId(eventId);
    if (!meeting) {
      throw new AppError('No online meeting configured for this event', 404, 'MEETING_NOT_CONFIGURED');
    }

    // 1. Organizer always has access
    if (event.createdBy.toString() === userId.toString()) {
      return { ...meeting.toObject(), role: 'moderator' };
    }

    // 2. Check if user has registered / purchased ticket
    const booking = await Booking.findOne({ userId, eventId });
    if (!booking || booking.status !== 'Confirmed') {
      throw new AppError('You must register and complete payment to join this meeting', 403, 'ADMISSION_REQUIRED');
    }

    // Attendee has access
    return { ...meeting.toObject(), role: 'participant' };
  },

  /**
   * Update meeting configurations (e.g. password, times).
   */
  updateMeeting: async (meetingId, userId, updates) => {
    const meeting = await MeetingRepository.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', 404, 'MEETING_NOT_FOUND');
    }

    if (meeting.organizerId.toString() !== userId.toString()) {
      throw new AppError('Only the event organizer can modify meeting details', 403, 'UNAUTHORIZED');
    }

    const updated = await MeetingRepository.updateById(meetingId, updates);
    logger.info(`Jitsi Meeting ${meetingId} configurations updated by organizer`);
    return updated;
  },

  /**
   * Delete or cancel a meeting session.
   */
  deleteMeeting: async (meetingId, userId) => {
    const meeting = await MeetingRepository.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', 404, 'MEETING_NOT_FOUND');
    }

    if (meeting.organizerId.toString() !== userId.toString()) {
      throw new AppError('Only the event organizer can cancel meeting details', 403, 'UNAUTHORIZED');
    }

    await MeetingRepository.deleteById(meetingId);
    logger.info(`Jitsi Meeting ${meetingId} deleted by organizer`);
    return { success: true };
  },
};

module.exports = MeetingService;
