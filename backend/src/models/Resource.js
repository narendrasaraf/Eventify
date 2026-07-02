'use strict';

const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['PDF', 'PPT', 'ZIP', 'GitHub', 'YouTube', 'GoogleDrive', 'Other'],
      required: [true, 'Resource type is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'Resource file url / link is required'],
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index({ clubId: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
