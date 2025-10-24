# Deployment Guide

## Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- `.env` file in `backend/` directory with required environment variables

### Running Locally

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access Points:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- PgAdmin: http://localhost:5050

---

## Deployment on Render

### Prerequisites
1. Render account (https://render.com)
2. GitHub repository with this code
3. Environment variables configured

### Environment Variables Required

**Backend (.env or Render dashboard):**
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `SESSION_SECRET` - Session encryption secret (auto-generated on Render)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

### Deployment Steps

1. **Connect Repository**
   - Go to https://render.com/dashboard
   - Click "New +" → "Blueprint"
   - Select your GitHub repository
   - Choose branch (main/master)

2. **Configure Services**
   - Render will read `render.yaml` automatically
   - Review service configurations
   - Add missing environment variables in Render dashboard

3. **Deploy**
   - Click "Deploy"
   - Monitor deployment progress in Render dashboard
   - Services will be deployed in dependency order:
     1. PostgreSQL Database
     2. Backend API
     3. Frontend Web App

4. **Verify Deployment**
   - Frontend: `https://<your-app>.onrender.com`
   - Backend API: `https://<your-api>.onrender.com/api`
   - Check logs in Render dashboard for any errors

### Service Details

**Database (PostgreSQL)**
- Type: Private service
- Automatically provisioned with persistent volume
- Connection string auto-generated

**Backend API**
- Type: Web service
- Exposed publicly
- Connected to PostgreSQL
- Health check: `/health` endpoint

**Frontend (Nginx)**
- Type: Web service
- Exposed publicly
- Proxies API requests to backend
- Serves static React app

### Scaling & Performance

**Database:**
- Render provides automatic backups
- Monitor CPU/memory in dashboard
- Scale up if needed

**Backend:**
- Render auto-scales based on traffic
- Configure instance type in dashboard
- Monitor response times

**Frontend:**
- Static files cached by Render CDN
- Nginx handles compression
- Minimal resource usage

### Troubleshooting

**Services not connecting:**
- Check environment variables in Render dashboard
- Verify database is healthy
- Check backend logs for connection errors

**Frontend not loading:**
- Clear browser cache
- Check Nginx logs in Render dashboard
- Verify API proxy configuration

**Database connection issues:**
- Verify `DB_HOST` is correct (Render internal hostname)
- Check `DB_PASSWORD` matches
- Ensure database service is running

### Monitoring

- **Logs**: View in Render dashboard → Service → Logs
- **Metrics**: CPU, memory, network in Render dashboard
- **Health Checks**: Automatic monitoring of `/health` endpoints
- **Alerts**: Configure in Render dashboard settings

### Rollback

If deployment fails:
1. Go to Render dashboard
2. Select service
3. Click "Deployments"
4. Select previous successful deployment
5. Click "Redeploy"

### Cost Optimization

- Use free tier for development
- Paid tier for production
- Database: Persistent volume charges apply
- Bandwidth: Included in plan
- See https://render.com/pricing for details

---

## Environment Variables Reference

### Backend

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=discussion_board
DB_USER=postgres
DB_PASSWORD=<generated>
DB_SSL=true
DB_POOL_MAX=10
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_STATEMENT_TIMEOUT=30000

# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

# Session
SESSION_SECRET=<generated>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

### Frontend

```env
VITE_API_URL=https://<your-api>.onrender.com
```

---

## Support

For issues or questions:
1. Check Render documentation: https://render.com/docs
2. Review service logs in Render dashboard
3. Check GitHub issues in repository

