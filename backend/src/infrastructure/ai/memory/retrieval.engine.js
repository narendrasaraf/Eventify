'use strict';

const EmbeddingService = require('./embedding.service');
const logger = require('../../../utils/logger');

// Local in-memory Vector Index Store
const vectorIndex = [];

/**
 * Retrieval Engine (RAG Semantic Search Store)
 */
const RetrievalEngine = {
  /**
   * Indexes text documents by generating vector embeddings.
   * @param {Array<object>} documents - [{ id, text, metadata }]
   */
  addDocuments: async (documents) => {
    if (!Array.isArray(documents)) return;

    logger.info(`RetrievalEngine: Indexing ${documents.length} documents...`);

    for (const doc of documents) {
      try {
        const embedding = await EmbeddingService.generate(doc.text);
        vectorIndex.push({
          id: doc.id || Math.random().toString(36).substring(7),
          text: doc.text,
          metadata: doc.metadata || {},
          embedding,
        });
      } catch (err) {
        logger.error(`RetrievalEngine: Failed to index document "${doc.id}": ${err.message}`);
      }
    }
    logger.info(`RetrievalEngine: Complete. Total index size: ${vectorIndex.length}`);
  },

  /**
   * Queries vector index return top matching items.
   * @param {string} queryText - User question
   * @param {number} limit - Result count (default 3)
   */
  query: async (queryText, limit = 3) => {
    logger.debug(`RetrievalEngine: Querying semantic index for: "${queryText}"`);
    if (vectorIndex.length === 0) {
      logger.warn('RetrievalEngine: Query executed on an empty index.');
      return [];
    }

    try {
      const queryEmbedding = await EmbeddingService.generate(queryText);
      
      const scoredDocs = vectorIndex.map((doc) => {
        const score = EmbeddingService.cosineSimilarity(queryEmbedding, doc.embedding);
        return {
          id: doc.id,
          text: doc.text,
          metadata: doc.metadata,
          score,
        };
      });

      // Sort descending by similarity score
      scoredDocs.sort((a, b) => b.score - a.score);

      return scoredDocs.slice(0, limit);
    } catch (err) {
      logger.error(`RetrievalEngine: Semantic search failure: ${err.message}`);
      return [];
    }
  },

  /**
   * Resets local store index.
   */
  clear: () => {
    vectorIndex.length = 0;
    logger.info('RetrievalEngine: Vector store index cleared.');
  },
};

module.exports = RetrievalEngine;
