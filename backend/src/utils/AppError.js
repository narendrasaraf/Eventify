'use strict';

/**
 * AppError — Operational (expected) errors.
 *
 * Distinguishes operational errors (wrong password, not found, etc.)
 * from programming errors (bugs). Only operational errors are sent to the client.
 *
 * Usage:
 *   throw new AppError('Event not found', 404);
 *   throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
 */
class AppError extends Error {
  /**
   * @param {string} message     - Human-readable message (sent to client)
   * @param {number} statusCode  - HTTP status code
   * @param {string} [code]      - Optional machine-readable error code
   */
  constructor(message, statusCode, code = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    // Capture V8 stack trace, excluding constructor frame
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
