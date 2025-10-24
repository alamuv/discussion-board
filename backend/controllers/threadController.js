const logger = require('../utils/logger');
const { getSequelize } = require('../config/database');

/**
 * GET /api/threads
 * Get all threads with pagination
 */
const getThreads = async (req, res) => {
  try {
    const sequelize = await getSequelize();
    const Thread = sequelize.models.Thread;
    const User = sequelize.models.User;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Thread.findAndCountAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'picture'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    res.json({
      threads: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching threads', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
};

/**
 * GET /api/threads/:id
 * Get a single thread with comments
 */
const getThread = async (req, res) => {
  try {
    const sequelize = await getSequelize();
    const Thread = sequelize.models.Thread;
    const User = sequelize.models.User;
    const Comment = sequelize.models.Comment;

    const thread = await Thread.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'picture'],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'name', 'email', 'picture'],
            },
          ],
          where: { isDeleted: false },
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json(thread);
  } catch (error) {
    logger.error('Error fetching thread', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
};

/**
 * POST /api/threads
 * Create a new thread (requires authentication)
 * Body: { title, content, attachments? }
 * attachments: array of { url, type } objects
 */
const createThread = async (req, res) => {
  try {
    const { title, content, attachments } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const sequelize = await getSequelize();
    const Thread = sequelize.models.Thread;
    const User = sequelize.models.User;

    const thread = await Thread.create({
      title,
      content,
      userId: req.user?.id,
      attachments: attachments || [],
    });

    // Fetch the thread with user information
    const threadWithUser = await Thread.findByPk(thread.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'picture'],
        },
      ],
    });

    logger.info(`Thread created: ${thread.id} by user ${req.user.id}`);
    res.status(201).json(threadWithUser);
  } catch (error) {
    logger.error('Error creating thread', { error: error.message });
    res.status(500).json({ error: 'Failed to create thread' });
  }
};

/**
 * PUT /api/threads/:id
 * Update a thread (only by creator or admin)
 * Authorization checked by requireAdminOrOwner middleware
 */
const updateThread = async (req, res) => {
  try {
    const { title, content } = req.body;
    // Resource already fetched and authorized by middleware
    const thread = req.resource;

    if (title) thread.title = title;
    if (content) thread.content = content;

    await thread.save();

    logger.info(`Thread updated: ${thread.id} by user ${req.user.id}`);
    res.json(thread);
  } catch (error) {
    logger.error('Error updating thread', { error: error.message });
    res.status(500).json({ error: 'Failed to update thread' });
  }
};

/**
 * DELETE /api/threads/:id
 * Delete a thread (only by creator or admin)
 * Authorization checked by requireAdminOrOwner middleware
 */
const deleteThread = async (req, res) => {
  try {
    // Resource already fetched and authorized by middleware
    const thread = req.resource;

    await thread.destroy();

    logger.info(`Thread deleted: ${req.params.id} by user ${req.user.id}`);
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    logger.error('Error deleting thread', { error: error.message });
    res.status(500).json({ error: 'Failed to delete thread' });
  }
};

module.exports = {
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
};

