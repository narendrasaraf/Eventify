'use strict';

const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true,
    },
    banner: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Club description is required'],
    },
    category: {
      type: String,
      required: [true, 'Club category is required'],
      trim: true,
    },
    rules: {
      type: [String],
      default: [],
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

clubSchema.index({ name: 1 }, { unique: true });
clubSchema.index({ category: 1 });

module.exports = mongoose.model('Club', clubSchema);
