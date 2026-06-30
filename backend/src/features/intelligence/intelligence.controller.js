'use strict';

const AIService = require('../../services/ai.service');
const EventRepository = require('../events/event.repository');
const BookingRepository = require('../bookings/booking.repository');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

/**
 * IntelligenceController
 * Exposes natural language cognitive services wrapper controllers.
 */

/**
 * POST /api/v1/intelligence/draft-event
 * Takes a natural language prompt and returns a structured event preview.
 */
const draftEvent = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    throw new AppError('A plain-text prompt description is required', 400, 'PROMPT_REQUIRED');
  }

  const result = await AIService.draftEvent(prompt);

  res.status(200).json({
    status: 'success',
    data: { eventDraft: result },
  });
});

/**
 * POST /api/v1/intelligence/support-agent
 * Conversational helpdesk widget helper.
 */
const supportAgent = asyncHandler(async (req, res) => {
  const { eventId, question, history = [] } = req.body;
  if (!eventId) {
    throw new AppError('eventId is required to load context', 400, 'EVENT_ID_REQUIRED');
  }
  if (!question || typeof question !== 'string') {
    throw new AppError('Question text is required', 400, 'QUESTION_REQUIRED');
  }

  const event = await EventRepository.findById(eventId);
  if (!event) {
    throw new AppError('The requested event details could not be found', 404, 'EVENT_NOT_FOUND');
  }

  const answer = await AIService.answerAttendeeQuestion(event, question, history);

  res.status(200).json({
    status: 'success',
    data: { answer },
  });
});

/**
 * POST /api/v1/intelligence/schedule-optimizer
 * Arranges speaker sessions/topics into tracks.
 */
const scheduleOptimizer = asyncHandler(async (req, res) => {
  const { topics, constraints = {} } = req.body;
  if (!Array.isArray(topics) || topics.length === 0) {
    throw new AppError('A topics array of session titles is required', 400, 'TOPICS_REQUIRED');
  }

  const schedule = await AIService.optimizeSchedule(topics, constraints);

  res.status(200).json({
    status: 'success',
    data: { schedule },
  });
});

/**
 * POST /api/v1/intelligence/dashboard-insights
 * Analyzes event performance statistics conversationally.
 */
const dashboardInsights = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    throw new AppError('A question query is required to generate insights', 400, 'QUERY_REQUIRED');
  }

  // Fetch events created by current user
  const events = await EventRepository.findByCreator(req.user._id);

  // Compile detailed stats per event
  const eventDetails = [];
  let totalRegistrations = 0;
  let totalRevenue = 0;
  const categoryMap = {};
  const modeMap = {};

  for (const event of events) {
    const bookingCount = await BookingRepository.countByEvent(event._id);
    const revenue = event.ticketType === 'Paid' ? (event.ticketPrice || 0) * bookingCount : 0;

    totalRegistrations += bookingCount;
    totalRevenue += revenue;

    categoryMap[event.category] = (categoryMap[event.category] || 0) + 1;
    modeMap[event.mode] = (modeMap[event.mode] || 0) + 1;

    eventDetails.push({
      id: event._id,
      eventName: event.eventName,
      category: event.category,
      mode: event.mode,
      ticketType: event.ticketType,
      ticketPrice: event.ticketPrice || 0,
      bookingsCount: bookingCount,
      revenueGeneratedINR: revenue,
      startDate: event.startDate,
    });
  }

  const statsSummary = {
    creatorName: req.user.name,
    totalEventsOrganized: events.length,
    totalAttendeeRegistrations: totalRegistrations,
    totalRevenueGeneratedINR: totalRevenue,
    eventsByCategory: categoryMap,
    eventsByMode: modeMap,
    eventsList: eventDetails,
  };

  const insightsMarkdown = await AIService.generateInsights(statsSummary, query);

  res.status(200).json({
    status: 'success',
    data: {
      stats: statsSummary,
      insights: insightsMarkdown,
    },
  });
});

module.exports = { draftEvent, supportAgent, scheduleOptimizer, dashboardInsights };
