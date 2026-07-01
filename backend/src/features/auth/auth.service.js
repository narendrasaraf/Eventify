'use strict';

const RefreshToken = require('../../models/RefreshToken');
const UserRepository = require('./auth.repository');
const AppError = require('../../utils/AppError');
const jwtUtils = require('../../utils/jwt.utils');
const logger = require('../../utils/logger');
const config = require('../../config/index');
const crypto = require('crypto');

/**
 * AuthService — Business logic layer for authentication.
 *
 * SOLID: Single Responsibility — handles only auth business rules.
 * Depends on UserRepository and RefreshToken model (Dependency Inversion).
 */
const AuthService = {
  /**
   * Register a new user with local credentials.
   * @param {{ name, email, password }} data
   * @returns {{ user, accessToken, refreshToken }}
   */
  signup: async ({ name, email, password }) => {
    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
    }

    const user = await UserRepository.create({
      name,
      email,
      password,
      authProvider: 'local',
    });

    const accessToken = jwtUtils.signAccessToken(user._id.toString());
    const refreshToken = jwtUtils.signRefreshToken(user._id.toString());

    await AuthService._storeRefreshToken(refreshToken, user._id);

    logger.info(`New user registered: ${email}`);
    return { user, accessToken, refreshToken };
  },

  /**
   * Log in an existing local user.
   * @param {{ email, password, userAgent, ip }} data
   * @returns {{ user, accessToken, refreshToken }}
   */
  login: async ({ email, password, userAgent = '', ip = '' }) => {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = jwtUtils.signAccessToken(user._id.toString());
    const refreshToken = jwtUtils.signRefreshToken(user._id.toString());

    await AuthService._storeRefreshToken(refreshToken, user._id, userAgent, ip);

    logger.info(`User logged in: ${email}`);
    return { user, accessToken, refreshToken };
  },

  /**
   * Issue new tokens from a valid refresh token (token rotation).
   * @param {string} refreshToken - the raw refresh JWT from cookie
   * @returns {{ accessToken, refreshToken: newRefreshToken }}
   */
  refreshTokens: async (refreshToken) => {
    // Verify JWT signature + expiry
    const decoded = jwtUtils.verifyRefreshToken(refreshToken);

    // Check it's in the DB and not revoked
    const stored = await RefreshToken.findOne({
      token: refreshToken,
      isRevoked: false,
    });
    if (!stored) {
      throw new AppError(
        'Refresh token is invalid or has been revoked',
        401,
        'INVALID_REFRESH_TOKEN'
      );
    }

    // Rotate: revoke old, issue new pair
    stored.isRevoked = true;
    await stored.save();

    const newAccessToken = jwtUtils.signAccessToken(decoded.sub);
    const newRefreshToken = jwtUtils.signRefreshToken(decoded.sub);

    await AuthService._storeRefreshToken(newRefreshToken, decoded.sub);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  /**
   * Issue tokens for a user authenticated via Google OAuth.
   * Called by the Passport callback after strategy succeeds.
   * @param {import('../../models/User')} user
   * @returns {{ accessToken, refreshToken }}
   */
  issueTokensForOAuthUser: async (user) => {
    const accessToken = jwtUtils.signAccessToken(user._id.toString());
    const refreshToken = jwtUtils.signRefreshToken(user._id.toString());
    await AuthService._storeRefreshToken(refreshToken, user._id);
    return { accessToken, refreshToken };
  },

  /**
   * Revoke all refresh tokens for a user (logout).
   * @param {string} refreshToken - current refresh token to revoke
   */
  logout: async (refreshToken) => {
    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { isRevoked: true }
      );
    }
  },

  /**
   * Internal: persist a refresh token to the DB.
   * @private
   */
  _storeRefreshToken: async (token, userId, userAgent = '', ip = '') => {
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    );
    await RefreshToken.create({ token, userId, expiresAt, userAgent, ip });
  },

  /**
   * Generates a password recovery token and prints it to the console log.
   */
  forgotPassword: async (email) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new AppError('No user found with that email address', 404, 'EMAIL_NOT_FOUND');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token and expiry (1 hour)
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    // Print details in backend log for testing
    logger.info(`[Reset Token Auth Hook] Reset token for ${email}: ${resetToken}`);
    return resetToken;
  },

  /**
   * Resets password using valid unexpired token.
   */
  resetPassword: async (token, password) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Token is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    logger.info(`Password successfully reset for user ID: ${user._id}`);
    return user;
  },

  /**
   * Validates old password and sets new password.
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');
    }

    user.password = newPassword;
    await user.save();

    logger.info(`Password successfully updated for user: ${userId}`);
    return user;
  },
};

module.exports = AuthService;
