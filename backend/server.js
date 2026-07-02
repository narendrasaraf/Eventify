'use strict';

// Config MUST be loaded first — throws if required env vars are missing
const config = require('./src/config/index');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const app = require('./src/app');

const startServer = async () => {
  // Connect to MongoDB before accepting requests
  await connectDB();

  const server = app.listen(config.port, async () => {
    logger.info(
      `Server running in ${config.env} mode on http://localhost:${config.port}`
    );
    logger.info(`API v1 available at http://localhost:${config.port}/api/v1`);

    // Run Database Seeding
    try {
      const seedDatabase = require('./src/config/seed');
      await seedDatabase();
    } catch (seedErr) {
      logger.error(`Seeding failed: ${seedErr.message}`);
    }
  });

  // Initialize Socket.IO
  try {
    const socketio = require('socket.io');
    const io = socketio(server, {
      cors: {
        origin: config.frontend.url,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      }
    });

    const initCommunitySocket = require('./src/features/community/community.socket');
    initCommunitySocket(io);
    logger.info('Socket.IO community rooms attached.');
  } catch (ioErr) {
    logger.error(`Socket.IO setup error: ${ioErr.message}`);
  }

  // ─── Graceful Shutdown ─────────────────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10s if graceful shutdown hangs
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  // ─── Unhandled Promise Rejections ────────────────────────────────────────
  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    shutdown('unhandledRejection');
  });
};

startServer();