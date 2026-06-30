'use strict';

const { createLogger, format, transports } = require('winston');
const config = require('../config/index');

const { combine, timestamp, printf, colorize, errors, json } = format;

/**
 * Development format: colorized + human-readable
 */
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return stack
      ? `[${ts}] ${level}: ${message}\n${stack}`
      : `[${ts}] ${level}: ${message}`;
  })
);

/**
 * Production format: structured JSON for log aggregators (Datadog, CloudWatch, etc.)
 */
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: config.log.level,
  format: config.isProd ? prodFormat : devFormat,
  transports: [
    new transports.Console(),
    // In production, add file/cloud transports here:
    // new transports.File({ filename: 'logs/error.log', level: 'error' }),
    // new transports.File({ filename: 'logs/combined.log' }),
  ],
  // Prevent Winston from crashing the process on uncaught exceptions
  exceptionHandlers: [new transports.Console()],
  rejectionHandlers: [new transports.Console()],
});

module.exports = logger;
