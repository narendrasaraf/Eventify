'use strict';

const Notification = require('../../models/Notification');

/**
 * NotificationRepository — Data access layer for User Notifications.
 */
const NotificationRepository = {
  create: (data) => Notification.create(data),

  findByUserId: (userId) =>
    Notification.find({ userId }).sort({ createdAt: -1 }),

  markAllAsRead: (userId) =>
    Notification.updateMany({ userId, unread: true }, { $set: { unread: false } }),

  deleteById: (id, userId) =>
    Notification.findOneAndDelete({ _id: id, userId }),
};

module.exports = NotificationRepository;
