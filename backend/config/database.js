const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Retry configuration with exponential backoff
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 30000; // 30 seconds

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getRetryDelay = (attempt) => {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  return Math.min(delay, MAX_RETRY_DELAY);
};

/**
 * Attempt to connect to the database with retries
 * @returns {Promise<Sequelize>} Sequelize instance
 */
const connectWithRetry = async () => {
  let lastError;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      logger.info(`Database connection attempt ${attempt + 1}/${MAX_RETRIES}`);

      const sequelize = new Sequelize(
        process.env.DB_NAME || 'discussion_board',
        process.env.DB_USER || 'postgres',
        process.env.DB_PASSWORD || 'postgres',
        {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          dialect: 'postgres',
          pool: {
            max: parseInt(process.env.DB_POOL_MAX || '10', 10),
            min: parseInt(process.env.DB_POOL_MIN || '2', 10),
            acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000', 10),
            idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
          }
        }
      );

      // Test the connection
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
      return sequelize;
    } catch (error) {
      lastError = error;
      logger.error(
        `Database connection failed (attempt ${attempt + 1}/${MAX_RETRIES}): ${error.message}`
      );

      if (attempt < MAX_RETRIES - 1) {
        const delay = getRetryDelay(attempt);
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  logger.error('Failed to connect to database after all retries');
  throw lastError;
};

// Initialize Sequelize instance
let sequelize = null;

/**
 * Get or initialize the Sequelize instance
 * @returns {Promise<Sequelize>} Sequelize instance
 */
const getSequelize = async () => {
  if (!sequelize) {
    sequelize = await connectWithRetry();
  }
  return sequelize;
};

/**
 * Close the database connection gracefully
 */
const closeConnection = async () => {
  if (sequelize) {
    try {
      await sequelize.close();
      logger.info('Database connection closed gracefully');
    } catch (error) {
      logger.error(`Error closing database connection: ${error.message}`);
    }
  }
};

module.exports = {
  getSequelize,
  closeConnection,
  sequelize: () => sequelize,
};

