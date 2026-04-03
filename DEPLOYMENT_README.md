# LazyScaper - Deployment Infrastructure

This directory contains everything you need to deploy the LazyScaper application to production.

## Files Overview

### Quick Start
- **QUICK_DEPLOY.md** - Get deployed to Railway in 30 minutes (START HERE!)
- **DEPLOYMENT_CHECKLIST.txt** - Step-by-step checklists for each platform

### Comprehensive Guides
- **DEPLOYMENT_GUIDE.md** - Complete guide with all platforms (Railway, Vercel, AWS)
- **DEPLOYMENT_README.md** - This file

### Docker Configuration
- **docker-compose.yml** - Development environment (with hot reload)
- **docker-compose.prod.yml** - Production environment with Nginx
- **backend/Dockerfile** - Multi-stage production build for API
- **frontend/Dockerfile** - Multi-stage production build for web
- **nginx.conf** - Production-ready Nginx reverse proxy config
- **backend/.dockerignore** - Optimized Docker build
- **frontend/.dockerignore** - Optimized Docker build

### Environment Files
- **.env.example** - Template for all environment variables

## Quick Navigation

### I want to deploy as fast as possible (30 min)
→ Read: **QUICK_DEPLOY.md**

### I want detailed step-by-step instructions
→ Read: **DEPLOYMENT_GUIDE.md**

### I want a checklist to follow
→ Use: **DEPLOYMENT_CHECKLIST.txt**

### I want to test locally with Docker
```bash
docker-compose up -d
# Frontend: http://localhost:3000
# API: http://localhost:5000
```

### I want to deploy to production with Docker
```bash
cp .env.example .env
# Edit .env with production values
docker-compose -f docker-compose.prod.yml up -d
```

## Recommended Deployment Path

### Easiest (Recommended)
1. **Railway** (start to finish in 30 min)
   - Auto database provisioning
   - Auto git deployments
   - Simple env variable management
   - Perfect for full-stack apps
   - See: QUICK_DEPLOY.md

### Flexible
1. **Vercel** (frontend) + **Railway** (backend)
   - Vercel is industry standard for Next.js
   - Railway handles backend/database
   - See: DEPLOYMENT_GUIDE.md → Vercel + Railway section

### Self-Hosted
1. **AWS** (EC2 + RDS + CloudFront)
   - Maximum control
   - More configuration required
   - See: DEPLOYMENT_GUIDE.md → AWS section

### Local/On-Premise
1. **Docker Compose** on your server
   - Single `docker-compose.prod.yml` file
   - Includes Nginx reverse proxy
   - See: docker-compose.prod.yml

## Environment Variables You'll Need

### Backend
```
DATABASE_URL          - PostgreSQL connection string
API_PORT             - Port for API (default: 5000)
NODE_ENV             - production
JWT_SECRET           - Generated secret key
FRONTEND_URL         - Your frontend domain
INDEED_API_KEY       - Optional
LINKEDIN_API_KEY     - Optional
```

### Frontend
```
NEXT_PUBLIC_API_URL  - Your backend API URL + /api
```

## Key Architecture Points

### Multi-Stage Docker Builds
- Smaller final images
- Production-optimized
- Security-focused (non-root user)
- Health checks included

### PostgreSQL Database
- Schema auto-initializes from backend/schema.sql
- Connection pooling ready
- Backup-friendly volume structure

### Security Features
- Non-root user in containers
- Health checks for all services
- CORS properly configured
- JWT authentication ready
- No hardcoded secrets

### Production Ready
- Restart policies
- Health checks
- Logging configured
- Reverse proxy support
- SSL/TLS support

## Deployment Comparison

| Feature | Railway | Vercel | AWS | Docker |
|---------|---------|--------|-----|--------|
| Ease of Use | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Time to Deploy | 30 min | 30 min | 1+ hour | 1+ hour |
| Cost | Free tier good | Free tier limited | Pay as you go | Your infra |
| Best For | Full-stack | Frontend | Complex setups | On-prem |
| Database | Included | Need external | AWS RDS | PostgreSQL |
| Auto-deploy | Yes | Yes | No | No |
| Scalability | Easy | Good | Full control | Manual |

