'use strict';

const config = require('../../../config/index');
const modelRegistry = require('../config/models');
const GeminiProvider = require('./gemini.provider');
const OpenAIProvider = require('./openai.provider');
const EmbeddingService = require('../memory/embedding.service');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');

// Store instantiated providers
const providers = {};
const semanticCacheStore = [];

// Initialize configured providers on start
try {
  if (config.gemini.apiKey) {
    providers.gemini = new GeminiProvider({ apiKey: config.gemini.apiKey });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.openai = new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (err) {
  logger.error(`Failed to initialize AI providers: ${err.message}`);
}

/**
 * Retry helper executing promises with exponential delays.
 */
const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    logger.warn(`AI Request failed: ${error.message}. Retrying in ${delay}ms... (${retries} attempts left)`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
};

/**
 * Scans cache vector logs for matching semantic query strings.
 */
const lookupSemanticCache = async (prompt, threshold = 0.95) => {
  try {
    const promptEmbedding = await EmbeddingService.generate(prompt);
    for (const item of semanticCacheStore) {
      const similarity = EmbeddingService.cosineSimilarity(promptEmbedding, item.embedding);
      if (similarity >= threshold) {
        logger.info(`[Semantic Cache HIT] Cosine Similarity: ${similarity.toFixed(4)}`);
        return item.response;
      }
    }
  } catch (err) {
    logger.warn(`Semantic Cache lookup skipped: ${err.message}`);
  }
  return null;
};

/**
 * Saves generated responses into local vector cache store.
 */
const saveSemanticCache = async (prompt, response) => {
  try {
    const promptEmbedding = await EmbeddingService.generate(prompt);
    semanticCacheStore.push({
      prompt,
      embedding: promptEmbedding,
      response,
    });
  } catch (err) {
    logger.warn(`Semantic Cache save skipped: ${err.message}`);
  }
};

/**
 * Resolves the primary provider and model string based on task rules or custom overrides.
 * @param {object} options - Request configuration rules
 * @returns {object} { provider, model }
 */
const resolveRoute = (options = {}) => {
  if (options.model) {
    // Direct model override request
    const modelName = options.model;
    for (const [providerName, providerConfig] of Object.entries(modelRegistry.providers)) {
      if (providerConfig.models[modelName]) {
        return { provider: providerName, model: modelName };
      }
    }
    // Default fallback to Gemini if model is unknown
    return { provider: 'gemini', model: 'gemini-2.5-flash' };
  }

  // Use capability tag matching (default to chat speed)
  const capability = options.capability || 'chat';
  const targetModel = modelRegistry.routingRules[capability] || 'gemini-2.5-flash';
  
  // Find which provider supports this resolved model
  for (const [providerName, providerConfig] of Object.entries(modelRegistry.providers)) {
    if (providerConfig.models[targetModel]) {
      return { provider: providerName, model: targetModel };
    }
  }

  return { provider: 'gemini', model: 'gemini-2.5-flash' };
};

const AIGateway = {
  /**
   * Dispatches text completion requests to the resolved provider.
   */
  generateText: async (prompt, options = {}) => {
    // 1. Semantic Cache Check
    if (!options.noCache) {
      const cached = await lookupSemanticCache(prompt);
      if (cached) return { ...cached, cacheHit: true };
    }

    const route = resolveRoute(options);
    const providerInstance = providers[route.provider];

    if (!providerInstance) {
      throw new AppError(
        `AI Provider "${route.provider}" is not configured in the environment.`,
        503,
        'PROVIDER_NOT_CONFIGURED'
      );
    }

    // Mix in the resolved model config
    const mergedOptions = {
      ...options,
      model: route.model,
    };

    // 2. Execution with retry loops
    const response = await retryWithBackoff(() => providerInstance.generateText(prompt, mergedOptions));

    // 3. Save to cache
    if (!options.noCache) {
      await saveSemanticCache(prompt, response);
    }

    return response;
  },

  /**
   * Dispatches structured JSON output extractions to the resolved provider.
   */
  generateStructuredJSON: async (prompt, schema, options = {}) => {
    const route = resolveRoute(options);
    const providerInstance = providers[route.provider];

    if (!providerInstance) {
      throw new AppError(
        `AI Provider "${route.provider}" is not configured in the environment.`,
        503,
        'PROVIDER_NOT_CONFIGURED'
      );
    }

    const mergedOptions = {
      ...options,
      model: route.model,
    };

    return retryWithBackoff(() => providerInstance.generateStructuredJSON(prompt, schema, mergedOptions));
  },
};

module.exports = AIGateway;
