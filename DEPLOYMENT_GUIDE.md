# LazyScaper - Comprehensive Deployment Guide

This guide provides step-by-step instructions to deploy the LazyScaper application to multiple platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Docker Setup for Local Testing](#docker-setup-for-local-testing)
4. [Manual Deployment to Railway](#manual-deployment-to-railway)
5. [Manual Deployment to Vercel](#manual-deployment-to-vercel)
6. [Manual Deployment to AWS](#manual-deployment-to-aws)
7. [Verification Steps](#verification-steps)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Git**: Version 2.0 or higher
- **Docker**: Version 20.10+ (for local testing)
- **Docker Compose**: Version 1.29+ (for local testing)
- **Node.js**: Version 18+ (for development/testing)
- **PostgreSQL**: Version 15+ (for local/production databases)

### Required Accounts

- GitHub account (repository hosting)
- Railway account (www.railway.app)
- Vercel account (vercel.com)
- AWS account with appropriate permissions

### Repository Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd lazyscaper

# Verify repository structure
ls -la
# Should show: backend/, frontend/, docker-compose.yml, backend/Dockerfile, frontend/Dockerfile
```

---

## Environment Variables

### Backend Environment Variables

Create or update `/backend/.env`:

```env
# Database Configuration
# Local: postgresql://postgres:postgres@localhost:5432/job_dashboard
# Production: postgresql://user:password@rds-endpoint.amazonaws.com:5432/job_dashboard
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_dashboard

# Server Configuration
API_PORT=5000
NODE_ENV=production

# JWT Configuration - MUST change for production
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-generate-new-one

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# External APIs (optional)
INDEED_API_KEY=your_indeed_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
```

### Frontend Environment Variables

Create `/frontend/.env.local`:

```env
# API endpoint - must match backend deployment URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Production Environment Variables

For Railway/Vercel/AWS, set these in your deployment platform:

**Backend (API Service)**
```
DATABASE_URL=postgresql://user:password@host:5432/database
API_PORT=5000
NODE_ENV=production
JWT_SECRET=<generated-secret-key>
FRONTEND_URL=https://your-frontend-url.vercel.app
INDEED_API_KEY=<your-key>
LINKEDIN_API_KEY=<your-key>
```

**Frontend (Web Service)**
```
NEXT_PUBLIC_API_URL=https://your-api-url/api
NODE_ENV=production
```

---

## Docker Setup for Local Testing

### 1. Build Docker Images Locally

```bash
# Navigate to project root
cd /path/to/lazyscaper

# Create environment file for Docker Compose
cat > .env.docker << EOF
# Database
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=job_dashboard
DB_PORT=5432

# Backend
API_PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000/api
FRONTEND_PORT=3000
EOF

# Build and start services
docker-compose --env-file .env.docker up -d

# Check status
docker-compose ps
```

### 2. Initialize Database

```bash
# Check if database is healthy
docker-compose ps postgres

# The schema should auto-initialize from backend/schema.sql

# Verify database connection
docker-compose exec backend npm start
```

### 3. Verify Services

```bash
# Backend health check
curl http://localhost:5000/health

# Frontend accessibility
curl http://localhost:3000

# Or open in browser:
# Frontend: http://localhost:3000
# API: http://localhost:5000/api
```

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v
```

---

## Manual Deployment to Railway

Railway (www.railway.app) is a simple PaaS platform ideal for full-stack applications.

### Step 1: Create Railway Account and Login

```bash
# Visit https://railway.app and sign up with GitHub
# Authorize Railway to access your GitHub repositories
```

### Step 2: Create New Project

1. Click "New Project" button on Railway dashboard
2. Select "Deploy from GitHub repo"
3. Select your `lazyscaper` repository
4. Click "Deploy Now"

### Step 3: Configure Backend Service

#### Create PostgreSQL Service

1. In your Railway project, click "New Service"
2. Search for "PostgreSQL"
3. Click "Provision PostgreSQL"
4. Database will be created automatically
5. Note the DATABASE_URL (click on PostgreSQL service to view)

#### Deploy Backend

1. Click "New Service" → "GitHub Repo"
2. Select the `lazyscaper` repository
3. Configure build settings:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. Set Environment Variables (in Settings tab):
   ```
   DATABASE_URL=<copy from PostgreSQL service>
   API_PORT=5000
   NODE_ENV=production
   JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   FRONTEND_URL=https://<your-frontend-domain>
   INDEED_API_KEY=<optional>
   LINKEDIN_API_KEY=<optional>
   ```

5. Click "Deploy"
6. Wait for deployment to complete (watch build logs)
7. Note the Backend URL from the "Environment" tab

#### Configure Start Command

1. Go to Backend service Settings
2. Under "Build" section:
   - Build Command: `npm run build`
   - Start Command: `node dist/index.js`

3. Save and trigger redeploy

### Step 4: Deploy Frontend

1. Click "New Service" → "GitHub Repo"
2. Select the `lazyscaper` repository
3. Configure build settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

4. Set Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-api-url>/api
   NODE_ENV=production
   ```

5. Click "Deploy"
6. Wait for deployment to complete

### Step 5: Update Backend CORS

Once Frontend is deployed, update Backend environment variable:

```
FRONTEND_URL=https://<your-frontend-url>
```

Go to Backend service → Settings → Environment → Update FRONTEND_URL → Redeploy

### Step 6: Verify Deployment

```bash
# Test backend health
curl https://<your-backend-url>/health

# Test frontend (open in browser)
https://<your-frontend-url>

# Test API connectivity (check browser console for no CORS errors)
```

---

## Manual Deployment to Vercel

Vercel is the recommended platform for Next.js frontend. Backend can be deployed separately or using Vercel Functions.

### Step 1: Deploy Frontend to Vercel

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link existing project? No
# - Scope: Your account
# - Project name: lazyscaper-frontend
# - Framework preset: Next.js
# - Root directory: ./
# - Build command: npm run build
# - Output directory: .next
```

#### Via Vercel Web Dashboard

1. Visit https://vercel.com/dashboard
2. Click "New Project"
3. Search for and import `lazyscaper` repository
4. Select "frontend" as root directory
5. Framework: Next.js (auto-detected)
6. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-api-url>/api
   ```
7. Click "Deploy"

### Step 2: Deploy Backend

#### Option A: Using Railway for Backend (Recommended)

Follow the Railway deployment steps in the previous section for backend only.

Update Frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://<railway-backend-url>/api
```

#### Option B: Using Vercel Functions

```bash
# Navigate to project root
cd /path/to/lazyscaper

# Create API route structure
mkdir -p api/backend

# Create vercel.json for API configuration
cat > vercel.json << EOF
{
  "buildCommand": "cd backend && npm run build",
  "outputDirectory": "backend/dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
EOF

# Push to repository
git add vercel.json
git commit -m "Add Vercel configuration"
git push
```

Deployment will trigger automatically on push.

### Step 3: Set Environment Variables in Vercel

1. Go to Vercel Dashboard → Project Settings
2. Click "Environment Variables"
3. Add:
   ```
   NEXT_PUBLIC_API_URL=https://<your-api-url>/api
   ```
4. Re-deploy project (Redeploy button or push to main branch)

### Step 4: Verify Deployment

```bash
# Test frontend
https://<your-project>.vercel.app

# Check browser console for CORS errors
# Verify API connectivity working correctly
```

---

## Manual Deployment to AWS

### Step 1: Create RDS PostgreSQL Database

1. Login to AWS Management Console
2. Navigate to RDS (Relational Database Service)
3. Click "Create database"
4. Configure:
   - Engine: PostgreSQL 15
   - Template: Free tier (if applicable)
   - DB instance identifier: `lazyscaper-db`
   - Master username: `postgres`
   - Master password: Generate secure password
   - DB instance class: db.t3.micro (free tier)
   - Storage: 20 GB (free tier)
   - Publicly accessible: Yes (for initial setup, restrict later)

5. Click "Create database"
6. Wait for database to be available (5-10 minutes)
7. Click database instance → Copy Endpoint (example: `lazyscaper-db.xxxxx.amazonaws.com`)
8. Note the connection string:
   ```
   postgresql://postgres:<password>@<endpoint>:5432/job_dashboard
   ```

### Step 2: Create Security Group

1. Go to VPC → Security Groups
2. Click "Create security group"
3. Configure:
   - Name: `lazyscaper-sg`
   - Description: Security group for LazyScaper
   - VPC: Default VPC

4. Add Inbound rules:
   ```
   Type: PostgreSQL
   Protocol: TCP
   Port: 5432
   Source: 0.0.0.0/0 (restrict in production)
   ```

5. Click "Create"
6. Attach to RDS instance

### Step 3: Initialize Database

```bash
# From your local machine (with psql installed)
psql postgresql://postgres:<password>@<rds-endpoint>:5432/job_dashboard < backend/schema.sql

# Or use AWS CLI
aws rds-db-auth-token-generator --hostname <rds-endpoint> --port 5432 --region us-east-1 --username postgres
```

### Step 4: Deploy Backend to EC2

#### Create EC2 Instance

1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Configure:
   - Name: `lazyscaper-api`
   - AMI: Ubuntu 22.04 LTS (free tier)
   - Instance type: t2.micro (free tier)
   - Key pair: Create new or select existing
   - Security group: Select `lazyscaper-sg`
   - Storage: 20 GB (free tier)

4. Click "Launch Instance"
5. Wait for instance to be running

#### Connect and Deploy Backend

```bash
# SSH into instance
ssh -i /path/to/key.pem ubuntu@<instance-public-ip>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Clone repository
git clone <your-repo-url>
cd lazyscaper/backend

# Install dependencies
npm install

# Create environment file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:<password>@<rds-endpoint>:5432/job_dashboard
API_PORT=5000
NODE_ENV=production
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
FRONTEND_URL=https://<your-frontend-url>
EOF

# Build application
npm run build

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start dist/index.js --name "lazyscaper-api"
pm2 save
sudo pm2 startup

# Verify running
pm2 status
curl localhost:5000/health
```

### Step 5: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/lazyscaper << EOF
server {
    listen 80;
    server_name <your-domain>;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/lazyscaper /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d <your-domain>
```

### Step 6: Deploy Frontend to CloudFront + S3

1. Go to S3 Dashboard
2. Click "Create bucket"
3. Configure:
   - Bucket name: `lazyscaper-frontend`
   - Block all public access: Uncheck (for CloudFront)

4. Upload built frontend:
   ```bash
   # From local machine
   cd frontend
   npm run build
   aws s3 sync out/ s3://lazyscaper-frontend --delete
   ```

5. Create CloudFront Distribution:
   - Go to CloudFront Dashboard
   - Click "Create distribution"
   - Origin: S3 bucket
   - Default Root Object: `index.html`
   - Cache policy: Managed-CachingOptimized

6. Update Frontend environment:
   ```
   NEXT_PUBLIC_API_URL=https://<your-backend-domain>/api
   ```

### Step 7: Verify AWS Deployment

```bash
# Backend health
curl https://<your-backend-domain>/health

# Frontend access (via CloudFront)
https://<cloudfront-domain>

# Check logs
aws logs tail /aws/ec2/lazyscaper-api --follow
```

---

## Verification Steps

### Backend Verification

```bash
# 1. Health check endpoint
curl -X GET https://<api-url>/health
# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "database": "connected",
#   "environment": "production",
#   "api_port": 5000
# }

# 2. Test database connection
# Check logs for "Database connection established"

# 3. CORS validation
curl -X OPTIONS https://<api-url>/health \
  -H "Origin: https://<frontend-url>" \
  -H "Access-Control-Request-Method: GET" \
  -v
# Expected: Access-Control-Allow-Origin header present
```

### Frontend Verification

```bash
# 1. Page loads without errors
curl https://<frontend-url>

# 2. Check network requests in browser
# - All API calls should go to correct backend URL
# - No CORS errors in console
# - No 404 errors on static assets

# 3. Verify environment variables
# Open DevTools → Console
# Type: window.__NEXT_PUBLIC_API_URL
# Should show correct API endpoint
```

### Full Stack Verification

1. **Navigate to Frontend**: https://your-domain
2. **Check Console**: F12 → Console tab
   - No CORS errors
   - No 404 errors
3. **Test Features**:
   - Load lazyscaper (should fetch from API)
   - Save a job (should call API without errors)
   - User authentication (if applicable)
4. **Database**: Check data is persisting across page reloads

---

## Troubleshooting

### Docker Issues

**Problem**: Container won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild images
docker-compose build --no-cache

# Remove and restart
docker-compose down -v
docker-compose up -d
```

**Problem**: Database connection failed
```bash
# Verify database is healthy
docker-compose ps postgres

# Check credentials in .env file
# Ensure DATABASE_URL format is correct

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

### Railway Deployment Issues

**Problem**: Build fails
- Check build logs in Railway dashboard
- Verify correct root directory is set
- Check for missing dependencies in package.json

**Problem**: Environment variables not loading
- Go to Service Settings → Environment
- Verify all variables are present
- Click "Redeploy" after updating variables

**Problem**: Database connection error
- Verify DATABASE_URL is copied correctly
- Check PostgreSQL service is running
- Test connection locally before deploying

### Vercel Deployment Issues

**Problem**: API connection fails from frontend
- Verify NEXT_PUBLIC_API_URL in Vercel project settings
- Check backend is deployed and running
- Verify CORS headers in backend

**Problem**: Build fails with missing dependencies
- Check package.json includes all dependencies
- Verify build command is correct: `npm run build`
- Clear Vercel cache: Project Settings → Git → Clear Cache

### AWS Deployment Issues

**Problem**: Can't connect to RDS
- Verify RDS security group allows inbound connections
- Check RDS endpoint format is correct
- Verify credentials in DATABASE_URL

**Problem**: API not accessible
- Check EC2 security group allows port 80/443
- Verify Nginx is running: `sudo systemctl status nginx`
- Check PM2 process is running: `pm2 status`

**Problem**: Frontend static files return 404
- Verify S3 bucket exists and contains files
- Check S3 bucket public access settings
- Verify CloudFront distribution is enabled

### Common Issues

**CORS Errors**
- Backend FRONTEND_URL must match frontend domain exactly
- Include protocol (http/https) and no trailing slash
- Redeploy backend after updating FRONTEND_URL

**Database Errors**
- Verify DATABASE_URL is valid
- Check database user has sufficient permissions
- Ensure schema.sql was executed

**Port Already in Use (Local)**
```bash
# Kill process using port
lsof -ti:5000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

---

## Security Best Practices

1. **JWT_SECRET**: Generate unique secret for production
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Environment Variables**: Never commit .env files
   - Use deployment platform's environment variable settings
   - Add .env to .gitignore

3. **Database Access**: 
   - Restrict RDS security group in production
   - Use strong passwords (20+ characters)
   - Enable encryption at rest and in transit

4. **SSL/TLS**: Always use HTTPS in production
   - Use Let's Encrypt for free certificates
   - Redirect HTTP to HTTPS

5. **Monitoring**: Enable logs and monitoring
   - CloudWatch (AWS)
   - Railway logs
   - Vercel Analytics

---

## Next Steps

1. Choose your deployment platform (Railway recommended for simplicity)
2. Set up accounts and repositories
3. Follow step-by-step guide for chosen platform
4. Test thoroughly before moving to production
5. Set up monitoring and backups
6. Document your deployment process

For additional help:
- Check service documentation (railway.app, vercel.com, aws.amazon.com)
- Review application logs for error messages
- Consult the troubleshooting section above

