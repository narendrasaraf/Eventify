'use strict';

const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    content: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
      default: '',
    },
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String, required: true },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ roomId: 1, createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
