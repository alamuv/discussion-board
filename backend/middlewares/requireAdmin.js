const logger = require('../utils/logger');
const { getSequelize } = require('../config/database');

/**
 * Middleware to check if user is an admin
 * Verifies that the user has the 'admin' role
 * Returns 403 Forbidden if not an admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    logger.warn('Unauthorized access attempt to admin route');
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

/**
 * Middleware factory to check if user is an admin or owner of a resource
 * Fetches the resource and checks authorization before passing to controller
 *
 * Usage:
 *   router.put('/:id', requireAuth, requireAdminOrOwner('Thread', 'userId'), updateHandler);
 *   router.delete('/:id', requireAuth, requireAdminOrOwner('Comment', 'userId'), deleteHandler);
 *
 * @param {string} modelName - Name of the Sequelize model (e.g., 'Thread', 'Comment')
 * @param {string} ownerField - Field name that contains the owner ID (default: 'userId')
 * @returns {Function} Middleware function
 */
const requireAdminOrOwner = (modelName, ownerField = 'userId') => {
  return async (req, res, next) => {
    try {
      const sequelize = await getSequelize();
      const Model = sequelize.models[modelName];

      if (!Model) {
        logger.error(`requireAdminOrOwner: Model ${modelName} not found`);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const resource = await Model.findByPk(req.params.id);

      if (!resource) {
        return res.status(404).json({ error: `${modelName} not found` });
      }

      const ownerId = resource[ownerField];

      // Allow if user is admin or owner
      if (req.user.role === 'admin' || req.user.id === ownerId) {
        // Store resource in request for controller to use
        req.resource = resource;
        return next();
      }

      logger.warn(
        `Unauthorized access attempt: user ${req.user.id} tried to access ${modelName} ${req.params.id} owned by ${ownerId}`
      );
      return res.status(403).json({ error: 'Forbidden' });
    } catch (error) {
      logger.error('Error in requireAdminOrOwner middleware', { error: error.message });
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
  requireAdmin,
  requireAdminOrOwner,
};
