'use strict';

const logger = require('../../../utils/logger');

// Dynamic trace repository for local inspection
const traces = [];

/**
 * AI Observability Tracker
 * Captures logs and trace performance metrics for AI invocation loops.
 */
const AIObservability = {
  /**
   * Begins a new trace transaction.
   * @param {string} taskName - Name of task (e.g. 'draft-event')
   * @param {string} prompt - Raw prompt string
   * @returns {object} Transaction token tracker
   */
  startTrace: (taskName, prompt) => {
    const transactionId = Math.random().toString(36).substring(7);
    const startTime = Date.now();

    logger.info(`[AI Trace Start] ID: ${transactionId} | Task: ${taskName}`);

    return {
      transactionId,
      taskName,
      prompt,
      startTime,
      complete: (response) => {
        const duration = Date.now() - startTime;
        const record = {
          transactionId,
          taskName,
          prompt,
          responseText: response.text || (response.data ? JSON.stringify(response.data) : ''),
          model: response.model,
          provider: response.provider,
          usage: response.usage || { inputTokens: 0, outputTokens: 0 },
          durationMs: duration,
          timestamp: new Date(),
        };

        // Maintain size cap to avoid memory growth leaks
        if (traces.length > 50) traces.shift();
        traces.push(record);

        logger.info(
          `[AI Trace Complete] ID: ${transactionId} | Model: ${record.model} | Time: ${duration}ms | Tokens: In=${record.usage.inputTokens}, Out=${record.usage.outputTokens}`
        );
      },
      fail: (err) => {
        const duration = Date.now() - startTime;
        logger.error(
          `[AI Trace Failed] ID: ${transactionId} | Time: ${duration}ms | Error: ${err.message}`
        );
      },
    };
  },

  /**
   * Retrieves log of recent trace records.
   */
  getTraces: () => {
    return traces;
  },
};

module.exports = AIObservability;
