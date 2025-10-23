const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const {
  getComments,
  createComment,
} = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

/**
 * GET /api/threads/:threadId/comments
 * Get all comments for a thread
 */
router.get('/', getComments);

/**
 * POST /api/threads/:threadId/comments
 * Create a new comment (requires authentication)
 * Body: { content, parentId? }
 */
router.post('/', requireAuth, createComment);

module.exports = router;

