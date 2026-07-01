'use strict';

const EventRepository = require('./event.repository');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

/**
 * EventService — Business logic for events.
 */
const EventService = {
  /**
   * Get paginated list of events with optional filters.
   * @param {object} query - { type, category, page, limit, search }
   */
  listEvents: async (query = {}) => {
    const { type, category, mode, page = 1, limit = 12, search } = query;
    const filter = {};

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (mode) filter.mode = mode;
    if (search) {
      filter.$or = [
        { eventName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizerName: { $regex: search, $options: 'i' } },
      ];
    }

    return EventRepository.findMany(filter, {
      page: parseInt(page, 10),
      limit: Math.min(parseInt(limit, 10), 50), // Cap at 50
      sort: { startDate: 1 },
    });
  },

  /**
   * Get a single event by id.
   */
  getEventById: async (id) => {
    const event = await EventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    return event;
  },

  /**
   * Create a new event.
   * @param {object} data  - Form data from request body
   * @param {string} userId - The authenticated user's id
   * @param {string} [posterUrl] - URL from Cloudinary upload
   * @param {string} [posterPublicId] - Cloudinary public_id
   */
  createEvent: async (data, userId, posterUrl = '', posterPublicId = '') => {
    const eventData = {
      ...data,
      createdBy: userId,
      posterUrl,
      posterPublicId,
      // Ensure dates are proper Date objects
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate:   data.endDate   ? new Date(data.endDate)   : undefined,
      registrationDeadline: data.registrationDeadline
        ? new Date(data.registrationDeadline)
        : undefined,
      ticketPrice: data.ticketPrice ? Number(data.ticketPrice) : 0,
      attendeeLimit: data.attendeeLimit ? Number(data.attendeeLimit) : undefined,
    };

    let event = await EventRepository.create(eventData);

    const Notification = require('../../models/Notification');

    // Create event notification
    try {
      await Notification.create({
        userId,
        title: 'Event Created Successfully',
        body: `Your event "${event.eventName}" is now live on Eventify.`,
        type: 'success',
      });
    } catch (nErr) {
      logger.error(`Notification failed for event creation: ${nErr.message}`);
    }

    if ((event.mode === 'Online' || event.mode === 'Hybrid') && event.meetingPlatform === 'Jitsi') {
      try {
        const MeetingService = require('../meetings/meeting.service');
        const meeting = await MeetingService.createMeeting({
          eventId: event._id,
          organizerId: userId,
        });
        event = await EventRepository.updateById(event._id, { meetingLink: meeting.roomUrl });

        // Create Jitsi ready notification
        try {
          await Notification.create({
            userId,
            title: 'Virtual Workspace Ready',
            body: `Jitsi Meet live conference session automatically configured for "${event.eventName}".`,
            type: 'ai',
          });
        } catch (nErr) {
          logger.error(`Notification failed for Jitsi creation: ${nErr.message}`);
        }
      } catch (err) {
        logger.error(`Failed to auto-create Jitsi meeting on event creation: ${err.message}`);
      }
    }

    logger.info(`Event created: "${event.eventName}" by user ${userId}`);
    return event;
  },

  /**
   * Update an event (only by owner or admin).
   */
  updateEvent: async (id, updates, requestingUserId, requestingUserRole) => {
    const event = await EventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

    const isOwner = event.createdBy.toString() === requestingUserId.toString();
    if (!isOwner && requestingUserRole !== 'admin') {
      throw new AppError('You do not have permission to update this event', 403, 'FORBIDDEN');
    }

    return EventRepository.updateById(id, updates);
  },

  /**
   * Soft-delete an event (only by owner or admin).
   */
  deleteEvent: async (id, requestingUserId, requestingUserRole) => {
    const event = await EventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');

    const isOwner = event.createdBy.toString() === requestingUserId.toString();
    if (!isOwner && requestingUserRole !== 'admin') {
      throw new AppError('You do not have permission to delete this event', 403, 'FORBIDDEN');
    }

    await EventRepository.softDeleteById(id);
    logger.info(`Event soft-deleted: ${id} by user ${requestingUserId}`);
  },

  /**
   * Get all events created by the requesting user.
   */
  getMyEvents: (userId) => EventRepository.findByCreator(userId),
};

module.exports = EventService;
