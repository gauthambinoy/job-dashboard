# Backend Deployment Configuration - Complete Guide

## Executive Summary

The LazyScaper backend is configured for Railway deployment with AWS RDS PostgreSQL integration. This document covers all configuration changes made, environment variable setup, and verification procedures.

## Configuration Changes Made

### 1. Backend Source Code Updates

#### File: `/backend/src/index.ts`
**Changes:**
- Added CORS configuration with `FRONTEND_URL` environment variable
- Enhanced health endpoint to check database connectivity
- Added response details including environment info

**Before:**
```typescript
app.use(cors());
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

**After:**
```typescript
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.get('/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      api_port: PORT
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date(),
      database: 'disconnected',
      error: error.message,
      environment: process.env.NODE_ENV || 'development',
      api_port: PORT
    });
  }
});
```

#### File: `/backend/src/config/database.ts`
**Changes:**
- Added validation for DATABASE_URL environment variable
- Improved connection pool configuration
- Added startup connection test
- Enhanced error logging

**Before:**
```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/job_dashboard',
});
```

**After:**
```typescript
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('FATAL: DATABASE_URL environment variable is not set');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const pool = new Pool({
  connectionString: connectionString || 'postgresql://postgres:password@localhost:5432/job_dashboard',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('connect', () => {
  console.log('Database connection pool created');
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Failed to connect to database on startup:', err.message);
  } else {
    console.log('Database connection verified');
  }
});
```

### 2. Environment Configuration Files

#### File: `/backend/.env.example`
**Updated with production-ready template:**
```env
# Database Configuration
DATABASE_URL=

# Server Configuration
API_PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL for CORS configuration
FRONTEND_URL=http://localhost:3000

# External API Keys
INDEED_API_KEY=your_indeed_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
```

#### File: `/backend/.env`
**Updated with production templates:**
```env
# Production Configuration - UPDATE THESE VALUES FOR RAILWAY DEPLOYMENT

# Database - Use RDS endpoint for production
DATABASE_URL=postgresql://postgres:your_password@your_rds_endpoint:5432/job_dashboard

# Server Configuration
API_PORT=5000
NODE_ENV=production

# Security - Generate a secure JWT key
JWT_SECRET=generate-secure-key-with-node-crypto

# CORS - Update after frontend deployment
FRONTEND_URL=https://your-frontend-vercel-url.vercel.app

# External APIs (Optional)
INDEED_API_KEY=your_indeed_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
```

## Environment Variables Explained

### Required Variables

#### DATABASE_URL
- **Purpose:** PostgreSQL connection string
- **Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Production Example:** `postgresql://postgres:secure_password@lazyscaper.c9akciq32.us-east-1.rds.amazonaws.com:5432/job_dashboard`
- **Action:** Obtain from AWS RDS instance details

#### NODE_ENV
- **Purpose:** Environment mode for application behavior
- **Value:** `production`
- **Effect:** 
  - Strict error handling
  - Optimized logging
  - CORS restricted to FRONTEND_URL
  - DATABASE_URL validation enforced

#### API_PORT
- **Purpose:** Server listening port
- **Value:** `5000`
- **Note:** Railway handles port assignment; this is internal port

#### JWT_SECRET
- **Purpose:** Secret key for JWT token signing
- **Requirements:**
  - Minimum 32 bytes (64 hex characters)
  - Cryptographically random
  - Generation: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- **Critical:** Different for each environment, never share

#### FRONTEND_URL
- **Purpose:** Allowed origin for CORS
- **Format:** `https://domain.vercel.app` (no trailing slash)
- **Production Example:** `https://lazyscaper-frontend-prod.vercel.app`
- **Action:** Update after frontend Vercel deployment

### Optional Variables

#### INDEED_API_KEY
- **Purpose:** Indeed job scraper integration
- **Status:** Optional (feature disabled if not set)

#### LINKEDIN_API_KEY
- **Purpose:** LinkedIn job integration
- **Status:** Optional (feature disabled if not set)

## Deployment Steps

### Phase 1: AWS RDS Setup

1. **Create RDS PostgreSQL Instance**
   - Instance ID: `lazyscaper-db`
   - Engine: PostgreSQL 15+
   - Instance class: `db.t3.micro`
   - Publicly accessible: YES
   - Security group: Allow inbound port 5432

2. **Initialize Database**
   ```bash
   psql postgresql://postgres:password@endpoint:5432/postgres
   CREATE DATABASE job_dashboard;
   \c job_dashboard
   ```

3. **Record Connection Details**
   - Endpoint: `lazyscaper-db.c9akciq32.us-east-1.rds.amazonaws.com`
   - Port: `5432`
   - Database: `job_dashboard`
   - Username: `postgres`
   - Password: `your_secure_password`

### Phase 2: Railway Backend Deployment

1. **Set Environment Variables in Railway**
   Navigate to Railway Dashboard > Backend Service > Variables
   
   Add each variable:
   ```
   DATABASE_URL: postgresql://postgres:password@endpoint:5432/job_dashboard
   NODE_ENV: production
   API_PORT: 5000
   JWT_SECRET: <64-char-hex-key>
   FRONTEND_URL: https://your-vercel-url.vercel.app
   ```

2. **Trigger Deployment**
   - Push to GitHub
   - Railway auto-deploys on push
   - Or manually trigger in Railway dashboard

3. **Monitor Deployment**
   - Check "Deployments" tab for status
   - Wait for green checkmark (successful build)
   - Note the Railway URL (e.g., `https://lazyscaper-backend-prod.railway.app`)

### Phase 3: Database Schema Initialization

**Option A: Using API Endpoint (Recommended)**
```bash
curl -X POST https://your-railway-url/api/init-db
```

Expected response:
```json
{"status":"Database initialized successfully"}
```

**Option B: Using psql**
```bash
psql postgresql://postgres:password@endpoint:5432/job_dashboard < schema.sql
```

### Phase 4: Verification Testing

#### Test 1: Health Endpoint
```bash
curl https://your-railway-url/health

# Expected response (200 OK):
{
  "status": "healthy",
  "timestamp": "2026-04-01T10:00:00.000Z",
  "database": "connected",
  "environment": "production",
  "api_port": 5000
}
```

#### Test 2: Database Connectivity
Railway logs should show:
```
Database connection verified
Backend server running on port 5000
```

#### Test 3: Authentication Endpoints
```bash
# Register
curl -X POST https://your-railway-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "name": "Test User"
  }'

# Should return JWT token
```

#### Test 4: CORS Configuration
Frontend should connect without CORS errors.

## Configuration Files Location Reference

| File | Purpose | Status |
|------|---------|--------|
| `/backend/.env` | Production configuration | Updated |
| `/backend/.env.example` | Configuration template | Updated |
| `/backend/src/index.ts` | Main application | Updated |
| `/backend/src/config/database.ts` | Database connection | Updated |
| `/backend/Dockerfile` | Container configuration | Current |
| `/backend/package.json` | Dependencies | Current |

## Security Considerations

### Production Checklist
- [ ] Database URL uses RDS endpoint (not localhost)
- [ ] NODE_ENV set to `production`
- [ ] JWT_SECRET is cryptographically random (64+ hex chars)
- [ ] FRONTEND_URL matches actual frontend domain
- [ ] No secrets committed to git repository
- [ ] Railway uses environment variables (not .env file)
- [ ] RDS security group restricts access appropriately
- [ ] HTTPS enforced (Railway provides this)
- [ ] Password-protected RDS instance
- [ ] Audit logs enabled

### Secret Management
- JWT_SECRET: Generated with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Database password: Use AWS RDS secure password generator
- API keys: Stored only in Railway environment variables
- Never log sensitive variables
- Rotate secrets periodically

## Monitoring and Logs

### Access Railway Logs
```bash
# Via Railway CLI
railway logs -f

# Via Railway Dashboard
# Service > Logs tab
```

### Expected Startup Logs
```
Database connection pool created
Database connection verified
Backend server running on port 5000
```

### Warning Signs
- `FATAL: DATABASE_URL environment variable is not set`
- `Failed to connect to database on startup`
- `CORS policy violation errors in browser`
- Connection timeout errors (> 5000ms)

## Troubleshooting Matrix

| Issue | Symptom | Solution |
|-------|---------|----------|
| Database Connection Failed | 503 on /health | Verify DATABASE_URL in Railway variables, check RDS security group |
| CORS Errors | Browser blocks requests | Update FRONTEND_URL to match frontend domain exactly |
| JWT Secret Invalid | Token verification fails | Generate new JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| Health Endpoint 404 | Route not found | Check backend deployed successfully, clear browser cache |
| Slow Responses | API takes > 2 seconds | Check RDS performance, review slow query logs |

## Testing Guide

### Local Development Testing
```bash
# Start backend with local PostgreSQL
cd backend
npm install
npm run dev

# Test in another terminal
curl http://localhost:5000/health
```

### Railway Staging Testing
```bash
# After deployment to Railway
curl https://your-railway-url/health

# Test with token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-railway-url/api/profile
```

### End-to-End Testing
1. Frontend running at `https://frontend-url.vercel.app`
2. Backend running at Railway URL
3. Frontend makes API calls to Railway backend
4. No CORS errors in browser console
5. Authentication flow works end-to-end

## Post-Deployment Tasks

### Day 1
- [ ] Monitor error logs in Railway
- [ ] Test health endpoint twice daily
- [ ] Verify database backups are enabled in RDS

### Week 1
- [ ] Monitor performance metrics
- [ ] Check connection pool utilization
- [ ] Verify no leaked connections
- [ ] Test failover scenarios

### Monthly
- [ ] Review slow query logs
- [ ] Update dependencies
- [ ] Audit environment variables
- [ ] Rotate JWT_SECRET (with migration plan)

## Documentation Files

New documentation created:

1. **RAILWAY_DEPLOYMENT_GUIDE.md** (Comprehensive backend deployment)
   - AWS RDS setup instructions
   - Railway configuration steps
   - Environment variable setup
   - Verification procedures
   - Troubleshooting guide

2. **RAILWAY_CONFIG_CHECKLIST.md** (Deployment checklist)
   - Pre-deployment phase checks
   - Deployment phase verification
   - Post-deployment testing
   - Monitoring setup
   - Sign-off procedures

3. **ENVIRONMENT_VARIABLES_REFERENCE.md** (Variable documentation)
   - Detailed variable definitions
   - Format requirements
   - Security best practices
   - Configuration by environment
   - Testing procedures

4. **BACKEND_DEPLOYMENT_CONFIGURATION.md** (This file)
   - Configuration changes summary
   - Environment variable explanations
   - Step-by-step deployment
   - Troubleshooting guide

## Quick Reference Commands

### Generate JWT_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Test Railway Backend
```bash
curl https://your-railway-url/health
```

### Initialize Database
```bash
curl -X POST https://your-railway-url/api/init-db
```

### View Railway Logs
```bash
railway logs -f
```

### Test Database Connection
```bash
psql postgresql://user:password@endpoint:5432/job_dashboard
```

## Summary

The backend is fully configured for Railway deployment with:
- ✅ Environment variable support for all configurations
- ✅ Database connection pooling with health checks
- ✅ CORS configuration via environment variables
- ✅ JWT authentication support
- ✅ Enhanced health endpoint for monitoring
- ✅ Comprehensive documentation

All that remains is:
1. Creating AWS RDS instance
2. Obtaining RDS connection details
3. Setting environment variables in Railway
4. Deploying backend to Railway
5. Testing endpoints
6. Deploying frontend to Vercel
7. Updating FRONTEND_URL in Railway after frontend deployment

## Support References

- [Railway Documentation](https://docs.railway.app)
- [AWS RDS PostgreSQL Setup](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Express CORS Configuration](https://expressjs.com/en/resources/middleware/cors.html)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
- [JWT.io Reference](https://jwt.io)
