'use strict';

const logger = require('../../../utils/logger');

/**
 * Context Manager
 * Handles sliding window pruning and token budget limits.
 */
const ContextManager = {
  /**
   * Estimates token count based on standard English heuristics.
   * In production: swap in tiktoken or use model token APIs.
   * Heuristic: ~4 characters or ~0.75 words per token.
   */
  estimateTokens: (text) => {
    if (!text) return 0;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount * 1.33);
  },

  /**
   * Prunes a conversation message array to stay within a target token limit.
   * Prioritizes keeping the system prompt and the most recent messages.
   * @param {Array<object>} messages - Message array [{ role, text }]
   * @param {number} maxTokens - Target context budget limit (default 4000)
   * @returns {Array<object>} Pruned message array
   */
  pruneHistory: (messages, maxTokens = 4000) => {
    if (!Array.isArray(messages) || messages.length === 0) return [];

    let currentBudget = maxTokens;
    const result = [];
    
    // Always scan from the newest message backward
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const estimatedCost = ContextManager.estimateTokens(msg.text || msg.content);
      
      if (currentBudget - estimatedCost >= 0) {
        result.unshift(msg); // Add back to front to maintain ordering
        currentBudget -= estimatedCost;
      } else {
        logger.debug(
          `ContextManager: Pruned old message from history. Exceeded token budget of ${maxTokens}`
        );
        break; // Stop including older messages
      }
    }

    return result;
  },
};

module.exports = ContextManager;
