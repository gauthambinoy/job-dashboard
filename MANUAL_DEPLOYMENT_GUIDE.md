# Complete Manual Deployment Guide

Deploy the LazyScaper to production across Vercel (Frontend), Railway (Backend), and AWS RDS (Database).

**Total Time: ~45 minutes**

---

## Table of Contents
1. [Vercel Frontend Deployment (5 min)](#1-vercel-frontend-deployment-5-min)
2. [Railway Backend Deployment (10 min)](#2-railway-backend-deployment-10-min)
3. [AWS RDS PostgreSQL Setup (15 min)](#3-aws-rds-postgresql-setup-15-min)
4. [Full Integration (5 min)](#4-full-integration-5-min)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Vercel Frontend Deployment (5 min)

### Prerequisites
- GitHub account with the repository pushed
- Code is in `/frontend` directory
- Node.js 18+ installed locally

### Step 1.1: Connect GitHub Repository to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub account (click "Continue with GitHub" if new)
3. Click "Add New..." → "Project"
4. Find your `lazyscaper` repository in the list
5. Click "Import"

### Step 1.2: Configure Environment Variables

Before deploying, set the backend API URL:

1. On the "Configure Project" screen, skip to "Environment Variables"
2. Add this variable:
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-railway-backend-url/api`
   - (You'll update this after Railway deployment in Step 4)

3. For now, use a placeholder or your Railway test URL if available
4. Click "Deploy"

### Step 1.3: Monitor Deployment

1. Wait for the build to complete (usually 1-2 minutes)
2. You'll see a "Visit" button when deployment succeeds
3. Click the URL to open your frontend (should show the dashboard)

### Step 1.4: Verify Frontend Works

1. Open your Vercel deployment URL
2. You should see the LazyScaper interface
3. All UI elements should load without errors
4. Check browser console (F12) for any errors

### Frontend Deployment URL Format
Your frontend will be at: `https://<project-name>.vercel.app`

**Note:** The API won't work yet - that's fixed in Step 4.

---

## 2. Railway Backend Deployment (10 min)

### Prerequisites
- Railway.app account (free tier available)
- Backend code in `/backend` directory
- GitHub repository connected to Railway

### Step 2.1: Create Railway Project

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "Create New Project"
4. Select "Deploy from GitHub repo"
5. Authorize Railway to access your GitHub account
6. Select your `lazyscaper` repository
7. Select the `backend` directory as the root directory

### Step 2.2: Configure Environment Variables in Railway

Once the project is created:

1. Click on the service (it should auto-detect Node.js)
2. Go to "Variables" tab
3. Add these environment variables:

```
API_PORT=5000
NODE_ENV=production
JWT_SECRET=<generate-with-command-below>
FRONTEND_URL=https://<your-vercel-url>.vercel.app
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/job_dashboard
INDEED_API_KEY=your_key_here
LINKEDIN_API_KEY=your_key_here
```

### Step 2.3: Generate JWT Secret

Before adding to Railway, generate a secure JWT secret:

**On your local machine, run:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` in Railway variables.

### Step 2.4: Deploy Backend

1. In Railway, the deployment should start automatically
2. Watch the "Build Logs" tab for success
3. Once deployed, you'll see a URL like: `<project-name>.up.railway.app`
4. Copy your Railway URL - you'll need it for Step 4

**Example Railway URL:** `https://lazyscaper-backend-production.up.railway.app`

### Step 2.5: Verify Backend Responds

**Before moving to Step 3, test the backend:**

1. Open this URL in your browser (replace with your actual Railway URL):
   ```
   https://your-railway-url/health
   ```

2. You should see JSON response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-04-01T...",
     "database": "connected",
     "environment": "production",
     "api_port": 5000
   }
   ```

3. If database shows "disconnected", it's normal - we haven't set up RDS yet

**Note about DATABASE_URL:** Set a placeholder for now (any valid PostgreSQL connection string). We'll update it after RDS setup.

---

## 3. AWS RDS PostgreSQL Setup (15 min)

### Prerequisites
- AWS account with billing enabled
- Basic understanding of AWS Console
- Your local psql or a PostgreSQL client installed

### Step 3.1: Create RDS Instance in AWS Console

1. Go to https://console.aws.amazon.com
2. Sign in to your AWS account
3. Search for "RDS" in the search bar
4. Click "RDS" from the services list
5. Click "Create database"

### Step 3.2: Select PostgreSQL Engine

1. Choose "Standard create" (not Easy create)
2. Under "Engine options", select:
   - **Engine:** PostgreSQL
   - **Version:** 15.x (or latest 16.x)
3. **Edition:** PostgreSQL
4. Click "Next"

### Step 3.3: Configure DB Instance

1. Under "DB instance class":
   - Select: `db.t3.micro` (free tier eligible, if you have free tier)
   - Or `db.t4g.micro` (usually cheapest)

2. Under "Storage":
   - **Allocated storage:** 20 GB
   - **Storage type:** gp3
   - Uncheck "Enable storage autoscaling" (to control costs)

3. Under "Connectivity":
   - **Public accessibility:** YES (for now - we'll secure it later)
   - **VPC:** default-vpc
   - **DB subnet group:** default
   - **Security group:** Create new
   - **Name:** `lazyscaper-db-sg`

4. Under "Database authentication":
   - Uncheck "Enable IAM database authentication" (keep disabled for simplicity)

5. Under "Initial database configuration":
   - **DB name:** `job_dashboard` (important - use this exact name)
   - **Master username:** `postgres`
   - **Master password:** Create a strong password (save it!)
   - **Confirm password:** Repeat the password

6. Click "Create database"

### Step 3.4: Wait for Database to Be Created

1. This takes 5-10 minutes
2. You'll see a spinning icon next to your database
3. When status shows "Available", proceed to Step 3.5

### Step 3.5: Get Your RDS Connection String

1. In RDS Dashboard, click on your database instance
2. Scroll to "Connectivity & security" section
3. Copy the **Endpoint** value (looks like: `lazyscaper.xxxxxx.us-east-1.rds.amazonaws.com`)
4. Note the **Port** (default: 5432)

Your connection string will be:
```
postgresql://postgres:YOUR_PASSWORD@your-endpoint:5432/job_dashboard
```

Example:
```
postgresql://postgres:MySecurePass123@lazyscaper.c9akciq32.us-east-1.rds.amazonaws.com:5432/job_dashboard
```

### Step 3.6: Configure Security Group (Allow Connections)

1. In RDS, go to your database instance
2. Under "Security group rules", click the security group name
3. Click "Edit inbound rules"
4. Click "Add rule"
5. Configure:
   - **Type:** PostgreSQL
   - **Protocol:** TCP
   - **Port:** 5432
   - **Source:** 0.0.0.0/0 (allow from anywhere - use more restrictive in production)
6. Click "Save rules"

**Wait 1-2 minutes for security group changes to take effect.**

### Step 3.7: Create Database Schema

You need to load the schema into your RDS database.

**Option A: Using psql (Recommended)**

```bash
# Replace values with your own
psql -h lazyscaper.xxxxx.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d job_dashboard \
     -f /path/to/backend/schema.sql
```

When prompted, enter your RDS master password.

**Option B: Using pgAdmin (Web Interface)**

1. Go to https://www.pgadmin.org/download/
2. Download and install pgAdmin
3. Open pgAdmin in your browser
4. Add new server:
   - **Name:** lazyscaper
   - **Host:** your RDS endpoint
   - **Port:** 5432
   - **Username:** postgres
   - **Password:** your RDS password
5. Connect and navigate to your database
6. Open "Query Tool"
7. Copy content from `/backend/schema.sql`
8. Paste into Query Tool and execute

### Step 3.8: Verify Database Connection

Run this command to test the connection:

```bash
psql -h your-rds-endpoint \
     -U postgres \
     -d job_dashboard \
     -c "SELECT 1 as connection_test;"
```

You should see:
```
 connection_test
-----------------
               1
(1 row)
```

---

## 4. Full Integration (5 min)

### Step 4.1: Update Backend with Database URL

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. Find `DATABASE_URL`
5. Update it with your actual RDS connection string:
   ```
   postgresql://postgres:YOUR_PASSWORD@your-rds-endpoint:5432/job_dashboard
   ```

6. Click "Save"
7. Railway will redeploy automatically
8. Wait for the build to complete (green checkmark)

### Step 4.2: Verify Backend Connects to Database

Test your backend health endpoint again:

```bash
curl https://your-railway-url/health
```

You should now see:
```json
{
  "status": "healthy",
  "database": "connected",
  ...
}
```

If database is still disconnected, check:
- Database URL is correctly formatted
- RDS security group allows inbound traffic on port 5432
- RDS instance is in "Available" status
- Connection string username/password are correct

### Step 4.3: Update Frontend with Correct API URL

1. Go to your Vercel project
2. Go to "Settings" → "Environment Variables"
3. Find `NEXT_PUBLIC_API_URL`
4. Update the value to your Railway URL:
   ```
   https://your-railway-url/api
   ```

5. Click "Save"
6. Go to "Deployments" tab
7. Click the three dots on the latest deployment
8. Select "Redeploy"
9. Wait for redeployment (1-2 minutes)

### Step 4.4: End-to-End Test

1. Open your Vercel frontend URL
2. Test these features:
   - Dashboard loads without errors
   - Any API calls work (check browser console for errors)
   - If you can, try to save/fetch data from the database

**Check browser console (F12) for any API errors.**

If you see errors like "CORS" or "Cannot connect to API", it means:
- The FRONTEND_URL in Railway doesn't match your Vercel URL
- The NEXT_PUBLIC_API_URL in Vercel doesn't match your Railway URL

---

## 5. Troubleshooting

### Frontend Issues

#### Problem: "Failed to fetch from API" or CORS errors
**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly
2. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
3. Redeploy both Vercel and Railway after updating URLs

#### Problem: Blank page or 404
**Solution:**
1. Check Vercel build logs for errors
2. Verify `next.config.ts` is present in `/frontend`
3. Redeploy the project

#### Problem: Styles not loading (unstyled page)
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh the page (Ctrl+Shift+R)
3. Check Vercel build logs for CSS errors

### Backend Issues

#### Problem: `Database connection failed`
**Check in this order:**
1. Is RDS instance in "Available" status?
   - Go to AWS RDS Dashboard
   - Check instance status

2. Is DATABASE_URL correct?
   - Format: `postgresql://username:password@endpoint:5432/database`
   - No spaces around colons
   - Password special characters properly escaped

3. Can you connect locally?
   ```bash
   psql -h your-rds-endpoint -U postgres -d job_dashboard
   ```

4. Is security group allowing port 5432?
   - Go to RDS → Security groups
   - Check inbound rules for PostgreSQL (port 5432)
   - Source should be 0.0.0.0/0 or your IP

5. Did you wait 1-2 minutes after creating security group rules?
   - AWS takes time to apply security group changes

#### Problem: "JWT_SECRET not set" error
**Solution:**
1. Generate new JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Go to Railway → Variables
3. Update JWT_SECRET with the generated value
4. Redeploy

#### Problem: Health check fails but no database error
**Solution:**
1. Check Railway build logs:
   - Go to Railway Dashboard
   - Click your service
   - Check "Build Logs" tab for compile errors

2. Verify all environment variables are set:
   - Go to Variables tab
   - Make sure all required vars exist

3. Check logs for missing dependencies:
   ```bash
   npm install  # Run locally to check
   npm run build
   ```

### Database Issues

#### Problem: "Database already exists" error during schema load
**Solution:**
```bash
# Just skip it - the tables probably exist already
# Or drop and recreate:
psql -h endpoint -U postgres -c "DROP DATABASE job_dashboard;"
psql -h endpoint -U postgres -c "CREATE DATABASE job_dashboard;"
psql -h endpoint -U postgres -d job_dashboard -f schema.sql
```

#### Problem: Cannot connect to RDS from local machine
**Solution:**
1. Verify RDS public accessibility is "Yes"
2. Verify security group allows your IP or 0.0.0.0/0
3. Test with psql:
   ```bash
   psql -h endpoint -U postgres
   ```
4. Check AWS Console for any pending reboots

#### Problem: Tables don't exist after loading schema
**Solution:**
1. Verify schema.sql was loaded without errors:
   ```bash
   psql -h endpoint -U postgres -d job_dashboard \
        -c "\dt"  # List all tables
   ```

2. If no tables, reload schema:
   ```bash
   psql -h endpoint -U postgres -d job_dashboard \
        -f /path/to/backend/schema.sql
   ```

### Common Errors Summary

| Error | Cause | Fix |
|-------|-------|-----|
| CORS error in browser | Frontend URL not in backend CORS config | Update FRONTEND_URL in Railway |
| 503 Service Unavailable | Backend not responding | Check Railway build logs |
| Cannot reach API | NEXT_PUBLIC_API_URL wrong | Update Vercel env vars |
| Database connection failed | Invalid DATABASE_URL | Check RDS endpoint and credentials |
| Blank page on frontend | Build failed | Check Vercel build logs |
| Styles broken (unstyled) | Cache issue | Hard refresh (Ctrl+Shift+R) |

---

## Quick Reference Checklist

### Before You Start
- [ ] GitHub account and repository pushed
- [ ] Vercel account created
- [ ] Railway account created
- [ ] AWS account with billing enabled
- [ ] Local psql or pgAdmin installed

### After Vercel Deployment
- [ ] Frontend URL: `https://<project>.vercel.app`
- [ ] Dashboard loads in browser
- [ ] NEXT_PUBLIC_API_URL set to placeholder

### After Railway Deployment
- [ ] Backend URL: `https://<project>.up.railway.app`
- [ ] Health endpoint responds (eventually shows "database": "disconnected")
- [ ] All environment variables set

### After AWS RDS Setup
- [ ] RDS instance status: "Available"
- [ ] Database name: `job_dashboard`
- [ ] Schema loaded successfully
- [ ] Can connect with psql

### After Integration
- [ ] DATABASE_URL updated in Railway
- [ ] NEXT_PUBLIC_API_URL updated in Vercel
- [ ] Backend health shows "database": "connected"
- [ ] Frontend loads and API calls work

---

## Security Notes for Production

1. **RDS Database:**
   - Change security group from 0.0.0.0/0 to specific IPs (Railway static IP, your office IP)
   - Store password in secure vault (AWS Secrets Manager)
   - Enable automated backups (default is 7 days)
   - Enable encryption at rest

2. **Backend Environment Variables:**
   - Use Railway's encrypted variables
   - Never commit `.env` files to GitHub
   - Rotate JWT_SECRET periodically

3. **Frontend:**
   - Use HTTPS (Vercel provides this automatically)
   - Never expose sensitive keys in frontend code
   - Use NEXT_PUBLIC_ prefix only for non-sensitive vars

4. **API Keys:**
   - Replace INDEED_API_KEY and LINKEDIN_API_KEY with real keys
   - Rotate keys periodically
   - Consider using AWS Secrets Manager for key rotation

---

## Support & Next Steps

If you encounter issues not listed in troubleshooting:

1. **Check Logs:**
   - Vercel: Settings → Function Logs
   - Railway: Build Logs and Deployment Logs
   - AWS: CloudWatch Logs (if applicable)

2. **Test Components Individually:**
   - Test frontend: Open Vercel URL
   - Test backend: Curl health endpoint
   - Test database: Connect with psql

3. **Common Success Indicators:**
   - Vercel deployment shows "Ready"
   - Railway shows green checkmark on deployment
   - RDS shows "Available" status
   - `curl https://your-railway-url/health` returns valid JSON

---

**Created:** April 1, 2026
**Updated:** April 1, 2026
**Version:** 1.0 (Final)
