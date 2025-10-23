const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const logger = require('./utils/logger');
const { getSequelize, closeConnection } = require('./config/database');
const initPassport = require('./config/passport');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173", // your React app URL
  credentials: true, // needed if using cookies/sessions
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize server
let server;

const startServer = async () => {
  try {
    // Initialize database connection
    logger.info('Initializing database connection...');
    const sequelize = await getSequelize();
    logger.info('Database connection initialized successfully');

    // Define models
    const User = require('./models/User')(sequelize);
    const Thread = require('./models/Thread')(sequelize);
    const Comment = require('./models/Comment')(sequelize);
    logger.info('Models defined');

    // Set up associations
    // User associations
    User.hasMany(Thread, { foreignKey: 'userId' });
    Thread.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(Comment, { foreignKey: 'userId' });
    Comment.belongsTo(User, { foreignKey: 'userId' });

    // Thread associations
    Thread.hasMany(Comment, { foreignKey: 'threadId', onDelete: 'CASCADE' });
    Comment.belongsTo(Thread, { foreignKey: 'threadId' });

    // Comment self-association (for nested replies)
    Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });
    Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });

    logger.info('Model associations set up');

    // Sync database
    await sequelize.sync({ alter: true });
    logger.info('Database models synced');

    // Initialize Passport with User model
    const users = await User.findAll();
    console.log(users);
    initPassport(User);
    logger.info('Passport initialized');

    // Session store using PostgreSQL
    const pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'discussion_board',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    // Session middleware
    app.use(
      session({
        store: new pgSession({
          pool: pgPool,
          tableName: 'session',
          createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      })
    );

    // Passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    // Routes
    app.get('/', (req, res) => {
      res.json({ message: 'Welcome to Discussion Board API' });
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'healthy' });
    });

    // Authentication routes
    app.use('/auth', authRoutes);

    // API routes
    app.use('/api', apiRoutes);

    // Start Express server
    server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await closeConnection();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after 30 seconds');
      process.exit(1);
    }, 30000);
  } else {
    await closeConnection();
    process.exit(0);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Start the server
startServer();

