# Railway Backend Deployment Configuration Checklist

## Pre-Deployment Phase

### AWS RDS Setup
- [ ] AWS account created and RDS service accessible
- [ ] PostgreSQL database instance created
  - [ ] Instance identifier: `lazyscaper-db`
  - [ ] Engine: PostgreSQL 15+
  - [ ] Instance class: db.t3.micro or larger
  - [ ] Storage: 20GB allocated
  - [ ] Publicly accessible: YES
  - [ ] Security group allows inbound on port 5432
- [ ] RDS endpoint copied (e.g., `xxx.rds.amazonaws.com`)
- [ ] Master username saved (default: `postgres`)
- [ ] Master password saved and secure
- [ ] Database `job_dashboard` created
- [ ] DATABASE_URL format verified

### Railway Account Setup
- [ ] Railway.app account created
- [ ] GitHub account connected to Railway
- [ ] lazyscaper repository authorized for Railway

### Generate Secrets
- [ ] JWT_SECRET generated (32+ bytes hex)
  ```
  Command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  Value: ________________________________________________________________________________
  ```
- [ ] CORS FRONTEND_URL identified or estimated
  - [ ] For now: use placeholder (will update later)
  - [ ] After Vercel deploy: use actual URL

## Deployment Phase

### Railway Service Configuration
- [ ] Backend service created from GitHub repository
- [ ] Build logs show successful compilation
  - [ ] "tsc" TypeScript compilation completed
  - [ ] No type errors
  - [ ] "npm run build" executed successfully

### Environment Variables in Railway Dashboard

**Database**
- [ ] DATABASE_URL set
  - [ ] Format: `postgresql://user:password@host:5432/db`
  - [ ] Host: RDS endpoint (not localhost!)
  - [ ] Database name: `job_dashboard`
  - [ ] Tested locally first: YES

**Server Configuration**
- [ ] NODE_ENV = `production`
- [ ] API_PORT = `5000`

**Security**
- [ ] JWT_SECRET set (from Step 1)
  - [ ] Value: 64-character hex string
  - [ ] Stored securely
  - [ ] Never shared in logs/docs

**CORS**
- [ ] FRONTEND_URL set (temporary or final)
  - [ ] Format: `https://domain.vercel.app`
  - [ ] No trailing slash
  - [ ] Correct domain

**APIs**
- [ ] INDEED_API_KEY set (if available)
- [ ] LINKEDIN_API_KEY set (if available)

### Deployment Verification
- [ ] Railway shows "Deployment successful" status
- [ ] Container running indicator is green
- [ ] No error messages in deployment logs
- [ ] Service has been assigned a public Railway URL
  - [ ] Format: `https://service-name.railway.app`
  - [ ] URL copied for testing

## Post-Deployment Phase

### Database Initialization
- [ ] Database schema initialized
  - [ ] Option A: Used `/api/init-db` endpoint
    ```bash
    curl -X POST https://your-railway-url/api/init-db
    ```
  - [ ] Option B: Used psql with schema.sql
  - [ ] Response: `{"status":"Database initialized successfully"}`

### Health Check Verification
- [ ] Health endpoint returns 200
  ```bash
  curl https://your-railway-url/health
  ```
- [ ] Response contains:
  - [ ] `"status": "healthy"`
  - [ ] `"database": "connected"`
  - [ ] `"environment": "production"`
  - [ ] `"api_port": 5000`

### Database Connection Test
- [ ] Railway logs show: `Database connection verified`
- [ ] Railway logs show: `Backend server running on port 5000`
- [ ] No connection errors in logs
- [ ] RDS CloudWatch shows connections from Railway IP

### CORS Configuration Test
- [ ] Frontend can reach backend without CORS errors
  - [ ] Test with curl from different origin (if possible)
  - [ ] Check browser Network tab for CORS headers

### API Endpoint Testing
- [ ] POST `/api/auth/register` works
  - [ ] Can create new user
  - [ ] Returns JWT token
  - [ ] Email stored in database

- [ ] POST `/api/auth/login` works
  - [ ] Can login with credentials
  - [ ] Returns valid JWT token
  - [ ] Token can be used for protected endpoints

- [ ] GET `/api/profile` works with auth
  - [ ] Requires JWT token in Authorization header
  - [ ] Returns user profile data
  - [ ] Returns 401 without valid token

