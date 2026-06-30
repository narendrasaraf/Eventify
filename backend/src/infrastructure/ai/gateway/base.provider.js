'use strict';

/**
 * Base AI Provider Interface
 * All concrete providers (Gemini, OpenAI, Anthropic, Ollama, etc.) must extend this class.
 * Enforces unified parameter mappings and prevents application vendor lock-in.
 */
class BaseProvider {
  constructor(config = {}) {
    this.name = 'base';
    this.config = config;
  }

  /**
   * Generates text content completion.
   * @param {string} prompt - Prompt instruction text
   * @param {object} options - Generation option configurations (temperature, maxTokens, etc.)
   * @returns {Promise<object>} Unified response wrapper containing { text, usage: { inputTokens, outputTokens } }
   */
  async generateText(prompt, options = {}) {
    throw new Error(`generateText not implemented in ${this.constructor.name}`);
  }

  /**
   * Generates structured JSON matching a JSON Schema specification.
   * @param {string} prompt - Input instruction text
   * @param {object} schema - JSON schema constraint object
   * @param {object} options - Generation configurations
   * @returns {Promise<object>} Parsed schema-conforming object
   */
  async generateStructuredJSON(prompt, schema, options = {}) {
    throw new Error(`generateStructuredJSON not implemented in ${this.constructor.name}`);
  }

  /**
   * Evaluates text and calls registered tools in a ReAct loop sequence.
   * @param {string} prompt - Chat input prompt
   * @param {Array<object>} tools - Declared tool schema definitions
   * @returns {Promise<object>} Completion output containing { text, toolCalls: [] }
   */
  async generateWithTools(prompt, tools, options = {}) {
    throw new Error(`generateWithTools not implemented in ${this.constructor.name}`);
  }
}

module.exports = BaseProvider;
