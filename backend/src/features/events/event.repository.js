'use strict';

const Event = require('../../models/Event');

/**
 * EventRepository — Data access layer for Event collection.
 * No business logic, no HTTP. Pure DB operations.
 */
const EventRepository = {
  /**
   * Find a single event by id (non-deleted).
   */
  findById: (id) => Event.findOne({ _id: id, isDeleted: false }),

  /**
   * Find a single event by id, including deleted (for admin).
   */
  findByIdRaw: (id) => Event.findById(id),

  /**
   * List events with filtering and pagination.
   * @param {object} filter  - Mongoose filter object
   * @param {object} options - { page, limit, sort }
   */
  findMany: async (filter = {}, { page = 1, limit = 12, sort = { startDate: 1 } } = {}) => {
    const skip = (page - 1) * limit;
    const baseFilter = { isDeleted: false, ...filter };

    const [events, total] = await Promise.all([
      Event.find(baseFilter).sort(sort).skip(skip).limit(limit).lean(),
      Event.countDocuments(baseFilter),
    ]);

    return {
      events,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Find all events created by a specific user.
   */
  findByCreator: (userId) =>
    Event.find({ createdBy: userId, isDeleted: false }).sort({ createdAt: -1 }),

  /**
   * Create a new event.
   */
  create: (data) => Event.create(data),

  /**
   * Update an event by id.
   */
  updateById: (id, updates) =>
    Event.findByIdAndUpdate(id, updates, { new: true, runValidators: true }),

  /**
   * Soft-delete an event by id.
   */
  softDeleteById: (id) =>
    Event.findByIdAndUpdate(
      id,
      { isDeleted: true, status: 'cancelled' },
      { new: true }
    ),
};

module.exports = EventRepository;
