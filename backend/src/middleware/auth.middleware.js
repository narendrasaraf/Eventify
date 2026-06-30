'use strict';

const jwtUtils = require('../utils/jwt.utils');
const UserRepository = require('../features/auth/auth.repository');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * protect — Verifies the access token from httpOnly cookie.
 * Attaches { id, role } to req.user on success.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies.token;

  if (!token) {
    throw new AppError('Authentication required. Please log in.', 401, 'NO_TOKEN');
  }

  // Verify JWT (throws AppError on failure)
  const decoded = jwtUtils.verifyAccessToken(token);

  // Confirm user still exists and is active
  const user = await UserRepository.findById(decoded.sub);
  if (!user) {
    throw new AppError('User no longer exists', 401, 'USER_NOT_FOUND');
  }
  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
  }

  // Attach lightweight user object to request
  req.user = { id: user._id.toString(), role: user.role, email: user.email };
  next();
});

/**
 * optionalAuth — Like protect, but doesn't fail if no token.
 * Useful for public endpoints that show different data when logged in.
 */
const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = jwtUtils.verifyAccessToken(token);
    const user = await UserRepository.findById(decoded.sub);
    if (user && user.isActive) {
      req.user = { id: user._id.toString(), role: user.role, email: user.email };
    }
  } catch {
    // Silently ignore invalid tokens on optional auth
  }
  next();
});

module.exports = { protect, optionalAuth };
