'use strict';

const { body, query } = require('express-validator');

const createEventRules = [
  body('eventName')
    .trim()
    .notEmpty().withMessage('Event name is required')
    .isLength({ max: 200 }).withMessage('Event name cannot exceed 200 characters'),

  body('type')
    .notEmpty().withMessage('Event type is required')
    .isIn(['Webinar', 'Conference', 'Meetup', 'Workshop', 'Other'])
    .withMessage('Invalid event type'),

  body('mode')
    .notEmpty().withMessage('Event mode is required')
    .isIn(['Online', 'Offline', 'Hybrid'])
    .withMessage('Invalid event mode'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),

  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('ticketPrice')
    .optional()
    .isNumeric().withMessage('Ticket price must be a number')
    .custom((val) => {
      if (Number(val) < 0) throw new Error('Ticket price cannot be negative');
      return true;
    }),

  body('attendeeLimit')
    .optional()
    .isInt({ min: 1 }).withMessage('Attendee limit must be a positive integer'),
];

const listEventsRules = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['Webinar', 'Conference', 'Meetup', 'Workshop', 'Other']),
  query('mode').optional().isIn(['Online', 'Offline', 'Hybrid']),
];

module.exports = { createEventRules, listEventsRules };
