'use strict';

const fs = require('fs');
const path = require('path');
const AppError = require('../../../utils/AppError');
const logger = require('../../../utils/logger');

// Cache loaded templates
const templatesCache = {};

/**
 * Loads a template from static JSON configs on demand.
 * @private
 */
const _loadTemplate = (name) => {
  if (templatesCache[name]) return templatesCache[name];

  const filePath = path.resolve(__dirname, `templates/${name}.json`);
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file ${name}.json not found`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(fileContent);
    templatesCache[name] = parsed;
    return parsed;
  } catch (err) {
    logger.error(`PromptRegistry failed to load template: ${name}. Error: ${err.message}`);
    throw new AppError(
      `Prompt template "${name}" could not be loaded: ${err.message}`,
      500,
      'PROMPT_TEMPLATE_LOAD_FAILED'
    );
  }
};

/**
 * Helper to interpolate variables into template strings.
 * Replaces {{variable}} placeholders.
 * @private
 */
const _interpolate = (templateStr, variables = {}) => {
  if (!templateStr) return '';
  return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
};

const PromptRegistry = {
  /**
   * Compiles prompt instructions and user query strings.
   * @param {string} name - Name of the template (e.g. 'support-qna')
   * @param {object} variables - Values to interpolate into placeholders
   * @returns {object} { systemInstruction, prompt } compiled instructions
   */
  compile: (name, variables = {}) => {
    const template = _loadTemplate(name);
    
    return {
      systemInstruction: _interpolate(template.systemInstruction, variables),
      prompt: _interpolate(template.userTemplate, variables),
      version: template.version,
    };
  },
};

module.exports = PromptRegistry;
