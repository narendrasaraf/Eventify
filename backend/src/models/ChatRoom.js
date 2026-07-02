'use strict';

const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

chatRoomSchema.index({ clubId: 1 }, { unique: true });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
