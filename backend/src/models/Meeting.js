'use strict';

const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event reference is required'],
      index: true,
    },
    roomName: {
      type: String,
      required: [true, 'Room name is required'],
      unique: true,
      trim: true,
    },
    roomUrl: {
      type: String,
      required: [true, 'Room URL is required'],
      trim: true,
    },
    meetingType: {
      type: String,
      enum: ['Jitsi'],
      default: 'Jitsi',
    },
    password: {
      type: String,
      default: '',
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer ID is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Cancelled'],
      default: 'Active',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    recordingUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Meeting', meetingSchema);
