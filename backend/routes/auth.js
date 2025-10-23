const express = require('express');
const passport = require('passport');
const { requireAuth } = require('../middlewares/auth');
const { googleCallback, getAuthStatus, logout, getMe } = require('../controllers/authController');

const router = express.Router();

/**
 * GET /auth/google
 * Initiates Google OAuth login
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * GET /auth/google/callback
 * Google OAuth callback
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  googleCallback
);

/**
 * GET /auth/status
 * Returns authentication status
 */
router.get('/status', getAuthStatus);

/**
 * GET /auth/logout
 * Logout user and destroy session
 */
router.get('/logout', logout);

/**
 * GET /auth/me
 * Returns the logged-in user's info
 */
router.get('/me', requireAuth, getMe);

module.exports = router;