### Logs Review
- [ ] Check Railway Logs for startup messages:
  - [ ] `Unexpected error on idle client` - NONE
  - [ ] `Failed to connect to database` - NONE
  - [ ] Any error messages - NOTED AND RESOLVED

## Documentation Phase

### Code Updates
- [ ] backend/.env.example updated with all variables
- [ ] backend/src/index.ts updated with CORS configuration
- [ ] backend/src/index.ts health endpoint enhanced
- [ ] backend/src/config/database.ts logging improved
- [ ] Docker configuration verified (uses env vars)
- [ ] TypeScript compilation successful

### Documentation Files
- [ ] RAILWAY_DEPLOYMENT_GUIDE.md created
  - [ ] RDS setup instructions included
  - [ ] Step-by-step Railway setup
  - [ ] Environment variables documented
  - [ ] Testing procedures included
  - [ ] Troubleshooting section complete

- [ ] RAILWAY_CONFIG_CHECKLIST.md created (this file)
  - [ ] All checkboxes present
  - [ ] Clear instructions for each step

- [ ] Configuration reference document created
  - [ ] Environment variable purposes listed
  - [ ] Example values provided
  - [ ] Default values documented

### Git Commit
- [ ] Changes staged for commit:
  - [ ] .env.example updated
  - [ ] src/index.ts updated
  - [ ] src/config/database.ts updated
  - [ ] RAILWAY_DEPLOYMENT_GUIDE.md created
  - [ ] RAILWAY_CONFIG_CHECKLIST.md created

- [ ] Commit message clear and descriptive:
  ```
  Configure Railway backend deployment with RDS integration
  
  - Updated CORS configuration with FRONTEND_URL env variable
  - Enhanced health endpoint with database connectivity check
  - Improved database configuration with connection validation
  - Added comprehensive Railway deployment documentation
  - Included environment variable configuration guide
  ```

- [ ] Commit pushed to repository
  - [ ] Remote shows new commit
  - [ ] Railway auto-deployment triggered (if enabled)

## Frontend Integration Phase

### Before Frontend Deployment
- [ ] Note Railway backend URL: `_________________________________`
- [ ] Frontend environment configured to use backend URL
- [ ] Frontend .env variables set correctly:
  ```
  NEXT_PUBLIC_API_URL=https://your-railway-url/api
  ```

### After Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Frontend deployment URL obtained: `_________________________________`
- [ ] FRONTEND_URL environment variable updated in Railway
- [ ] Railway service redeployed with new FRONTEND_URL
- [ ] CORS no longer blocks frontend requests

### Cross-Origin Testing
- [ ] Frontend can make requests to Railway backend
- [ ] No CORS errors in browser console
- [ ] API responses reach frontend correctly
- [ ] Authentication flow works end-to-end

## Monitoring and Validation

### Performance Checks
- [ ] Health endpoint responds in < 500ms
- [ ] Database queries complete in < 1000ms
- [ ] No memory leaks evident in logs
- [ ] CPU usage remains stable

### Security Validation
- [ ] JWT tokens are properly signed
- [ ] Protected endpoints reject unauthenticated requests
- [ ] Database credentials not logged
- [ ] HTTPS enforced (Railway provides this)
- [ ] CORS allows only frontend origin

### Database Health
- [ ] RDS CPU utilization < 30%
- [ ] RDS storage has > 10GB free
- [ ] No slow query logs
- [ ] Connections are properly closed

## Sign-Off

- [ ] All checkboxes completed
- [ ] No blocking issues remain
- [ ] Team members reviewed configuration
- [ ] Ready for production traffic
- [ ] Monitoring and alerting configured

**Completed by:** ________________________  **Date:** __________

**Reviewed by:** ________________________  **Date:** __________

## Quick Reference

### Useful Commands

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Test database connection
psql postgresql://user:password@host:5432/job_dashboard

# Test health endpoint
curl https://your-railway-url/health

# Initialize database
curl -X POST https://your-railway-url/api/init-db

# View Railway logs
railway logs -f
```

### Important URLs

- Railway Dashboard: https://railway.app
- RDS Console: https://console.aws.amazon.com/rds/
- Backend Health: https://your-railway-url/health
- API Documentation: /API_SPECIFICATION.md (in repo root)

### Support Contacts

- Railway Support: https://railway.app/support
- AWS Support: https://aws.amazon.com/support
- Backend Issues: See RAILWAY_DEPLOYMENT_GUIDE.md troubleshooting
