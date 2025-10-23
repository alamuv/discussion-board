const logger = require('../utils/logger');
const { getSequelize } = require('../config/database');

/**
 * GET /api/threads/:threadId/comments
 * Get all comments for a thread with nested replies using recursive CTE
 * Query params: page=1, limit=10
 */
const getComments = async (req, res) => {
  try {
    const sequelize = await getSequelize();
    const threadId = req.params.threadId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Recursive CTE to fetch all nested comments as JSON tree
    // Note: isDeleted filter only applied to roots, not recursion
    // This preserves tree structure even when parent comments are deleted
    const query = `
      WITH RECURSIVE comment_tree AS (
        -- Base case: top-level comments (parentId IS NULL, not deleted)
        SELECT
          c.id,
          c."threadId",
          c."userId",
          c."parentId",
          c.content,
          c."isDeleted",
          c."createdAt",
          c."updatedAt",
          u.id as "user.id",
          u.name as "user.name",
          u.email as "user.email",
          u.picture as "user.picture",
          0 as depth,
          ARRAY[c.id] as path
        FROM comments c
        LEFT JOIN users u ON c."userId" = u.id
        WHERE c."threadId" = :threadId
          AND c."parentId" IS NULL
          AND c."isDeleted" = false

        UNION ALL

        -- Recursive case: fetch all nested replies (including deleted)
        -- This preserves tree structure when parent comments are deleted
        SELECT
          c.id,
          c."threadId",
          c."userId",
          c."parentId",
          c.content,
          c."isDeleted",
          c."createdAt",
          c."updatedAt",
          u.id as "user.id",
          u.name as "user.name",
          u.email as "user.email",
          u.picture as "user.picture",
          ct.depth + 1,
          ct.path || c.id
        FROM comments c
        LEFT JOIN users u ON c."userId" = u.id
        INNER JOIN comment_tree ct ON c."parentId" = ct.id
      )
      SELECT * FROM comment_tree
      ORDER BY path, "createdAt" ASC
    `;

    // Get total count of top-level comments
    const countQuery = `
      SELECT COUNT(*) as count
      FROM comments
      WHERE "threadId" = :threadId
        AND "parentId" IS NULL
        AND "isDeleted" = false
    `;

    const [countResult] = await sequelize.query(countQuery, {
      replacements: { threadId },
      type: sequelize.QueryTypes.SELECT,
    });

    const total = countResult.count;

    // Get paginated results with nested structure
    const results = await sequelize.query(query, {
      replacements: { threadId },
      type: sequelize.QueryTypes.SELECT,
    });

    // Build nested tree structure from flat results
    const commentMap = new Map();
    const topLevelComments = [];

    results.forEach((row) => {
      const comment = {
        id: row.id,
        threadId: row.threadId,
        userId: row.userId,
        parentId: row.parentId,
        content: row.content,
        isDeleted: row.isDeleted,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        user: {
          id: row['user.id'],
          name: row['user.name'],
          email: row['user.email'],
          picture: row['user.picture'],
        },
        replies: [],
      };

      commentMap.set(row.id, comment);

      if (row.parentId === null) {
        topLevelComments.push(comment);
      } else {
        const parent = commentMap.get(row.parentId);
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    // Mask deleted comments in the tree (set content to null, keep structure)
    const maskDeletedComments = (comments) => {
      return comments.map((comment) => {
        const masked = { ...comment };
        if (masked.isDeleted) {
          masked.content = null;
          masked.user = null;
        }
        if (masked.replies && masked.replies.length > 0) {
          masked.replies = maskDeletedComments(masked.replies);
        }
        return masked;
      });
    };

    // Apply pagination to top-level comments
    const paginatedComments = topLevelComments.slice(offset, offset + limit);
    const maskedComments = maskDeletedComments(paginatedComments);

    res.json({
      comments: maskedComments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching comments', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

/**
 * POST /api/threads/:threadId/comments
 * Create a new comment (requires authentication)
 */
const createComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const sequelize = await getSequelize();
    const Comment = sequelize.models.Comment;
    const Thread = sequelize.models.Thread;

    // Verify thread exists
    const thread = await Thread.findByPk(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // If parentId is provided, verify parent comment exists
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const comment = await Comment.create({
      threadId: req.params.threadId,
      userId: req.user.id,
      parentId: parentId || null,
      content,
    });

    logger.info(`Comment created: ${comment.id} by user ${req.user.id}`);
    res.status(201).json(comment);
  } catch (error) {
    logger.error('Error creating comment', { error: error.message });
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

/**
 * PUT /api/comments/:id
 * Update a comment (only by creator or admin)
 * Authorization checked by requireAdminOrOwner middleware
 */
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Resource already fetched and authorized by middleware
    const comment = req.resource;

    comment.content = content;
    await comment.save();

    logger.info(`Comment updated: ${comment.id} by user ${req.user.id}`);
    res.json(comment);
  } catch (error) {
    logger.error('Error updating comment', { error: error.message });
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

/**
 * DELETE /api/comments/:id
 * Soft delete a comment (only by creator or admin)
 * Authorization checked by requireAdminOrOwner middleware
 */
const deleteComment = async (req, res) => {
  try {
    // Resource already fetched and authorized by middleware
    const comment = req.resource;

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    logger.info(`Comment deleted: ${req.params.id} by user ${req.user.id}`);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting comment', { error: error.message });
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
};

