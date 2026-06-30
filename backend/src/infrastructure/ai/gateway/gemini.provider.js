'use strict';

const BaseProvider = require('./base.provider');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');

class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super(config);
    this.name = 'gemini';
    if (!config.apiKey) {
      throw new AppError('Gemini API Key is required', 503, 'AI_GATEWAY_CONFIG_ERROR');
    }
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  async generateText(prompt, options = {}) {
    const modelName = options.model || 'gemini-2.5-flash';
    logger.debug(`GeminiProvider executing generateText with model: ${modelName}`);

    try {
      const model = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: options.systemInstruction,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature !== undefined ? options.temperature : 0.7,
          maxOutputTokens: options.maxTokens,
        },
      });

      const usageMetadata = result.response.usageMetadata || {};
      
      return {
        text: result.response.text(),
        model: modelName,
        provider: this.name,
        usage: {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0,
        },
      };
    } catch (error) {
      logger.error(`GeminiProvider generateText failed: ${error.message}`);
      throw new AppError(`AI Execution failed: ${error.message}`, 502, 'AI_EXECUTION_FAILED');
    }
  }

  async generateStructuredJSON(prompt, schema, options = {}) {
    const modelName = options.model || 'gemini-2.5-flash';
    logger.debug(`GeminiProvider executing generateStructuredJSON with model: ${modelName}`);

    try {
      const model = this.client.getGenerativeModel({
        model: modelName,
        systemInstruction: options.systemInstruction,
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: options.temperature !== undefined ? options.temperature : 0.1,
        },
      });

      const usageMetadata = result.response.usageMetadata || {};

      return {
        data: JSON.parse(result.response.text()),
        model: modelName,
        provider: this.name,
        usage: {
          inputTokens: usageMetadata.promptTokenCount || 0,
          outputTokens: usageMetadata.candidatesTokenCount || 0,
        },
      };
    } catch (error) {
      logger.error(`GeminiProvider generateStructuredJSON failed: ${error.message}`);
      throw new AppError(`AI Extraction failed: ${error.message}`, 422, 'AI_EXTRACTION_FAILED');
    }
  }
}

module.exports = GeminiProvider;
