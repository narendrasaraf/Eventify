'use strict';

const AppError = require('../utils/AppError');

/**
 * RBAC Middleware Factory
 *
 * Returns a middleware that allows access only to users with the specified roles.
 * Must be used AFTER the protect middleware (req.user must be set).
 *
 * Usage:
 *   router.delete('/admin/events/:id', protect, requireRole('admin'), ...)
 *   router.post('/events', protect, requireRole('organizer', 'admin'), ...)
 */
const requireRole = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'NO_TOKEN'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Required role: ${roles.join(' or ')}`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

module.exports = { requireRole };
