const express = require('express');
const { requireAuth } = require('../middlewares/auth');
const { getUser } = require('../controllers/apiController');

const router = express.Router();

/**
 * GET /api/user
 * Returns the logged-in user's info
 */
router.get('/user', requireAuth, getUser);

module.exports = router;
