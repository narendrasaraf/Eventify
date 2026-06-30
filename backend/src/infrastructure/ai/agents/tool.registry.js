'use strict';

const logger = require('../../../utils/logger');

// Dynamic store of registered executable tools
const registeredTools = {};

/**
 * ToolRegistry
 * Stores schemas and maps executable handlers for ReAct agent cycles.
 */
const ToolRegistry = {
  /**
   * Registers a tool.
   * @param {object} schema - Tool definition schema (JSON schema formatting)
   * @param {function} handler - Executable handler function
   */
  register: (schema, handler) => {
    if (!schema || !schema.name) {
      throw new Error('Tool schema must contain a unique "name" attribute');
    }
    if (typeof handler !== 'function') {
      throw new Error(`Handler for tool "${schema.name}" must be a function`);
    }

    registeredTools[schema.name] = {
      schema,
      handler,
    };
    logger.info(`AI Tool registered successfully: ${schema.name}`);
  },

  /**
   * Retrieves all registered tool schemas for provider generation configuration parameters.
   */
  getSchemas: () => {
    return Object.values(registeredTools).map((t) => t.schema);
  },

  /**
   * Executes a tool by name with specified arguments.
   * @param {string} name - Registered tool name
   * @param {object} args - Call arguments mapping
   */
  execute: async (name, args = {}) => {
    const tool = registeredTools[name];
    if (!tool) {
      throw new Error(`Execution failed: Tool "${name}" is not registered.`);
    }

    logger.debug(`Executing tool handler: ${name} with arguments: ${JSON.stringify(args)}`);
    try {
      const result = await tool.handler(args);
      return {
        success: true,
        data: result,
      };
    } catch (err) {
      logger.error(`Error executing tool handler "${name}": ${err.message}`);
      return {
        success: false,
        error: err.message,
      };
    }
  },
};

module.exports = ToolRegistry;
