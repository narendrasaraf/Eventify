'use strict';

const BaseProvider = require('./base.provider');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');

/**
 * OpenAI Provider Implementation Stub
 * Keeps OpenAI as an optional secondary provider without forcing npm installs
 * of 'openai' unless explicitly enabled.
 */
class OpenAIProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'openai';
    this.apiKey = config.apiKey;
    if (this.apiKey) {
      logger.info('OpenAI provider stub initialized (ready for integration).');
    }
  }

  async generateText(prompt, options = {}) {
    if (!this.apiKey) {
      throw new AppError('OpenAI API key is not configured', 503, 'PROVIDER_NOT_CONFIGURED');
    }

    const modelName = options.model || 'gpt-4o-mini';
    logger.debug(`OpenAIProvider stub execution request with model: ${modelName}`);

    // If client has installed openai, we would wire:
    // const OpenAI = require('openai');
    // const client = new OpenAI({ apiKey: this.apiKey });
    // ...
    throw new AppError(
      'OpenAI provider library is not installed. To run GPT models: npm install openai.',
      501,
      'PROVIDER_NOT_IMPLEMENTED'
    );
  }

  async generateStructuredJSON(prompt, schema, options = {}) {
    if (!this.apiKey) {
      throw new AppError('OpenAI API key is not configured', 503, 'PROVIDER_NOT_CONFIGURED');
    }
    throw new AppError(
      'OpenAI provider library is not installed. To run GPT models: npm install openai.',
      501,
      'PROVIDER_NOT_IMPLEMENTED'
    );
  }
}

module.exports = OpenAIProvider;
