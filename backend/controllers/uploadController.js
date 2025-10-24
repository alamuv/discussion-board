const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/upload
 * Upload an image to Cloudinary
 * Requires authentication
 * Body: multipart/form-data with 'file' field
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'discussion-board',
        quality: 'auto',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error', { error: error.message });
          return res.status(500).json({ error: 'Failed to upload image' });
        }

        logger.info(`Image uploaded: ${result.public_id} by user ${req.user.id}`);
        res.json({
          url: result.secure_url,
          type: req.file.mimetype,
          publicId: result.public_id,
        });
      }
    ).end(req.file.buffer);
  } catch (error) {
    logger.error('Error uploading image', { error: error.message });
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

module.exports = {
  uploadImage,
};