## File Structure

```
lazyscaper/
├── QUICK_DEPLOY.md                 # Start here!
├── DEPLOYMENT_GUIDE.md             # Comprehensive guide
├── DEPLOYMENT_CHECKLIST.txt        # Step-by-step checklists
├── DEPLOYMENT_README.md            # This file
├── .env.example                    # Environment template
│
├── docker-compose.yml              # Dev environment
├── docker-compose.prod.yml         # Prod with Nginx
├── nginx.conf                      # Reverse proxy config
│
├── backend/
│   ├── Dockerfile                  # Multi-stage build
│   ├── .dockerignore              # Build optimization
│   ├── package.json
│   ├── src/
│   └── schema.sql                 # Database schema
│
└── frontend/
    ├── Dockerfile                  # Multi-stage build
    ├── .dockerignore              # Build optimization
    ├── package.json
    └── pages/
```

## Quick Commands

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database
docker-compose down -v
docker-compose up -d
```

### Production Docker
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production
docker-compose -f docker-compose.prod.yml down
```

### Verifying Deployment
```bash
# Backend health
curl https://your-api-url/health

# Frontend (in browser)
https://your-frontend-url

# Database connectivity
# Check logs for "Database connected" message
```

## Security Checklist

Before going to production:
- [ ] Change JWT_SECRET to a generated value
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for your domain
- [ ] Set NODE_ENV=production
- [ ] Remove .env from git (use .gitignore)
- [ ] Enable database backups
- [ ] Configure monitoring/alerts
- [ ] Review security group rules
- [ ] Update FRONTEND_URL and NEXT_PUBLIC_API_URL

## Monitoring Your Deployment

### Railway
- Built-in logs and monitoring
- View at: railway.app dashboard

### Vercel
- Built-in analytics
- View at: vercel.com dashboard

### AWS
- CloudWatch logs and metrics
- AWS management console

### Docker
- Check container logs
- Monitor system resources
- Set up external monitoring (optional)

## Troubleshooting

### Services won't start?
1. Check Docker is running
2. Review docker-compose logs
3. Verify .env file exists with correct values
4. Check ports aren't in use

### API not reachable from frontend?
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check FRONTEND_URL in backend environment
3. Ensure backend service is running
4. Check browser console for CORS errors

### Database won't connect?
1. Verify DATABASE_URL format
2. Check database credentials
3. Ensure database service is running
4. Test connection manually: psql $DATABASE_URL

### Still stuck?
1. Read DEPLOYMENT_GUIDE.md troubleshooting section
2. Check service logs for error messages
3. Review environment variables are correct
4. Verify all services are running: `docker-compose ps`

## Getting Help

1. **Quick Deploy Issues** → QUICK_DEPLOY.md troubleshooting
2. **Platform-Specific Issues** → DEPLOYMENT_GUIDE.md relevant section
3. **Docker Issues** → Check docker-compose logs
4. **Configuration Issues** → Review .env.example and your .env file

## Next Steps After Deployment

1. **Configure Monitoring**
   - Set up alerts for errors
   - Monitor API response times
   - Track database performance

2. **Set Up Backups**
   - Automate database backups
   - Test backup restoration
   - Document recovery process

3. **Enable Auto-Scaling** (if needed)
   - Railway: automatic
   - Vercel: automatic
   - AWS: configure auto-scaling groups

4. **Add Custom Domain**
   - Configure DNS records
   - Obtain SSL certificate
   - Test HTTPS access

5. **Team Access**
   - Add team members to deployment platform
   - Configure permissions
   - Document access procedures

## Success!

Your application is now deployed and accessible to the world. Monitor it regularly, keep dependencies updated, and enjoy!

---

**Questions?** Check DEPLOYMENT_GUIDE.md or QUICK_DEPLOY.md for detailed instructions.

