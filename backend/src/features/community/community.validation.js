'use strict';

const { body, validationResult } = require('express-validator');
const AppError = require('../../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    return next(new AppError(errorMsg, 422, 'VALIDATION_ERROR'));
  }
  next();
};

const clubRules = [
  body('name').trim().notEmpty().withMessage('Club name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  validate,
];

const postRules = [
  body('title').trim().notEmpty().withMessage('Post title is required'),
  validate,
];

const commentRules = [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
  validate,
];

const resourceRules = [
  body('title').trim().notEmpty().withMessage('Resource title is required'),
  body('fileType').trim().isIn(['PDF', 'PPT', 'ZIP', 'GitHub', 'YouTube', 'GoogleDrive', 'Other']).withMessage('Invalid file type'),
  body('fileUrl').trim().notEmpty().withMessage('File URL or link is required'),
  validate,
];

const announcementRules = [
  body('title').trim().notEmpty().withMessage('Announcement title is required'),
  body('body').trim().notEmpty().withMessage('Announcement body is required'),
  validate,
];

module.exports = {
  clubRules,
  postRules,
  commentRules,
  resourceRules,
  announcementRules,
};
