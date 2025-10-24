# Discussion Board Frontend

A modern React frontend for the Discussion Board application built with Vite, Redux Toolkit, React Router, and Tailwind CSS.

## 🚀 Features

- **React 19** - Latest React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and dev server
- **Redux Toolkit** - Simplified state management
- **React Router v7** - Client-side routing with nested routes
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with cookie-based authentication
- **Responsive Design** - Mobile-friendly two-column layout

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Update .env if needed**
   ```bash
   VITE_API_URL=http://localhost:3000
   ```

## 🚀 Development

### Start dev server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📚 Key Components

### Navbar Component
- Displays app title and navigation links
- Shows user info when authenticated
- Login/Logout buttons
- Responsive design

### ThreadsLayout Container
- Two-column responsive layout
- Left: Thread list with search/filter
- Right: Thread details and comments
- Mobile-friendly (stacks on small screens)

### Redux Store

#### Auth Slice
- `user` - Current user object
- `authenticated` - Boolean auth status
- `loading` - Loading state
- `error` - Error messages

**Actions:**
- `checkAuthStatus()` - Check if user is logged in
- `logout()` - Logout user
- `setUser()` - Set user manually
- `clearError()` - Clear error messages

## 🔌 API Integration

### Axios Client
- Base URL: `http://localhost:3000`
- Credentials: `withCredentials: true` (for cookies)
- Request/Response logging
- Error handling with 401 redirect

### API Endpoints Used
- `GET /api/auth/status` - Check auth status
- `GET /auth/logout` - Logout
- `GET /auth/google` - Google OAuth login

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Responsive breakpoints (sm, md, lg, xl)
- Custom theme configuration
- Dark mode ready

### Color Scheme
- Primary: Blue (`bg-blue-600`)
- Success: Green (`bg-green-500`)
- Danger: Red (`bg-red-500`)
- Neutral: Gray (`bg-gray-*`)

## 🔐 Authentication

### Flow
1. User clicks "Login with Google"
2. Redirects to `/auth/google` (backend)
3. Google OAuth flow
4. Backend creates session
5. Frontend checks auth status
6. User logged in with session cookie

### Protected Routes
- `/threads` - Requires authentication
- `/threads/:id` - Requires authentication
- `/` - Public
- `/login` - Public

## 📱 Responsive Design

### Breakpoints
- **Mobile** (< 768px) - Single column
- **Tablet** (768px - 1024px) - Two columns
- **Desktop** (> 1024px) - Full two-column layout

### ThreadsLayout Responsiveness
- Mobile: Stacked layout
- Tablet+: Side-by-side layout
- Thread list: Always visible on mobile
- Details: Swipe or tap to switch

## 🧪 Testing

Currently no tests configured. To add tests:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

## 📦 Dependencies

### Core
- `react@19.2.0` - UI library
- `react-dom@19.2.0` - React DOM rendering
- `vite@7.1.12` - Build tool

### State Management
- `@reduxjs/toolkit@2.9.2` - Redux utilities
- `react-redux@9.2.0` - React-Redux bindings
- `redux@5.0.1` - Redux core

### Routing
- `react-router-dom@7.9.4` - Client-side routing

### HTTP
- `axios@1.12.2` - HTTP client

### Styling
- `tailwindcss@4.1.16` - CSS framework
- `postcss@8.5.6` - CSS processor
- `autoprefixer@10.4.21` - CSS vendor prefixes

### Build
- `@vitejs/plugin-react@5.0.4` - React plugin for Vite

## 🚀 Deployment

### Build
```bash
npm run build
```

### Output
- `dist/` - Production-ready files
- `dist/index.html` - Entry point
- `dist/assets/` - JS, CSS, images

### Serve
```bash
npm run preview
```

### Deploy to
- Vercel
- Netlify
- GitHub Pages
- Any static host

## 🔗 Backend Integration

### Expected Backend
- Running on `http://localhost:3000`
- Google OAuth configured
- Session-based authentication
- CORS enabled for `http://localhost:5173`

### Backend Routes
- `GET /auth/google` - OAuth login
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/logout` - Logout
- `GET /api/auth/status` - Check auth
- `GET /api/user` - Get user info
- `GET /api/threads` - Get threads
- `POST /api/threads` - Create thread
- `GET /api/threads/:id` - Get thread
- `PUT /api/threads/:id` - Update thread
- `DELETE /api/threads/:id` - Delete thread
- `GET /api/threads/:id/comments` - Get comments
- `POST /api/threads/:id/comments` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🐛 Troubleshooting

### Port already in use
```bash
# Change port in vite.config.js
server: {
  port: 5174,
}
```

### CORS errors
- Ensure backend has CORS enabled
- Check `withCredentials: true` in axios

### Auth not persisting
- Check browser cookies
- Verify `withCredentials: true`
- Check backend session configuration

### Tailwind not working
- Rebuild: `npm run dev`
- Clear cache: `rm -rf node_modules/.vite`
- Check `tailwind.config.js` content paths

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Axios](https://axios-http.com)

## 📝 License

ISC

## 👨‍💻 Development

### Next Steps
1. Implement thread list API integration
2. Add thread creation form
3. Implement comment system
4. Add pagination
5. Add search/filter
6. Add user profile page
7. Add notifications
8. Add dark mode

### Code Style
- Use functional components with hooks
- Use Redux for global state
- Use Tailwind for styling
- Keep components small and focused
- Use descriptive variable names

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

**Happy coding!** 🎉

