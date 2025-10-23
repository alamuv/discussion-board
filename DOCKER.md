# Docker Setup

**Docker Compose Version**: v2.40.2-desktop.1

## Quick Start

```bash
# Build and start services
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes (deletes database)
docker compose down -v
```

**Note**: Docker Compose v2 uses `docker compose` (no hyphen). The old `docker-compose` command still works but is deprecated.

## Files

- **Dockerfile**: Node.js 22 Alpine image with health checks
- **docker-compose.yml**: PostgreSQL + Node.js backend services
- **.dockerignore**: Excludes unnecessary files from build

## Services

### PostgreSQL
- Image: postgres:16-alpine
- Port: 5432 (configurable via DB_PORT)
- Volume: postgres_data (persistent storage)
- Health check: pg_isready

### Backend
- Built from ./backend/Dockerfile
- Port: 3000
- Waits for PostgreSQL to be healthy before starting
- Health check: GET /health endpoint

## Environment Variables

Create a `.env` file in the project root to customize:

```env
NODE_ENV=production
DB_NAME=discussion_board
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432
DB_SSL=false
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_STATEMENT_TIMEOUT=30000
```

All variables have defaults, so `docker compose up --build` works without a .env file.

## Common Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f postgres

# Access PostgreSQL
docker compose exec postgres psql -U postgres -d discussion_board

# Access backend shell
docker compose exec backend sh

# Rebuild images
docker compose build --no-cache

# Remove everything
docker compose down -v

# Check service status
docker compose ps

# View service details
docker compose config
```

## How It Works

1. PostgreSQL starts first
2. Health check waits for PostgreSQL to be ready (pg_isready)
3. Backend service starts only after PostgreSQL is healthy
4. Backend connects to PostgreSQL using DB_HOST=postgres (service name)
5. Data persists in postgres_data volume across restarts

## Production Notes

- Uses Alpine Linux for minimal image size
- Health checks enable automatic restart on failure
- Connection pooling configured for production use
- Persistent volume ensures data survives container restarts
- Environment variables allow easy configuration

