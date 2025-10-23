const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { requireAdminOrOwner } = require('../middlewares/requireAdmin');
const {
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
} = require('../controllers/threadController');

const router = express.Router();

/**
 * GET /api/threads
 * Get all threads with pagination
 * Query params: page, limit
 */
router.get('/', getThreads);

/**
 * GET /api/threads/:id
 * Get a single thread with comments
 */
router.get('/:id', getThread);

/**
 * POST /api/threads
 * Create a new thread (requires authentication)
 * Body: { title, content }
 */
router.post('/', requireAuth, createThread);

/**
 * PUT /api/threads/:id
 * Update a thread (only by creator or admin)
 * Body: { title?, content? }
 */
router.put('/:id', requireAuth, requireAdminOrOwner('Thread', 'userId'), updateThread);

/**
 * DELETE /api/threads/:id
 * Delete a thread (only by creator or admin)
 */
router.delete('/:id', requireAuth, requireAdminOrOwner('Thread', 'userId'), deleteThread);

module.exports = router;

