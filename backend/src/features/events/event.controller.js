'use strict';

const { validationResult } = require('express-validator');
const EventService = require('./event.service');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

/**
 * EventController — HTTP layer for events.
 */

/**
 * GET /api/v1/events
 * Public — paginated, filterable list of events.
 */
const listEvents = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'fail', errors: errors.array() });
  }

  const result = await EventService.listEvents(req.query);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * GET /api/v1/events/my
 * Protected — events created by the current user.
 */
const getMyEvents = asyncHandler(async (req, res) => {
  const events = await EventService.getMyEvents(req.user.id);
  res.status(200).json({ status: 'success', data: { events } });
});

/**
 * GET /api/v1/events/:id
 * Public — single event detail.
 */
const getEvent = asyncHandler(async (req, res) => {
  const event = await EventService.getEventById(req.params.id);
  res.status(200).json({ status: 'success', data: { event } });
});

/**
 * POST /api/v1/events
 * Protected — create a new event.
 */
const createEvent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'fail', errors: errors.array() });
  }

  // posterUrl will be set by upload middleware. Convert local filesystem path to public relative URL.
  const posterUrl = req.file 
    ? (req.file.filename ? `/uploads/${req.file.filename}` : req.file.path || req.file.location || '') 
    : '';
  const posterPublicId = req.file ? req.file.filename || '' : '';

  const event = await EventService.createEvent(
    req.body,
    req.user.id,
    posterUrl,
    posterPublicId
  );

  res.status(201).json({ status: 'success', data: { event } });
});

/**
 * PATCH /api/v1/events/:id
 * Protected — update an event (owner or admin).
 */
const updateEvent = asyncHandler(async (req, res) => {
  const event = await EventService.updateEvent(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role
  );
  res.status(200).json({ status: 'success', data: { event } });
});

/**
 * DELETE /api/v1/events/:id
 * Protected — soft-delete an event (owner or admin).
 */
const deleteEvent = asyncHandler(async (req, res) => {
  await EventService.deleteEvent(req.params.id, req.user.id, req.user.role);
  res.status(204).send();
});

module.exports = { listEvents, getMyEvents, getEvent, createEvent, updateEvent, deleteEvent };
