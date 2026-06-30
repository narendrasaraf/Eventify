'use strict';

// Config MUST be loaded first — throws if required env vars are missing
const config = require('./src/config/index');
const connectDB = require('./src/config/database');
const logger = require('./src/utils/logger');
const app = require('./src/app');

const startServer = async () => {
  // Connect to MongoDB before accepting requests
  await connectDB();

  const server = app.listen(config.port, () => {
    logger.info(
      `Server running in ${config.env} mode on http://localhost:${config.port}`
    );
    logger.info(`API v1 available at http://localhost:${config.port}/api/v1`);
  });

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