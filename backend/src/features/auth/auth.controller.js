'use strict';

const { validationResult } = require('express-validator');
const passport = require('passport');
const AuthService = require('./auth.service');
const UserRepository = require('./auth.repository');
const jwtUtils = require('../../utils/jwt.utils');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const config = require('../../config/index');

/**
 * AuthController — HTTP layer for authentication.
 *
 * SOLID: Single Responsibility — handles only request/response lifecycle.
 * All business logic delegated to AuthService.
 */

/**
 * POST /api/v1/auth/signup
 */
const signup = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'fail', errors: errors.array() });
  }

  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.signup({
    name,
    email,
    password,
  });

  jwtUtils.setAccessTokenCookie(res, accessToken);
  jwtUtils.setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: 'fail', errors: errors.array() });
  }

  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await AuthService.login({
    email,
    password,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });

  jwtUtils.setAccessTokenCookie(res, accessToken);
  jwtUtils.setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * POST /api/v1/auth/refresh
 * Issues a new access + refresh token pair from a valid refresh token.
 */
const refresh = asyncHandler(async (req, res) => {
  const incomingRefresh = req.cookies.refreshToken;
  if (!incomingRefresh) {
    throw new AppError('No refresh token provided', 401, 'NO_REFRESH_TOKEN');
  }

  const { accessToken, refreshToken } = await AuthService.refreshTokens(
    incomingRefresh
  );

  jwtUtils.setAccessTokenCookie(res, accessToken);
  jwtUtils.setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({ status: 'success', message: 'Tokens refreshed' });
});

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.cookies.refreshToken);
  jwtUtils.clearAuthCookies(res);
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
});

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * GET /api/v1/auth/google
 * Initiates Google OAuth (Passport redirect).
 */
const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

/**
 * GET /api/v1/auth/google/callback
 * Handles OAuth callback, issues JWTs, redirects to frontend.
 */
const googleCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${config.frontend.url}/login?error=oauth_failed`,
  }),
  asyncHandler(async (req, res) => {
    const { accessToken, refreshToken } = await AuthService.issueTokensForOAuthUser(
      req.user
    );

    jwtUtils.setAccessTokenCookie(res, accessToken);
    jwtUtils.setRefreshTokenCookie(res, refreshToken);

    // Redirect to frontend with user data in query param
    // Frontend will call /auth/me immediately after redirect
    res.redirect(`${config.frontend.url}/dashboard?auth=google`);
  }),
];

module.exports = { signup, login, refresh, logout, getMe, googleAuth, googleCallback };
