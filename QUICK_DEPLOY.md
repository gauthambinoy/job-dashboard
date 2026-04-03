# Quick Deploy Guide - 30 Minutes to Production

This guide gets you deployed to Railway in 30 minutes with minimal configuration.

## The Fastest Path: Railway

Why Railway?
- Automatic database provisioning
- GitHub integration (auto-deploys on push)
- Handles environment variables easily
- Perfect for full-stack apps
- Free tier available

---

## Pre-Deployment Checklist (5 minutes)

- [ ] GitHub account (github.com)
- [ ] Repository code pushed to GitHub
- [ ] Railway account (railway.app) - sign up with GitHub
- [ ] Domain name (optional, Railway provides free domain)

---

## Step-by-Step Deployment (25 minutes)

### 1. Create Railway Project (3 minutes)

```bash
# Go to: https://railway.app/dashboard
# Click "New Project"
# Select "Deploy from GitHub repo"
# Authorize Railway to access your GitHub account
# Select "lazyscaper" repository
# Click "Deploy Now"
```

### 2. Add PostgreSQL Database (2 minutes)

In your Railway project dashboard:
```
1. Click "New Service"
2. Click "Database"
3. Select "PostgreSQL"
4. Click "Create"
5. Wait for "Connected" status (1-2 minutes)
```

**Copy your DATABASE_URL**:
- Click on PostgreSQL service
- Click "Connect" tab
- Copy the "Postgres Connection String"
- Save it (you'll need it soon)

### 3. Deploy Backend (10 minutes)

Create backend service:
```
1. Click "New Service"
2. Select "GitHub Repo"
3. Confirm "lazyscaper" is selected
4. Click "Create Service"
5. Settings → General → Set Root Directory to: backend
6. Click Save
```

Configure backend variables:
```
1. In your backend service, click "Variables"
2. Add these variables:

DATABASE_URL = [paste your PostgreSQL connection string]
API_PORT = 5000
NODE_ENV = production
JWT_SECRET = [run this to generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
FRONTEND_URL = [you'll update this after frontend deploys, use http://localhost:3000 for now]
INDEED_API_KEY = [optional, leave blank if you don't have it]
LINKEDIN_API_KEY = [optional, leave blank if you don't have it]

3. Click "Save"
```

The service will auto-deploy. Wait for green "Success" status.

**Get your backend URL**:
- In backend service, look for "Deployments" section
- Copy the URL (looks like: `https://lazyscaper-api-xxxxx.railway.app`)
- Save it for later

### 4. Deploy Frontend (10 minutes)

Create frontend service:
```
1. Click "New Service"
2. Select "GitHub Repo"
3. Confirm "lazyscaper" is selected
4. Click "Create Service"
5. Settings → General → Set Root Directory to: frontend
6. Click Save
```

Configure frontend variables:
```
1. In your frontend service, click "Variables"
2. Add this variable:

NEXT_PUBLIC_API_URL = https://[your-backend-url]/api

(Replace [your-backend-url] with the URL you saved in step 3)

3. Click "Save"
```

The service will auto-deploy. Wait for green "Success" status.

**Get your frontend URL**:
- In frontend service, look for "Deployments" section
- Copy the URL (looks like: `https://lazyscaper-web-xxxxx.railway.app`)
- This is your application!

### 5. Update Backend CORS (2 minutes)

Go back to your backend service:
```
1. Click "Variables"
2. Update FRONTEND_URL:
   FRONTEND_URL = https://[your-frontend-url]
   (Use the frontend URL from step 4)
3. Click "Save"
4. The service will auto-redeploy
5. Wait for green "Success" status
```

### 6. Open Your App! (1 minute)

```
Open in browser: https://[your-frontend-url]
```

It's live! You're done!

---

## Verification Checklist

[ ] Backend health check works:
```bash
curl https://[your-backend-url]/health
```
Should return: `{"status":"healthy","database":"connected",...}`

[ ] Frontend loads without console errors:
- Open: https://[your-frontend-url]
- Press F12 (DevTools)
- Click "Console" tab
- Refresh page
- No red errors about "CORS" or "API"

[ ] Features work:
- Dashboard loads
- Can save jobs (if applicable)
- Data persists on refresh

---

## What Just Happened?

1. **Railway** provisioned a PostgreSQL database
2. **Backend service** built and deployed (runs Node.js/Express)
3. **Frontend service** built and deployed (runs Next.js)
4. All services are connected and talking to each other
5. Your app is live on the internet with HTTPS

---

## Next: Making Changes

Every time you push to GitHub main branch:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Railway automatically redeploys both services. Takes 2-5 minutes.

---

## Custom Domain (Optional)

Add your own domain in Railway:
```
1. In Railway project → Settings
2. Click "Domains"
3. Add your domain
4. Update DNS records (Railway shows instructions)
5. Wait for SSL certificate (auto)
```

---

## Environment Variables Reference

| Variable | Where | Value |
|----------|-------|-------|
| DATABASE_URL | Backend | PostgreSQL connection string |
| API_PORT | Backend | 5000 (don't change) |
| NODE_ENV | Backend | production |
| JWT_SECRET | Backend | Generated secret key |
| FRONTEND_URL | Backend | Your frontend URL |
| NEXT_PUBLIC_API_URL | Frontend | Your backend API URL + /api |

---

## If Something Goes Wrong

**Backend won't deploy**
```
1. Check Deployments tab → click failed deployment
2. View "Build Logs" at the bottom
3. Look for red error messages
4. Common issues:
   - Missing DATABASE_URL variable
   - Root directory not set to "backend"
   - TypeScript compilation error
```

**Frontend won't load**
```
1. Check Deployments tab → click failed deployment
2. Look for build errors
3. Common issues:
   - NEXT_PUBLIC_API_URL incorrect
   - Root directory not set to "frontend"
   - Missing dependencies
```

**API not responding from frontend**
```
1. Open browser DevTools (F12)
2. Click Network tab
3. Refresh page
4. Look for failed requests to API
5. Check NEXT_PUBLIC_API_URL in frontend Variables
6. Ensure it matches your backend URL exactly
7. Must include https:// and /api
```

**Still stuck?**
- Check Railway docs: railway.app/docs
- Review full DEPLOYMENT_GUIDE.md for details
- Check backend logs: Backend service → Deployments → View Logs

---

## Rollback (Undo Last Deploy)

If something breaks:

1. In your service, click "Deployments"
2. Find the previous working version
3. Click the three dots menu
4. Select "Rollback to this deployment"
5. Service will revert to previous version

---

## Monitoring & Alerts (Optional)

In Railway project settings:
- Enable notifications for deployment failures
- Set up error alerts
- Monitor performance metrics

---

## Scaling (When You Get Lots of Users)

Railway can handle scaling:
1. Your database auto-scales (PostgreSQL)
2. Add more API instances: Backend service → Scale
3. Frontend scales automatically

---

## Success! What Now?

Your app is live. Consider:

1. **Backup**: Railway auto-backs up database
2. **Monitoring**: Watch Railway dashboard for errors
3. **Domain**: Add custom domain (optional)
4. **Development**: Keep coding, auto-deploys on git push
5. **Security**: Change JWT_SECRET in variables

---

## Cost

Railway free tier includes:
- $5/month free credit
- Perfect for this app
- Pay-as-you-go after credit runs out

---

That's it! You deployed a full-stack app in 30 minutes.

