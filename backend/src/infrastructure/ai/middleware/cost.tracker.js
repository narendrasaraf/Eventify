'use strict';

const modelRegistry = require('../config/models');
const logger = require('../../../utils/logger');

// Global running cost aggregator
let cumulativeCostUSD = 0;
let cumulativeTokens = { input: 0, output: 0 };

/**
 * AI Cost Tracker
 * Calculates dollar expenditure profiles for models.
 */
const CostTracker = {
  /**
   * Tracks and aggregates token costs based on execution usage.
   * @param {string} modelName - Model used (e.g. 'gemini-2.5-flash')
   * @param {object} usage - { inputTokens, outputTokens }
   */
  trackCost: (modelName, usage = {}) => {
    const inputCount = usage.inputTokens || 0;
    const outputCount = usage.outputTokens || 0;

    // Find model rates in registry
    let rates = null;
    for (const provider of Object.values(modelRegistry.providers)) {
      if (provider.models[modelName]) {
        rates = provider.models[modelName];
        break;
      }
    }

    if (!rates) {
      logger.warn(`CostTracker: Pricing rates for model "${modelName}" not found. Skipping calculations.`);
      return 0;
    }

    // Cost calculations (rates are defined per million tokens)
    const inputCost = (inputCount / 1000000) * rates.inputCostPerM;
    const outputCost = (outputCount / 1000000) * rates.outputCostPerM;
    const totalCost = inputCost + outputCost;

    // Increment global aggregators
    cumulativeCostUSD += totalCost;
    cumulativeTokens.input += inputCount;
    cumulativeTokens.output += outputCount;

    logger.debug(
      `CostTracker: Tracked transaction cost: $${totalCost.toFixed(6)} | Accumulated Total: $${cumulativeCostUSD.toFixed(6)}`
    );

    return totalCost;
  },

  /**
   * Returns cumulative session summary.
   */
  getSummary: () => {
    return {
      cumulativeCostUSD,
      cumulativeTokens,
    };
  },

  /**
   * Resets session accumulators.
   */
  reset: () => {
    cumulativeCostUSD = 0;
    cumulativeTokens = { input: 0, output: 0 };
    logger.info('CostTracker: Accumulated costs reset.');
  },
};

module.exports = CostTracker;
