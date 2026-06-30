'use strict';

const config = require('../../../config/index');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');

let genAI;
if (config.gemini.apiKey) {
  genAI = new GoogleGenerativeAI(config.gemini.apiKey);
}

/**
 * Embedding Service
 * Generates vector representations of text strings.
 */
const EmbeddingService = {
  /**
   * Generates a 768-dimensional vector embedding for text.
   * @param {string} text - Input query string
   * @returns {Promise<Array<number>>} 768-dimension vector array
   */
  generate: async (text) => {
    if (!text || typeof text !== 'string') {
      throw new Error('Input text must be a valid non-empty string');
    }

    if (!genAI) {
      // Local Mock Fallback if API keys are not loaded
      logger.warn('Gemini API key not configured for embeddings. Generating simulated vector.');
      const length = 768;
      const mockVector = Array.from({ length }, () => Math.random() * 2 - 1);
      // L2 Normalize mock vector
      const magnitude = Math.sqrt(mockVector.reduce((sum, val) => sum + val * val, 0));
      return mockVector.map((val) => val / magnitude);
    }

    try {
      logger.debug(`EmbeddingService: Generating cloud vector for text: "${text.substring(0, 30)}..."`);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('404')) {
        try {
          logger.debug(`EmbeddingService: Retrying with fallback model: "embedding-001"`);
          const fallbackModel = genAI.getGenerativeModel({ model: 'embedding-001' });
          const result = await fallbackModel.embedContent(text);
          return result.embedding.values;
        } catch (fallbackErr) {
          logger.error(`EmbeddingService: Fallback model failed: ${fallbackErr.message}`);
        }
      }
      logger.error(`EmbeddingService: Cloud generation failed: ${err.message}`);
      throw new AppError(`Failed to generate embeddings: ${err.message}`, 502, 'EMBEDDING_FAILED');
    }
  },

  /**
   * Computes cosine similarity between two vectors.
   */
  cosineSimilarity: (vecA, vecB) => {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
      throw new Error('Vectors must be of equal size');
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },
};

module.exports = EmbeddingService;
