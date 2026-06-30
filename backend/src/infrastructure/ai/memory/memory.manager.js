'use strict';

const logger = require('../../../utils/logger');
const RetrievalEngine = require('./retrieval.engine');

// Simple short-term session storage
const sessionMemoryStore = {};

/**
 * Memory Manager
 * Coordinates short-term chat transcripts and long-term search profiles.
 */
const MemoryManager = {
  /**
   * Appends messages to short-term session buffer.
   * @param {string} sessionId - Unique conversation identifier
   * @param {object} message - { role: 'user' | 'model', text: string }
   */
  saveMessage: (sessionId, message) => {
    if (!sessionMemoryStore[sessionId]) {
      sessionMemoryStore[sessionId] = [];
    }
    
    sessionMemoryStore[sessionId].push({
      ...message,
      timestamp: new Date(),
    });
    
    logger.debug(`MemoryManager: Saved short-term message for session "${sessionId}"`);
  },

  /**
   * Retrieves full short-term conversation thread.
   */
  getHistory: (sessionId) => {
    return sessionMemoryStore[sessionId] || [];
  },

  /**
   * Resets short-term session buffers.
   */
  clearSession: (sessionId) => {
    delete sessionMemoryStore[sessionId];
    logger.debug(`MemoryManager: Cleared memory cache for session "${sessionId}"`);
  },

  /**
   * Commits high-value information to semantic long-term memory.
   * @param {string} docId - Target database document ID
   * @param {string} text - Memory details context
   * @param {object} metadata - Descriptive attributes
   */
  learn: async (docId, text, metadata = {}) => {
    await RetrievalEngine.addDocuments([{
      id: docId,
      text,
      metadata,
    }]);
    logger.debug(`MemoryManager: Committed long-term memory context: ${docId}`);
  },

  /**
   * Retrieves long-term context records matching question criteria.
   */
  recall: async (question, limit = 3) => {
    return RetrievalEngine.query(question, limit);
  },
};

module.exports = MemoryManager;
