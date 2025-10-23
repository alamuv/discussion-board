const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { requireAdminOrOwner } = require('../middlewares/requireAdmin');
const {
  updateComment,
  deleteComment,
} = require('../controllers/commentController');

const router = express.Router();

/**
 * PUT /api/comments/:id
 * Update a comment (only by creator or admin)
 * Body: { content }
 */
router.put('/:id', requireAuth, requireAdminOrOwner('Comment', 'userId'), updateComment);

/**
 * DELETE /api/comments/:id
 * Soft delete a comment (only by creator or admin)
 */
router.delete('/:id', requireAuth, requireAdminOrOwner('Comment', 'userId'), deleteComment);

module.exports = router;

