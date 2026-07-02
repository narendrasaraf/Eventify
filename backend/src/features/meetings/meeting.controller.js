'use strict';

const MeetingService = require('./meeting.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

/**
 * Controller handlers for Meeting entity.
 */
const MeetingController = {
  /**
   * GET /api/v1/meetings/event/:eventId
   */
  getMeetingForEvent: asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) {
      throw new AppError('Event ID parameter is required', 400, 'EVENT_ID_REQUIRED');
    }

    const meetingDetails = await MeetingService.getMeetingForEvent(eventId, req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: { meeting: meetingDetails },
    });
  }),

  /**
   * GET /api/v1/meetings/join/:eventId
   */
  joinMeeting: asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) {
      throw new AppError('Event ID parameter is required', 400, 'EVENT_ID_REQUIRED');
    }

    const meetingDetails = await MeetingService.getMeetingForEvent(eventId, req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: { meeting: meetingDetails },
    });
  }),

  /**
   * GET /api/v1/meetings/launch/:eventId
   */
  launchMeeting: asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    if (!eventId) {
      throw new AppError('Event ID parameter is required', 400, 'EVENT_ID_REQUIRED');
    }

    const Event = require('../../models/Event');
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    if (event.createdBy.toString() !== req.user.id.toString()) {
      throw new AppError('Only the event organizer can launch this meeting', 403, 'FORBIDDEN');
    }

    const meetingDetails = await MeetingService.getMeetingForEvent(eventId, req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: { meeting: meetingDetails },
    });
  }),

  /**
   * POST /api/v1/meetings
   */
  createMeeting: asyncHandler(async (req, res) => {
    const { eventId, password } = req.body;
    if (!eventId) {
      throw new AppError('Event ID is required', 400, 'EVENT_ID_REQUIRED');
    }

    const meeting = await MeetingService.createMeeting({
      eventId,
      organizerId: req.user.id,
      password,
    });

    res.status(201).json({
      status: 'success',
      data: { meeting },
    });
  }),

  /**
   * PATCH /api/v1/meetings/:id
   */
  updateMeeting: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const meeting = await MeetingService.updateMeeting(id, req.user.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { meeting },
    });
  }),

  /**
   * DELETE /api/v1/meetings/:id
   */
  deleteMeeting: asyncHandler(async (req, res) => {
    const { id } = req.params;
    await MeetingService.deleteMeeting(id, req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Meeting configuration deleted successfully.',
    });
  }),
};

module.exports = MeetingController;
