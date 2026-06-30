'use strict';

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['Confirmed', 'Cancelled', 'Pending'],
      default: 'Confirmed',
    },
    ticketNumber: {
      type: String,
      unique: true,
    },
    amountPaid: {
      type: Number,
      default: 0,
    },
    paymentId: {
      type: String, // Razorpay payment ID
      default: '',
    },
    paymentOrderId: {
      type: String, // Razorpay order ID
      default: '',
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });
// Compound unique: one booking per user per event
bookingSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// ─── Pre-save: generate ticket number ─────────────────────────────────────────
bookingSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `EVT-${ts}-${rand}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
