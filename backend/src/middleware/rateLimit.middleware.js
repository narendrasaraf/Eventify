'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/index');

/**
 * General API rate limiter — applied to all /api/v1 routes.
 */
const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    code: 'RATE_LIMITED',
    message: `Too many requests. Please try again after ${config.rateLimit.windowMs / 60000} minutes.`,
  },
});

/**
 * Strict auth rate limiter — applied to /auth/login and /auth/signup only.
 * Tighter to prevent brute-force attacks.
 * Keyed on IP only (email-based keying needs IPv6 helper).
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    code: 'AUTH_RATE_LIMITED',
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
});

module.exports = { apiRateLimiter, authRateLimiter };

