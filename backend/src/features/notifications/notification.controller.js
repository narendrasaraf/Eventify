'use strict';

const NotificationRepository = require('./notification.repository');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');

/**
 * Controller handlers for user notifications inbox.
 */
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await NotificationRepository.findByUserId(req.user.id);
  res.status(200).json({
    status: 'success',
    data: { notifications },
  });
});

const markAllRead = asyncHandler(async (req, res) => {
  await NotificationRepository.markAllAsRead(req.user.id);
  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const deleted = await NotificationRepository.deleteById(req.params.id, req.user.id);
  if (!deleted) {
    throw new AppError('Notification not found or unauthorized', 404, 'NOT_FOUND');
  }
  res.status(200).json({
    status: 'success',
    message: 'Notification deleted successfully',
  });
});

module.exports = {
  getMyNotifications,
  markAllRead,
  deleteNotification,
};
