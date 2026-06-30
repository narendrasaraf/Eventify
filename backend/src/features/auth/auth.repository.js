'use strict';

const User = require('../../models/User');

/**
 * AuthRepository — Data access layer for User collection.
 *
 * SOLID: Single Responsibility — only handles DB operations.
 * Never contains business logic or HTTP concerns.
 */
const UserRepository = {
  /**
   * Find a user by their MongoDB _id.
   * @param {string} id
   */
  findById: (id) => User.findById(id),

  /**
   * Find a user by email (case-insensitive).
   * @param {string} email
   */
  findByEmail: (email) => User.findOne({ email: email.toLowerCase() }),

  /**
   * Find a user by Google OAuth ID.
   * @param {string} googleId
   */
  findByGoogleId: (googleId) => User.findOne({ googleId }),

  /**
   * Find a user by id and return password field (for auth).
   * @param {string} email
   */
  findByEmailWithPassword: (email) =>
    User.findOne({ email: email.toLowerCase() }).select('+password'),

  /**
   * Create a new user.
   * @param {object} data
   */
  create: (data) => User.create(data),

  /**
   * Update a user by id and return the updated document.
   * @param {string} id
   * @param {object} updates
   */
  updateById: (id, updates) =>
    User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }),
};

module.exports = UserRepository;
