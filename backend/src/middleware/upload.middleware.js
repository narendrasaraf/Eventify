'use strict';

const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

/**
 * Upload Middleware
 *
 * In production: wire Cloudinary storage here.
 * In development: saves to local uploads/ folder.
 *
 * To enable Cloudinary:
 *   npm install cloudinary multer-storage-cloudinary
 *   Then replace diskStorage with CloudinaryStorage below.
 */

// ─── File filter: images only ─────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WEBP, GIF) are allowed', 400, 'INVALID_FILE_TYPE'));
  }
};

// ─── Local disk storage (development) ────────────────────────────────────────
const diskStorage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `poster-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: diskStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
});

/**
 * uploadPoster middleware: handles single 'poster' field upload.
 * Wraps multer to convert MulterError to AppError for centralized handling.
 */
const uploadPoster = (req, res, next) => {
  const handler = upload.single('poster');
  handler(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size cannot exceed 5 MB', 400, 'FILE_TOO_LARGE'));
    }
    if (err instanceof multer.MulterError) {
      return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
    }
    next(err);
  });
};

module.exports = { uploadPoster };
