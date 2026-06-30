'use strict';

/**
 * CONFIG MODULE
 * Single source of truth for all environment-driven configuration.
 * Throws on startup if any REQUIRED variable is missing.
 * Never import process.env anywhere else — always import this module.
 */

const path = require('path');

// Load .env from the backend root
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// ─── Guard: required variables ────────────────────────────────────────────────
const REQUIRED = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'MONGO_URI',
  'SESSION_SECRET',
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `[Config] Missing required environment variables: ${missing.join(', ')}\n` +
    `Copy backend/.env.example to backend/.env and fill in all required values.`
  );
}

// ─── Exported config object ───────────────────────────────────────────────────
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongo: {
    uri: process.env.MONGO_URI,
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  session: {
    secret: process.env.SESSION_SECRET,
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5000/api/v1/auth/google/callback',
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  },

  log: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
  },

  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
};

module.exports = config;
