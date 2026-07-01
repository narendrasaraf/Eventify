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

  // 1. Fetch events created by current user
  const events = await EventRepository.findByCreator(req.user.id);

  // 2. Fetch bookings made by current user
  const userBookings = await BookingRepository.findByUser(req.user.id);

  // 3. Fetch all other published events on platform
  const allEventsObj = await EventRepository.findMany({ status: 'published' });
  const platformEvents = allEventsObj.events || [];

  // Compile detailed stats per created event
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
    registeredBookingsList: userBookings.map(b => ({
      ticketNumber: b.ticketNumber,
      status: b.status,
      bookingDate: b.bookingDate,
      eventId: b.eventId?._id || b.eventId,
      eventName: b.eventId?.eventName,
      ticketType: b.eventId?.ticketType,
      ticketPrice: b.eventId?.ticketPrice,
      mode: b.eventId?.mode,
      startDate: b.eventId?.startDate,
    })),
    allPlatformEvents: platformEvents.map(e => ({
      id: e._id,
      eventName: e.eventName,
      category: e.category,
      mode: e.mode,
      ticketType: e.ticketType,
      ticketPrice: e.ticketPrice || 0,
      startDate: e.startDate,
    })),
    platformGuidingContext: {
      platformName: "Eventify",
      description: "An AI-First Virtual Event Platform designed for scheduling, hosting, ticketing and managing webinars, conferences, and meetups.",
      keyFeatures: [
        "Jitsi Meet Integration: Auto-generates secure virtual conference rooms for Online/Hybrid events.",
        "Razorpay Payments & UPI Integration: Supports seamless ticket purchases, including test mode UPI sandbox payments using mock VPAs like success@razorpay.",
        "AI Co-Creator: Drafts complete event profiles from plain-text natural language prompts.",
        "Live Notification Center: Real-time user notifications for bookings, virtual room preparation, and template publishing.",
        "Tickets Wallet: User hub to view, access, and download admission tickets.",
        "All Events Search, Pagination, & Sorting: Sorting by date/price/name and client-side pagination."
      ]
    }
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

/**
 * POST /api/v1/intelligence/platform-guide
 * Interactive platform guiding chat widget.
 */
const platformGuide = asyncHandler(async (req, res) => {
  const { question, history = [] } = req.body;
  if (!question || typeof question !== 'string') {
    throw new AppError('Question text is required', 400, 'QUESTION_REQUIRED');
  }

  let answer = await AIService.guidePlatformUser(question, history);

  // Check if guide assistant requested direct event creation
  if (answer.includes('<CREATE_EVENT>')) {
    if (!req.user || !req.user.id) {
      answer = "Please sign in/login to the platform first to create events.";
    } else {
      try {
        const jsonStart = answer.indexOf('<CREATE_EVENT>') + '<CREATE_EVENT>'.length;
        const jsonEnd = answer.indexOf('</CREATE_EVENT>');
        const jsonStr = answer.substring(jsonStart, jsonEnd).trim();
        const eventData = JSON.parse(jsonStr);

        const EventService = require('../events/event.service');
        const createdEvent = await EventService.createEvent(
          eventData,
          req.user.id,
          '',
          ''
        );

        answer = `I have successfully created your event! 🎉\n\n**Event Name**: ${createdEvent.eventName}\n**Category**: ${createdEvent.category}\n**Mode**: ${createdEvent.mode}\n**Date**: ${new Date(createdEvent.startDate).toLocaleString()}\n\nYou can view your new event here: [View Event details](/event/${createdEvent._id})`;
      } catch (err) {
        logger.error(`Direct event creation via guide chatbot failed: ${err.message}`);
        answer = "I understood you wanted to create an event, but I encountered an error setting it up. Please try again with more specific details.";
      }
    }
  }

  res.status(200).json({
    status: 'success',
    data: { answer },
  });
});

module.exports = { draftEvent, supportAgent, scheduleOptimizer, dashboardInsights, platformGuide };
