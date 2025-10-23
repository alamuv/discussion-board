/**
 * Simple logger utility with different log levels
 * Can be extended to use Winston, Pino, or other logging libraries
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const LOG_LEVEL_PRIORITY = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || 'INFO';

/**
 * Format timestamp for logs
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} data - Additional data
 * @returns {string} Formatted log message
 */
const formatLog = (level, message, data = null) => {
  const timestamp = getTimestamp();
  const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataStr}`;
};

/**
 * Check if log level should be logged
 * @param {string} level - Log level to check
 * @returns {boolean} Whether to log
 */
const shouldLog = (level) => {
  return LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[currentLogLevel];
};

const logger = {
  /**
   * Log error message
   * @param {string} message - Error message
   * @param {any} data - Additional data
   */
  error: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.ERROR)) {
      console.error(formatLog(LOG_LEVELS.ERROR, message, data));
    }
  },

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {any} data - Additional data
   */
  warn: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.WARN)) {
      console.warn(formatLog(LOG_LEVELS.WARN, message, data));
    }
  },

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {any} data - Additional data
   */
  info: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.INFO)) {
      console.log(formatLog(LOG_LEVELS.INFO, message, data));
    }
  },

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {any} data - Additional data
   */
  debug: (message, data = null) => {
    if (shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },
};

module.exports = logger;

