'use strict';

/**
 * AI Models Configuration Registry
 * Defines cost rates, capability mapping, and default settings.
 * All prices are rate per 1,000,000 tokens (USD).
 */
const models = {
  providers: {
    gemini: {
      defaultModel: 'gemini-1.5-flash',
      models: {
        'gemini-1.5-flash': {
          displayName: 'Gemini 1.5 Flash',
          inputCostPerM: 0.075,
          outputCostPerM: 0.30,
          contextWindow: 1048576,
          maxOutputTokens: 8192,
          capabilities: ['extraction', 'chat', 'tools', 'speed'],
        },
        'gemini-1.5-pro': {
          displayName: 'Gemini 1.5 Pro',
          inputCostPerM: 1.25,
          outputCostPerM: 5.00,
          contextWindow: 2097152,
          maxOutputTokens: 8192,
          capabilities: ['reasoning', 'coding', 'tools', 'complex'],
        },
      },
    },
    openai: {
      defaultModel: 'gpt-4o-mini',
      models: {
        'gpt-4o-mini': {
          displayName: 'GPT-4o Mini',
          inputCostPerM: 0.15,
          outputCostPerM: 0.60,
          contextWindow: 128000,
          maxOutputTokens: 16384,
          capabilities: ['chat', 'extraction', 'speed'],
        },
        'gpt-4o': {
          displayName: 'GPT-4o',
          inputCostPerM: 2.50,
          outputCostPerM: 10.00,
          contextWindow: 128000,
          maxOutputTokens: 4096,
          capabilities: ['reasoning', 'tools', 'complex'],
        },
      },
    },
    anthropic: {
      defaultModel: 'claude-3-5-haiku-latest',
      models: {
        'claude-3-5-haiku-latest': {
          displayName: 'Claude 3.5 Haiku',
          inputCostPerM: 0.80,
          outputCostPerM: 4.00,
          contextWindow: 200000,
          maxOutputTokens: 8192,
          capabilities: ['chat', 'speed'],
        },
        'claude-3-5-sonnet-latest': {
          displayName: 'Claude 3.5 Sonnet',
          inputCostPerM: 3.00,
          outputCostPerM: 15.00,
          contextWindow: 200000,
          maxOutputTokens: 8192,
          capabilities: ['reasoning', 'coding', 'complex'],
        },
      },
    },
  },
  
  // Rule routing mapping tasks to performance tiers
  routingRules: {
    speed: 'gemini-1.5-flash',
    extraction: 'gemini-1.5-flash',
    chat: 'gemini-1.5-flash',
    tools: 'gemini-1.5-flash',
    complex: 'gemini-1.5-pro',
    reasoning: 'gemini-1.5-pro',
  },
};

module.exports = models;
