# Database Setup Guide

## Overview

The backend uses Sequelize ORM with PostgreSQL for database management. The connection is production-ready with connection pooling, automatic retries with exponential backoff, comprehensive error logging, and graceful shutdown handling.

## Features

### 1. Connection Pooling
- **Max Connections**: 10 (configurable via `DB_POOL_MAX`)
- **Min Connections**: 2 (configurable via `DB_POOL_MIN`)
- **Acquire Timeout**: 30 seconds (configurable via `DB_POOL_ACQUIRE`)
- **Idle Timeout**: 10 seconds (configurable via `DB_POOL_IDLE`)

Connection pooling improves performance by reusing database connections instead of creating new ones for each request.

### 2. Automatic Retries with Exponential Backoff
- **Max Retries**: 5 attempts
- **Initial Delay**: 1 second
- **Max Delay**: 30 seconds
- **Backoff Formula**: `delay = min(1000 * 2^attempt, 30000)`

The system automatically retries on connection failures with exponential backoff to handle temporary network issues gracefully.

### 3. Error Logging
- Comprehensive logging at multiple levels: ERROR, WARN, INFO, DEBUG
- Configurable log level via `LOG_LEVEL` environment variable
- Timestamps and structured logging for better debugging

### 4. Graceful Shutdown
- Closes HTTP server first
- Closes database connections
- 30-second timeout for graceful shutdown before forced termination
- Handles SIGTERM and SIGINT signals

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=INFO

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=discussion_board
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Connection Pool Configuration
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_STATEMENT_TIMEOUT=30000
```

### Environment Variable Details

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment (development/production) |
| `LOG_LEVEL` | INFO | Logging level (ERROR/WARN/INFO/DEBUG) |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 5432 | Database port |
| `DB_NAME` | discussion_board | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |
| `DB_SSL` | false | Enable SSL for database connection |
| `DB_POOL_MAX` | 10 | Maximum pool connections |
| `DB_POOL_MIN` | 2 | Minimum pool connections |
| `DB_POOL_ACQUIRE` | 30000 | Connection acquire timeout (ms) |
| `DB_POOL_IDLE` | 10000 | Connection idle timeout (ms) |
| `DB_STATEMENT_TIMEOUT` | 30000 | Statement execution timeout (ms) |

## Setup Instructions

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE discussion_board;

# Create user (if not using default postgres user)
CREATE USER discussion_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE discussion_board TO discussion_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

### 4. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

Returns the server and database connection status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "unhealthy",
  "database": "disconnected"
}
```

### Welcome
```
GET /
```

Returns a welcome message.

**Response (200 OK):**
```json
{
  "message": "Welcome to Discussion Board API"
}
```

## Database Utilities

### Initialize Database

Use the `db-init.js` utility to initialize the database schema:

```javascript
const { initializeDatabase } = require('./utils/db-init');

// Sync models with database
await initializeDatabase();

// Force sync (drops and recreates tables)
await initializeDatabase({ force: true });

// Alter tables to match models
await initializeDatabase({ alter: true });
```

### Get Database Statistics

```javascript
const { getDatabaseStats } = require('./utils/db-init');

const stats = await getDatabaseStats();
console.log(stats);
```

### Drop Database

```javascript
const { dropDatabase } = require('./utils/db-init');

// WARNING: This deletes all data!
await dropDatabase();
```

## Logging

The logger utility provides structured logging with different levels:

```javascript
const logger = require('./utils/logger');

logger.error('Error message', { additionalData: 'value' });
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message');
```

Set `LOG_LEVEL` environment variable to control which logs are displayed:
- `ERROR`: Only errors
- `WARN`: Errors and warnings
- `INFO`: Errors, warnings, and info (default)
- `DEBUG`: All logs

## Production Recommendations

1. **Use Environment Variables**: Never hardcode credentials
2. **Enable SSL**: Set `DB_SSL=true` for production databases
3. **Adjust Pool Size**: Based on your application's concurrency needs
4. **Monitor Logs**: Use a log aggregation service (e.g., ELK, Datadog)
5. **Set Appropriate Timeouts**: Adjust `DB_STATEMENT_TIMEOUT` based on query complexity
6. **Use Connection Pooling**: Keep `DB_POOL_MIN` and `DB_POOL_MAX` appropriate for your workload
7. **Regular Backups**: Implement automated database backups
8. **Monitor Connections**: Track connection pool usage and adjust as needed

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check `DB_HOST` and `DB_PORT` are correct
- Verify database credentials

### Connection Timeout
- Increase `DB_POOL_ACQUIRE` timeout
- Check network connectivity
- Verify database server is accessible

### Pool Exhaustion
- Increase `DB_POOL_MAX`
- Check for connection leaks in application code
- Monitor active connections

### Slow Queries
- Increase `DB_STATEMENT_TIMEOUT`
- Add database indexes
- Optimize query performance

## File Structure

```
backend/
├── config/
│   └── database.js          # Sequelize configuration and connection
├── utils/
│   ├── logger.js            # Logging utility
│   └── db-init.js           # Database initialization utilities
├── index.js                 # Main server entry point
├── .env                     # Environment variables (local)
├── .env.example             # Environment variables template
└── DATABASE_SETUP.md        # This file
```

## References

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Connection Pooling Best Practices](https://wiki.postgresql.org/wiki/Number_Of_Database_Connections)

