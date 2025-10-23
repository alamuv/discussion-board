/**
 * GET /api/user
 * Returns the logged-in user's info
 * Requires authentication (handled by requireAuth middleware)
 */
const getUser = (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    picture: req.user.picture,
  });
};

module.exports = {
  getUser,
};

