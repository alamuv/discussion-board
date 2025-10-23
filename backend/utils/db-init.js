const logger = require('./logger');
const { getSequelize } = require('../config/database');

/**
 * Initialize database schema
 * Syncs all models with the database
 * @param {Object} options - Sync options
 * @param {boolean} options.force - Drop tables if they exist (use with caution)
 * @param {boolean} options.alter - Alter tables to match models
 * @returns {Promise<void>}
 */
const initializeDatabase = async (options = {}) => {
  try {
    const sequelize = await getSequelize();

    logger.info('Syncing database models...');

    await sequelize.sync({
      force: options.force || false,
      alter: options.alter || false,
    });

    logger.info('Database models synced successfully');
  } catch (error) {
    logger.error('Failed to initialize database', { error: error.message });
    throw error;
  }
};

/**
 * Drop all tables from the database
 * WARNING: This will delete all data!
 * @returns {Promise<void>}
 */
const dropDatabase = async () => {
  try {
    const sequelize = await getSequelize();

    logger.warn('Dropping all database tables...');

    await sequelize.drop();

    logger.info('All database tables dropped');
  } catch (error) {
    logger.error('Failed to drop database', { error: error.message });
    throw error;
  }
};

/**
 * Get database statistics
 * @returns {Promise<Object>} Database statistics
 */
const getDatabaseStats = async () => {
  try {
    const sequelize = await getSequelize();

    const result = await sequelize.query(
      `SELECT 
        schemaname,
        COUNT(*) as table_count,
        SUM(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      GROUP BY schemaname`
    );

    return result[0];
  } catch (error) {
    logger.error('Failed to get database stats', { error: error.message });
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  dropDatabase,
  getDatabaseStats,
};

