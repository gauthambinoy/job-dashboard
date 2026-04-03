# Railway Backend & Vercel Frontend Deployment Guide

## Overview

This guide covers updating the frontend to connect to a deployed backend on Railway and redeploying to Vercel.

## Prerequisites

- Frontend is already built and ready for deployment
- Backend is deployed on Railway
- Vercel account is set up
- GitHub repository is connected to Vercel

## Step 1: Get Your Railway Backend URL

1. Go to https://railway.app
2. Log in to your account
3. Open your lazyscaper backend project
4. Go to "Deployments" tab
5. Find the latest successful deployment
6. Copy the URL (should look like: `https://lazyscaper-backend-production.up.railway.app`)

## Step 2: Update Frontend Environment Variables

### Current Configuration

The frontend is already updated with a Railway backend URL pattern:

```bash
# File: /home/gautham/lazyscaper/frontend/.env.local
NEXT_PUBLIC_API_URL=https://lazyscaper-backend-production.up.railway.app/api
```

To customize with your actual Railway URL:

```bash
cd /home/gautham/lazyscaper/frontend
# Replace with your actual Railway URL
echo "NEXT_PUBLIC_API_URL=https://YOUR-ACTUAL-RAILWAY-URL.up.railway.app/api" > .env.local
```

## Step 3: Verify API Configuration

The frontend is already configured to use the `NEXT_PUBLIC_API_URL` environment variable in:
- `/frontend/lib/api.ts` - Main API module
- `/frontend/.env.local` - Environment variables

## Step 4: Test API Connectivity

### A. Use the API Status Page

1. Start the development server:
   ```bash
   cd /home/gautham/lazyscaper/frontend
   npm run dev
   ```

2. Go to http://localhost:3000/api-status

3. The page will automatically test all API endpoints

### B. Run Connectivity Tests

```bash
cd /home/gautham/lazyscaper/frontend
npm install
npx ts-node scripts/test-api-connectivity.ts
```

### C. Manual cURL Tests

```bash
# Replace with your actual Railway URL
RAILWAY_URL="https://your-railway-url.up.railway.app"

# Health check
curl -X GET "$RAILWAY_URL/health"

# Test profile endpoint
curl -X GET "$RAILWAY_URL/api/profile/test-user"

# Test job search
curl -X GET "$RAILWAY_URL/api/jobs/search?limit=5"

# Test matching endpoint
curl -X POST "$RAILWAY_URL/api/matching/analyze-jd" \
  -H "Content-Type: application/json" \
  -d '{"jdText":"Senior Backend Engineer with 5+ years experience"}'
```

## Step 5: Test End-to-End Functionality

### Profile Save

1. Navigate to http://localhost:3000/profile
2. Fill in the form with test data
3. Click "Save Profile"
4. Check that the request goes to your Railway backend
5. Verify success message appears

### Job Search

1. Navigate to http://localhost:3000/search
2. Select filters (domain, country, etc.)
3. Click "Search Jobs"
4. Verify results are returned from the backend

### Analytics

1. Navigate to http://localhost:3000/analytics
2. Verify charts and data load correctly

## Step 6: Build for Production

```bash
cd /home/gautham/lazyscaper/frontend

# Build the Next.js application
npm run build

# Test the production build locally
npm start
```

## Step 7: Deploy to Vercel

### Option A: Using Git Push (Recommended)

```bash
cd /home/gautham/lazyscaper

# Add all changes
git add .

# Commit
git commit -m "Update frontend to connect to Railway backend"

# Push to GitHub
git push origin main

# Vercel will automatically deploy
```

### Option B: Manual Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add: `NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app/api`
5. Go to Deployments tab
6. Click "Redeploy" on the latest deployment

## Step 8: Verify Production Deployment

After deployment completes:

1. Visit your Vercel deployment URL
2. Go to /api-status page
3. Verify all API tests pass
4. Test the main workflows

## Files Created/Modified

- `/frontend/.env.local` - Updated with Railway API URL
- `/frontend/lib/api.ts` - Uses NEXT_PUBLIC_API_URL (already configured)
- `/frontend/lib/api-test.ts` - NEW: API testing utility
- `/frontend/app/api-status/page.tsx` - NEW: Status check page
- `/frontend/app/profile/page.tsx` - Updated to use api module
- `/frontend/scripts/test-api-connectivity.ts` - NEW: Test script

## Troubleshooting

### API Returns 404

- Verify Railway backend is running
- Check the API URL is correct (should end with `/api`)
- Verify the backend has the required endpoints deployed

### CORS Errors

- Check backend CORS configuration
- Ensure Railway URL is whitelisted in backend CORS settings

### "Connection Refused" Errors

- Ensure Railway backend is deployed and running
- Check network connectivity to railway.app

### Environment Variable Not Loaded

- Rebuild: `npm run build`
- Verify `.env.local` exists and has correct value
- In Vercel, check Settings > Environment Variables

## Key Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://lazyscaper-backend-production.up.railway.app/api` |

