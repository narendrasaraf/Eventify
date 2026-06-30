'use strict';

const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const config = require('../config/index');

/**
 * Centralized Error Handling Middleware
 *
 * Must be registered LAST in the Express middleware chain.
 * Handles 4 categories of errors:
 *   1. Mongoose CastError (invalid ObjectId)
 *   2. Mongoose duplicate key (E11000)
 *   3. Mongoose ValidationError
 *   4. AppError (operational errors)
 *   5. Programming errors (bugs) — logged but not exposed to client
 */

// ─── Error normalizers ────────────────────────────────────────────────────────

const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400, 'INVALID_ID');

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `${field} already exists. Please use a different value.`,
    409,
    'DUPLICATE_FIELD'
  );
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 422, 'VALIDATION_ERROR');
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () =>
  new AppError('Token expired. Please log in again.', 401, 'TOKEN_EXPIRED');

// ─── Response senders ─────────────────────────────────────────────────────────

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // Operational errors: safe to send to client
    return res.status(err.statusCode).json({
      status: err.status,
      code: err.code,
      message: err.message,
    });
  }

  // Programming errors: don't leak details
  logger.error('PROGRAMMING ERROR:', err);
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong. Please try again later.',
  });
};

// ─── Main error handler ───────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors in development; only non-operational in production
  if (config.isDev || !err.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} → ${err.message}`, {
      stack: err.stack,
      statusCode: err.statusCode,
    });
  }

  if (config.isDev) {
    return sendErrorDev(err, res);
  }

  // Normalize known error types
  let normalizedErr = err;
  if (err.name === 'CastError')           normalizedErr = handleCastError(err);
  if (err.code === 11000)                 normalizedErr = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError')     normalizedErr = handleValidationError(err);
  if (err.name === 'JsonWebTokenError')   normalizedErr = handleJWTError();
  if (err.name === 'TokenExpiredError')   normalizedErr = handleJWTExpiredError();

  sendErrorProd(normalizedErr, res);
};

/**
 * 404 Not Found handler — for unmatched routes.
 */
const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, 'NOT_FOUND'));
};

module.exports = { errorHandler, notFound };
