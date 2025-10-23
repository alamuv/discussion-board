# Middlewares

This folder contains reusable middleware functions for the Express application.

## 📁 Files

### `auth.js`
Authentication and authorization middleware functions.

**Exports:**
- `requireAuth` - Checks if user is authenticated

## 🔧 Usage

### Import in Route Files

```javascript
const { requireAuth } = require('../middlewares/auth');

router.get('/protected', requireAuth, (req, res) => {
  res.json({ user: req.user });
});
```

### Import in Main Server

```javascript
const { requireAuth } = require('./middlewares/auth');

// Apply to all routes under /api
app.use('/api', requireAuth, apiRoutes);
```

## 📝 Available Middlewares

### `requireAuth`

Checks if the user is authenticated (has an active session).

**Usage:**
```javascript
router.get('/user', requireAuth, (req, res) => {
  // req.user is available here
  res.json(req.user);
});
```

**Response on Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**Status Code:** 401

## 🚀 Adding New Middlewares

1. Add new middleware function to `auth.js`
2. Export it in the module.exports object
3. Import and use in route files

Example:

```javascript
// In auth.js
const requireAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
};
```

Then use in routes:

```javascript
const { requireAuth, requireAdmin } = require('../middlewares/auth');

router.delete('/admin/users/:id', requireAdmin, (req, res) => {
  // Admin-only route
});
```

## 📚 Middleware Patterns

### Single Middleware
```javascript
router.get('/route', requireAuth, handler);
```

### Multiple Middlewares
```javascript
router.get('/route', requireAuth, requireAdmin, handler);
```

### Global Middleware
```javascript
app.use(requireAuth);
```

### Conditional Middleware
```javascript
router.get('/route', (req, res, next) => {
  if (someCondition) {
    requireAuth(req, res, next);
  } else {
    next();
  }
});
```

## 🔐 Security Best Practices

1. **Always check authentication** before accessing user data
2. **Log unauthorized attempts** for security monitoring
3. **Return appropriate status codes** (401 for auth, 403 for authorization)
4. **Validate user permissions** in authorization middleware
5. **Use middleware composition** for complex permission checks

## 📖 Related Files

- `backend/routes/api.js` - Uses `requireAuth` middleware
- `backend/routes/auth.js` - OAuth routes
- `backend/config/passport.js` - Passport configuration
- `backend/index.js` - Main server setup

## 🎓 Express Middleware Guide

Middleware functions have access to:
- `req` - Request object
- `res` - Response object
- `next` - Function to pass control to next middleware

```javascript
const middleware = (req, res, next) => {
  // Do something with req/res
  next(); // Pass to next middleware
  // Or send response
  res.json({ data: 'value' });
};
```

## ✅ Checklist for New Middlewares

- [ ] Function is exported in module.exports
- [ ] Function calls `next()` on success
- [ ] Function sends response on error
- [ ] Function has JSDoc comments
- [ ] Function is imported where needed
- [ ] Function is tested

