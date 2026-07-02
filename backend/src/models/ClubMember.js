'use strict';

const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to make sure a user joins a club only once
clubMemberSchema.index({ clubId: 1, userId: 1 }, { unique: true });
clubMemberSchema.index({ userId: 1 });

module.exports = mongoose.model('ClubMember', clubMemberSchema);
