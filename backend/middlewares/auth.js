const logger = require('../utils/logger');

/**
 * Middleware to check if user is authenticated
 * Verifies that the user has an active session
 * Returns 401 Unauthorized if not authenticated
 */
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    logger.warn('Unauthorized access attempt to protected route');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

module.exports = {
  requireAuth,
};

