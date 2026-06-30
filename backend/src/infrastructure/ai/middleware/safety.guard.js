'use strict';

const logger = require('../../../utils/logger');
const AppError = require('../../../utils/AppError');

// Injection patterns to detect and block
const INJECTION_PATTERNS = [
  /ignore\s+(?:the\s+)?prior\s+instructions/i,
  /ignore\s+above\s+instructions/i,
  /system\s+bypass/i,
  /you\s+are\s+now\s+a\s+malicious/i,
  /jailbreak/i,
  /override\s+system/i,
];

/**
 * Safety Guard
 * Scans inputs for malicious prompt injections and redacts sensitive PII in outputs.
 */
const SafetyGuard = {
  /**
   * Scans input prompt for injection signatures.
   * @param {string} text - User input query
   * @throws {AppError} if malicious signature detected
   */
  sanitizeInput: (text) => {
    if (!text || typeof text !== 'string') return '';

    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        logger.warn(`SafetyGuard: Blocked potential prompt injection attempt: "${text}"`);
        throw new AppError(
          'Security check failed: Input contains unauthorized override patterns.',
          400,
          'PROMPT_INJECTION_DETECTED'
        );
      }
    }

    return text;
  },

  /**
   * Redacts standard PII from generated completions (emails, card numbers).
   * @param {string} text - LLM output completion text
   * @returns {string} Sanitized text output
   */
  redactPII: (text) => {
    if (!text || typeof text !== 'string') return '';

    let sanitized = text;

    // Redact Emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    sanitized = sanitized.replace(emailRegex, '[REDACTED_EMAIL]');

    // Redact 16 digit Credit Cards
    const cardRegex = /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g;
    sanitized = sanitized.replace(cardRegex, '[REDACTED_CARD]');

    // Redact standard Phone Numbers (10-15 digits)
    const phoneRegex = /\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g;
    sanitized = sanitized.replace(phoneRegex, '[REDACTED_PHONE]');

    if (sanitized !== text) {
      logger.debug('SafetyGuard: Redacted PII signatures from completion response.');
    }

    return sanitized;
  },
};

module.exports = SafetyGuard;
