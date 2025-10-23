const logger = require('../utils/logger');

/**
 * GET /auth/google/callback
 * Google OAuth callback handler
 * Logs successful authentication and redirects to home
 */
const googleCallback = (req, res) => {
  logger.info(`User authenticated: ${req.user.email}`);
  // Redirect to frontend after successful login
  res.redirect('http://localhost:5173');
};

/**
 * GET /auth/status
 * Returns authentication status and user info if authenticated
 */
const getAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
};

/**
 * GET /auth/logout
 * Logout user and destroy session
 */
const logout = (req, res) => {
  const userEmail = req.user?.email || 'unknown';
  logger.info(`User logging out: ${userEmail}`);

  req.logout((err) => {
    if (err) {
      logger.error('Error during logout', { error: err.message });
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
};

/**
 * GET /auth/me
 * Returns the logged-in user's info
 * Requires authentication (handled by requireAuth middleware)
 */
const getMe = (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture,
  });
};

module.exports = {
  googleCallback,
  getAuthStatus,
  logout,
  getMe,
};

