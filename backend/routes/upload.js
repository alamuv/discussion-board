const express = require('express');
const multer = require('multer');
const { requireAuth } = require('../middlewares/auth');
const { uploadImage } = require('../controllers/uploadController');

const router = express.Router();

// Configure multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Validate MIME type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
    }
  },
});

/**
 * POST /api/upload
 * Upload an image to Cloudinary
 * Requires authentication
 * Body: multipart/form-data with 'file' field
 */
router.post('/', requireAuth, upload.single('file'), uploadImage);

module.exports = router;

