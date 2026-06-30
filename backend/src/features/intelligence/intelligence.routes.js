'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./intelligence.controller');
const { protect, optionalAuth } = require('../../middleware/auth.middleware');

/**
 * Intelligence Routes — /api/v1/intelligence
 */

// Protected: Only authenticated creators/users can draft events, optimize schedules, or query metrics
router.post('/draft-event',       protect, controller.draftEvent);
router.post('/schedule-optimizer', protect, controller.scheduleOptimizer);
router.post('/dashboard-insights', protect, controller.dashboardInsights);

// Public / Optional: Prospective attendees (who might not be logged in) can ask questions
router.post('/support-agent', optionalAuth, controller.supportAgent);

module.exports = router;
