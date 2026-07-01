'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config/index');
const AppError = require('./AppError');

/**
 * JWT Utilities
 * Centralizes all token creation and verification logic.
 * Access tokens: short-lived (15m), used for API authorization.
 * Refresh tokens: long-lived (7d), used to obtain new access tokens.
 */

/**
 * Signs an access token for the given user id.
 * @param {string} userId
 * @returns {string} JWT access token
 */
const signAccessToken = (userId) => {
  return jwt.sign({ sub: userId, type: 'access' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Signs a refresh token for the given user id.
 * @param {string} userId
 * @returns {string} JWT refresh token
 */
const signRefreshToken = (userId) => {
  return jwt.sign({ sub: userId, type: 'refresh' }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verifies an access token.
 * @param {string} token
 * @returns {{ sub: string }} Decoded payload
 * @throws {AppError} on invalid/expired token
 */
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type !== 'access') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN');
    }
    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new AppError('Invalid access token', 401, 'INVALID_TOKEN');
  }
};

/**
 * Verifies a refresh token.
 * @param {string} token
 * @returns {{ sub: string }} Decoded payload
 * @throws {AppError} on invalid/expired token
 */
const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);
    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid token type', 401, 'INVALID_TOKEN');
    }
    return decoded;
  } catch (err) {
    if (err instanceof AppError) throw err;
    if (err.name === 'TokenExpiredError') {
      throw new AppError('Refresh token expired. Please log in again.', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }
};

/**
 * Sets the access token as an httpOnly cookie on the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
const setAccessTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Sets the refresh token as an httpOnly cookie on the response.
 * @param {import('express').Response} res
 * @param {string} token
 */
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'strict' : 'lax',
    path: '/',  // Widened scope for general refresh compat
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clears both auth cookies.
 * @param {import('express').Response} res
 */
const clearAuthCookies = (res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken', { path: '/' });
};

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
};
