'use strict';

/**
 * SSE Streamer Utility
 * Standardizes formatting for Server-Sent Events (SSE) streaming responses.
 */
const SSEStreamer = {
  /**
   * Initializes an Express response as an SSE stream.
   * @param {object} res - Express response object
   */
  init: (res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();
  },

  /**
   * Sends a structured token chunk to the connection stream.
   * @param {object} res - Express response
   * @param {string} text - Token text chunk
   */
  sendChunk: (res, text) => {
    const payload = JSON.stringify({ text });
    res.write(`data: ${payload}\n\n`);
  },

  /**
   * Sends a structured error message to the connection stream.
   */
  sendError: (res, errorMsg, code = 'STREAM_ERROR') => {
    const payload = JSON.stringify({ error: errorMsg, code });
    res.write(`data: ${payload}\n\n`);
    res.end();
  },

  /**
   * Terminates the connection stream cleanly.
   * @param {object} res - Express response
   */
  complete: (res) => {
    res.write('data: [DONE]\n\n');
    res.end();
  },
};

module.exports = SSEStreamer;
