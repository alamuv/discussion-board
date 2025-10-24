const express = require('express');
const threadsRoutes = require('./threads');
const threadCommentsRoutes = require('./threadComments');
const commentsRoutes = require('./comments');
const uploadRoutes = require('./upload');

const router = express.Router();

/**
 * Thread routes
 * GET /api/threads - Get all threads
 * GET /api/threads/:id - Get single thread
 * POST /api/threads - Create thread (auth required)
 * PUT /api/threads/:id - Update thread (auth required)
 * DELETE /api/threads/:id - Delete thread (auth required)
 */
router.use('/threads', threadsRoutes);

/**
 * Thread Comments routes (GET, POST)
 * GET /api/threads/:threadId/comments - Get comments for thread
 * POST /api/threads/:threadId/comments - Create comment (auth required)
 */
router.use('/threads/:threadId/comments', threadCommentsRoutes);

/**
 * Comment routes (PUT, DELETE)
 * PUT /api/comments/:id - Update comment (auth required)
 * DELETE /api/comments/:id - Delete comment (auth required)
 */
router.use('/comments', commentsRoutes);

/**
 * Upload routes
 * POST /api/upload - Upload image to Cloudinary (auth required)
 */
router.use('/upload', uploadRoutes);

module.exports = router;
