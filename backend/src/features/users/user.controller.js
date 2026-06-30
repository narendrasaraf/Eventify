'use strict';

const UserRepository = require('../auth/auth.repository');
const AppError = require('../../utils/AppError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * GET /api/v1/users/me — Current user profile
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await UserRepository.findById(req.user.id);
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * PATCH /api/v1/users/me — Update current user profile
 * Only allows safe fields — cannot change email/password/role here.
 */
const updateMe = asyncHandler(async (req, res) => {
  const ALLOWED = ['name', 'profilePicture', 'phoneNumber'];
  const updates = {};
  ALLOWED.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid fields provided for update', 400, 'NO_UPDATES');
  }

  const user = await UserRepository.updateById(req.user.id, updates);
  res.status(200).json({ status: 'success', data: { user } });
});

module.exports = { getMe, updateMe };
