'use strict';

/**
 * asyncHandler — Wraps async route handlers to eliminate try/catch boilerplate.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res, next) => { ... }));
 *
 * Any rejected promise is forwarded to Express's centralized error middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
