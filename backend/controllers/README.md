# Controllers

This folder contains route handler functions (controllers) for the Express application.

Controllers are responsible for handling the business logic of each route. They receive requests from routes and return responses.

## 📁 Files

### `authController.js`
Authentication-related route handlers.

**Exports:**
- `googleCallback` - Handles Google OAuth callback
- `getAuthStatus` - Returns authentication status
- `logout` - Handles user logout

### `apiController.js`
API-related route handlers.

**Exports:**
- `getUser` - Returns logged-in user's info

## 🔄 Usage Pattern

### In Route Files

```javascript
const { getUser } = require('../controllers/apiController');

router.get('/user', requireAuth, getUser);
```

### Controller Function Structure

```javascript
const getUser = (req, res) => {
  // Handle request
  res.json(req.user);
};

module.exports = {
  getUser,
};
```

## 📝 Available Controllers

### Auth Controller (`authController.js`)

#### `googleCallback(req, res)`
Handles Google OAuth callback after successful authentication.

**Route:** `GET /auth/google/callback`  
**Middleware:** `passport.authenticate('google')`  
**Response:** Redirects to `/`

#### `getAuthStatus(req, res)`
Returns authentication status and user info if authenticated.

**Route:** `GET /auth/status`  
**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### `logout(req, res)`
Logs out user and destroys session.

**Route:** `GET /auth/logout`  
**Response:** Redirects to `/`

### API Controller (`apiController.js`)

#### `getUser(req, res)`
Returns logged-in user's info.

**Route:** `GET /api/user`  
**Middleware:** `requireAuth`  
**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "picture": "https://..."
}
```

## 🚀 Adding New Controllers

1. Create a new file: `backend/controllers/newController.js`
2. Define handler functions
3. Export them
4. Import in route files

Example:

```javascript
// backend/controllers/postController.js
const getPosts = (req, res) => {
  // Get posts from database
  res.json(posts);
};

const createPost = (req, res) => {
  // Create new post
  res.json(newPost);
};

module.exports = {
  getPosts,
  createPost,
};
```

Then use in routes:

```javascript
// backend/routes/posts.js
const { getPosts, createPost } = require('../controllers/postController');

router.get('/', getPosts);
router.post('/', createPost);
```

## 🎯 Best Practices

### 1. Single Responsibility
Each controller function should handle one specific task.

```javascript
// ✅ Good
const getUser = (req, res) => {
  res.json(req.user);
};

// ❌ Bad - doing too much
const getUser = (req, res) => {
  // Get user
  // Validate user
  // Update user
  // Delete user
  // Send email
};
```

### 2. Error Handling
Always handle errors properly.

```javascript
const getUser = (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
};
```

### 3. Logging
Log important actions for debugging.

```javascript
const logout = (req, res) => {
  logger.info(`User logging out: ${req.user.email}`);
  req.logout((err) => {
    if (err) {
      logger.error('Logout failed', { error: err.message });
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.redirect('/');
  });
};
```

### 4. Consistent Response Format
Use consistent response structure.

```javascript
// ✅ Good
res.json({
  success: true,
  data: user,
});

res.status(400).json({
  success: false,
  error: 'Invalid input',
});

// ❌ Bad - inconsistent
res.json(user);
res.json({ error: 'Invalid input' });
```

### 5. Separation from Routes
Keep business logic in controllers, not routes.

```javascript
// ✅ Good - logic in controller
// routes/api.js
router.get('/user', requireAuth, getUser);

// controllers/apiController.js
const getUser = (req, res) => {
  res.json(req.user);
};

// ❌ Bad - logic in route
router.get('/user', requireAuth, (req, res) => {
  res.json(req.user);
});
```

## 📊 File Structure

```
backend/
├── controllers/
│   ├── authController.js
│   ├── apiController.js
│   └── README.md
├── routes/
│   ├── auth.js (imports from controllers)
│   └── api.js (imports from controllers)
└── index.js
```

## 🔗 Related Files

- `backend/routes/auth.js` - Uses authController
- `backend/routes/api.js` - Uses apiController
- `backend/middlewares/auth.js` - Authentication middleware
- `backend/index.js` - Main server setup

## 🎓 MVC Pattern

Controllers are part of the MVC (Model-View-Controller) pattern:

- **Model** - Database models (Sequelize)
- **View** - Frontend (React)
- **Controller** - Route handlers (this folder)

```
Request → Route → Controller → Model → Response
```

## ✅ Checklist for New Controllers

- [ ] File is named descriptively (e.g., `userController.js`)
- [ ] Functions are exported in module.exports
- [ ] Functions have JSDoc comments
- [ ] Functions handle errors
- [ ] Functions log important actions
- [ ] Functions are imported in route files
- [ ] Functions follow consistent response format
- [ ] Functions are tested

## 📚 Express Controller Guide

A controller function receives:
- `req` - Request object (contains user data, query params, body, etc.)
- `res` - Response object (used to send responses)

```javascript
const myController = (req, res) => {
  // Access request data
  const userId = req.params.id;
  const query = req.query.search;
  const body = req.body;
  const user = req.user; // From authentication

  // Send response
  res.json({ data: 'value' });
  res.status(400).json({ error: 'Bad request' });
  res.redirect('/');
};
```

