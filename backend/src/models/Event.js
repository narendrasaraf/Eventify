'use strict';

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      maxlength: [200, 'Event name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      required: [true, 'Event type is required'],
      enum: ['Webinar', 'Conference', 'Meetup', 'Workshop', 'Other'],
    },
    mode: {
      type: String,
      required: [true, 'Event mode is required'],
      enum: ['Online', 'Offline', 'Hybrid'],
    },
    category: {
      type: String,
      trim: true,
    },
    language: {
      type: String,
      default: 'English',
    },

    // ── Dates ───────────────────────────────────────────────────────────────
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    registrationDeadline: {
      type: Date,
    },

    // ── Online-specific ─────────────────────────────────────────────────────
    meetingPlatform: {
      type: String,
      enum: ['Google Meet', 'Jitsi', 'Zoom', 'Teams', 'Other', ''],
      default: '',
    },
    meetingLink: {
      type: String,
      trim: true,
    },

    // ── Offline-specific ────────────────────────────────────────────────────
    venueName: {
      type: String,
      trim: true,
    },
    venueAddress: {
      type: String,
      trim: true,
    },
    googleMapLink: {
      type: String,
      trim: true,
    },

    // ── Media ───────────────────────────────────────────────────────────────
    posterUrl: {
      type: String,
      default: '',
    },
    posterPublicId: {
      type: String, // Cloudinary public_id for deletion
      default: '',
    },

    // ── Ticketing ───────────────────────────────────────────────────────────
    ticketType: {
      type: String,
      enum: ['Free', 'Paid'],
      default: 'Free',
    },
    ticketPrice: {
      type: Number,
      default: 0,
      min: [0, 'Ticket price cannot be negative'],
    },
    attendeeLimit: {
      type: Number,
      min: [1, 'Attendee limit must be at least 1'],
    },

    // ── Organizer ───────────────────────────────────────────────────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizerName: {
      type: String,
      trim: true,
    },
    organizerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // ── Status ──────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
eventSchema.index({ createdBy: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ organizerEmail: 1 });
eventSchema.index({ isDeleted: 1, status: 1 }); // Compound for listing queries

// ─── Virtual: isUpcoming ──────────────────────────────────────────────────────
eventSchema.virtual('isUpcoming').get(function () {
  return this.startDate > new Date();
});

// ─── Soft delete helper ───────────────────────────────────────────────────────
eventSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.status = 'cancelled';
  return this.save();
};

// ─── Validate endDate after startDate ────────────────────────────────────────
eventSchema.pre('save', function (next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
