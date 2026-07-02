'use strict';

const AIGateway = require('../gateway/index');
const ToolRegistry = require('./tool.registry');
const logger = require('../../../utils/logger');
const AppError = require('../../../utils/AppError');

/**
 * ReAct Agent Runtime State Machine
 * Executes multi-step reasoning and action cycles.
 */
const AgentRuntime = {
  /**
   * Executes a ReAct agent loop context.
   * @param {string} userQuery - Initial user prompt
   * @param {object} options - Runtime parameters (maxIterations, model, etc.)
   */
  run: async (userQuery, options = {}) => {
    const maxIterations = options.maxIterations || 5;
    const model = options.model || 'gemini-2.5-flash';
    
    // Build initial prompt incorporating tools schema
    const tools = ToolRegistry.getSchemas();
    const toolsDescription = tools.map(t => {
      return `- Name: ${t.name}\n  Description: ${t.description}\n  Parameters: ${JSON.stringify(t.parameters)}`;
    }).join('\n\n');

    let agentScratchpad = `You are a helpful agent that can use tools to answer questions.
You MUST respond using the following format:
Thought: [Your reasoning about what to do next]
Action: [Tool Name] (arguments as a JSON string, e.g. {"param": "value"})
Observation: [Result of tool execution]
... (this cycle can repeat)
Final Answer: [Your final summary resolution response]

Available Tools:
${toolsDescription || 'None'}

Begin!
Question: ${userQuery}\n`;

    logger.debug(`AgentRuntime: Executing ReAct loop for query: "${userQuery}"`);

    for (let iteration = 1; iteration <= maxIterations; iteration++) {
      logger.debug(`AgentRuntime: Iteration ${iteration}/${maxIterations}`);

      // Call LLM with current scratchpad history
      const response = await AIGateway.generateText(agentScratchpad, {
        model,
        temperature: 0.1, // Keep reasoning highly deterministic
      });

      const responseText = response.text;
      logger.debug(`AgentResponse:\n${responseText}`);

      // Append LLM's thought/action response to history
      agentScratchpad += `${responseText}\n`;

      // Check if LLM completed with a final answer
      if (responseText.includes('Final Answer:')) {
        const parts = responseText.split('Final Answer:');
        return {
          success: true,
          iterations: iteration,
          text: parts[parts.length - 1].trim(),
        };
      }

      // Parse Action line
      const actionMatch = responseText.match(/Action:\s*(\w+)\s*\((.*?)\)/);
      if (!actionMatch) {
        // Fallback: If it doesn't format correctly, return the raw completion text
        return {
          success: true,
          iterations: iteration,
          text: responseText.trim(),
        };
      }

      const toolName = actionMatch[1];
      const toolArgsStr = actionMatch[2];
      let toolArgs = {};

      try {
        if (toolArgsStr.trim()) {
          toolArgs = JSON.parse(toolArgsStr);
        }
      } catch (err) {
        logger.warn(`AgentRuntime: Failed to parse tool arguments JSON: ${toolArgsStr}`);
      }

      // Execute tool
      const executionResult = await ToolRegistry.execute(toolName, toolArgs);
      
      const observationText = executionResult.success
        ? JSON.stringify(executionResult.data)
        : `Error executing tool: ${executionResult.error}`;

      // Append Observation back into the scratchpad loop
      agentScratchpad += `Observation: ${observationText}\n`;
    }

    throw new AppError(
      `Agent runtime exceeded limit of ${maxIterations} loops without converging.`,
      508,
      'AGENT_LOOP_LIMIT_EXCEEDED'
    );
  },
};

module.exports = AgentRuntime;
