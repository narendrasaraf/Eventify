'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const path = require('path');

const config = require('./config/index');
const logger = require('./utils/logger');
const { apiRateLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFound } = require('./middleware/error.middleware');

// ─── Feature Routers ─────────────────────────────────────────────────────────
const authRoutes    = require('./features/auth/auth.routes');
const eventRoutes   = require('./features/events/event.routes');
const bookingRoutes = require('./features/bookings/booking.routes');
const userRoutes    = require('./features/users/user.routes');
const intelligenceRoutes = require('./features/intelligence/intelligence.routes');

// ─── Passport Strategy Config ────────────────────────────────────────────────
const configurePassport = require('./config/passport');

const app = express();

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,              // Allow cookies
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── HTTP Request Logging ─────────────────────────────────────────────────────
if (config.isDev) {
  app.use(morgan('dev'));
} else {
  // In production, log as JSON through Winston
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.http(msg.trim()) },
    })
  );
}

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Static Files (for local poster uploads in dev) ──────────────────────────
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ─── Session (required by Passport for OAuth flow handshake only) ─────────────
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.isProd,
      sameSite: config.isProd ? 'strict' : 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes — only needed during OAuth handshake
    },
  })
);

// ─── Passport Initialization ──────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());
configurePassport(); // Register Google strategy

// ─── Global API Rate Limiter ──────────────────────────────────────────────────
app.use('/api', apiRateLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ─── API v1 Routes ────────────────────────────────────────────────────────────
app.use('/api/v1/auth',         authRoutes);
app.use('/api/v1/events',       eventRoutes);
app.use('/api/v1/bookings',     bookingRoutes);
app.use('/api/v1/users',        userRoutes);
app.use('/api/v1/intelligence', intelligenceRoutes);

// ─── Legacy Route Aliases (backward compat for existing frontend) ─────────────
// These aliases allow the existing frontend to keep working without code changes.
// Gradually migrate frontend to /api/v1/* and remove these aliases.
app.use('/auth',         authRoutes);          // old: /auth/login, /auth/signup
app.use('/api/events',   eventRoutes);         // old: /api/events
app.use('/api/book',     bookingRoutes);       // old: /api/book
app.use('/api/my-bookings', bookingRoutes);    // old: /api/my-bookings
app.use('/api/users',    userRoutes);          // old: /api/users/me

// ─── 404 + Error Handlers (MUST be last) ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
