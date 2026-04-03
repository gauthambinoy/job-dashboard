# ✅ Deployment Checklist

**Status**: Ready for deployment after local testing ✨

---

## 🔧 LOCAL VERIFICATION (Before Deployment)

### Frontend
- [ ] `cd frontend && npm install --legacy-peer-deps`
- [ ] `npm run dev` - Verify running on http://localhost:3000
- [ ] Check all pages load:
  - [ ] Home page (/)
  - [ ] Profile page (/profile)
  - [ ] Search page (/search)
  - [ ] Tracker page (/tracker)
  - [ ] Analytics page (/analytics)

### Backend
- [ ] PostgreSQL running locally (docker or native)
- [ ] Database created: `createdb job_dashboard`
- [ ] Schema loaded: `psql job_dashboard < schema.sql`
- [ ] `.env` configured with PostgreSQL URL
- [ ] `cd backend && npm install`
- [ ] `npm run dev` - Verify running on http://localhost:5000
- [ ] Test health endpoint: `curl http://localhost:5000/health`

### API Testing
- [ ] Profile endpoint: `POST /api/profile/testuser`
- [ ] Job search: `GET /api/jobs/search?domain=Backend`
- [ ] Matching: `POST /api/matching/calculate/testuser/1`
- [ ] Analytics: `GET /api/analytics/stats/testuser`

### End-to-End Flow
- [ ] Set profile on /profile page
- [ ] Search for jobs on /search page
- [ ] View job details
- [ ] Save a job
- [ ] See it in tracker
- [ ] Check analytics dashboard

---

## 🚀 DEPLOYMENT OPTIONS

### **Option 1: FASTEST - Vercel + Railway (Recommended)**

#### Frontend Deployment (5 minutes)
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts to connect GitHub and deploy
```
- Frontend deployed to: `your-app.vercel.app`

#### Backend Deployment (10 minutes)
1. Go to https://railway.app
2. Create new project → New Service
3. Select GitHub repository
4. Add environment variables (from .env)
5. Deploy

**Cost**: ~$20-30/month

---

### **Option 2: AWS Full Stack**

#### Step 1: Set Up RDS PostgreSQL (20 min)
```bash
# AWS Console → RDS → Create Database
# Engine: PostgreSQL 15
# Instance: db.t3.micro (free tier)
# Get the endpoint

# Update backend .env
DATABASE_URL=postgresql://postgres:password@{endpoint}:5432/job_dashboard

# Load schema
psql -h {endpoint} -U postgres -d job_dashboard < schema.sql
```

#### Step 2: Deploy Frontend to S3 + CloudFront (20 min)
```bash
cd frontend
npm run build

# Create S3 bucket
aws s3 mb s3://your-lazyscaper

# Upload build
aws s3 sync out/ s3://your-lazyscaper/

# Create CloudFront distribution in AWS Console
```

#### Step 3: Deploy Backend to ECS (30 min)
```bash
# Build Docker image
docker build -t lazyscaper-backend:latest backend/

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin {account}.dkr.ecr.{region}.amazonaws.com
docker tag lazyscaper-backend:latest {account}.dkr.ecr.{region}.amazonaws.com/lazyscaper-backend:latest
docker push {account}.dkr.ecr.{region}.amazonaws.com/lazyscaper-backend:latest

# Deploy via ECS or App Runner
```

**Cost**: ~$50-150/month

---

### **Option 3: Docker Compose (Development)**

```bash
# Build images
docker build -t lazyscaper-frontend:latest frontend/
docker build -t lazyscaper-backend:latest backend/

# Run with docker-compose
docker-compose up

# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

---

## 🔐 BEFORE PUBLIC DEPLOYMENT

- [ ] ⚠️ **ADD AUTHENTICATION** - Currently no login system!
  - [ ] Choose: NextAuth.js + Cognito OR Simple JWT
  - [ ] Add login/signup pages
  - [ ] Protect API endpoints with auth middleware
  - [ ] Add user isolation (users can only see their own data)

- [ ] **Add Rate Limiting**
  - [ ] `npm install express-rate-limit`
  - [ ] Apply to all API endpoints

- [ ] **Input Validation**
  - [ ] Validate all request bodies
  - [ ] Sanitize strings to prevent injection

- [ ] **HTTPS Only**
  - [ ] Deploy on HTTPS (all platforms support this)
  - [ ] Redirect HTTP to HTTPS

- [ ] **CORS Configuration**
  - [ ] Set frontend domain whitelist
  - [ ] Don't allow * origin in production

- [ ] **Environment Variables**
  - [ ] Never commit .env files
  - [ ] Use platform-specific secrets (Vercel, Railway, AWS)
  - [ ] Rotate secrets regularly

---

## 📋 DEPLOYMENT TIMELINE

| Step | Time | Status |
|------|------|--------|
| Local Verification | 15 min | ⏳ TODO |
| Option 1: Vercel+Railway | 15 min | ⏳ TODO |
| Option 2: Full AWS | 90 min | ⏳ TODO |
| Add Authentication | 2-3 hours | ⚠️ CRITICAL |
| Security Hardening | 1-2 hours | ⚠️ CRITICAL |
| **Total (Minimal)** | **30 min** | With security risks ⚠️ |
| **Total (Secure)** | **4-5 hours** | Recommended ✅ |

---

## 📊 COSTS ESTIMATE

### Option 1: Vercel + Railway
- Vercel (frontend): $20/month
- Railway (backend): $10/month
- AWS RDS (database): $30/month
- **Total**: ~$60/month

### Option 2: Full AWS
- ECS/App Runner: $20/month
- RDS PostgreSQL: $30/month
- S3 + CloudFront: $20/month
- **Total**: ~$70/month

### Free Options
- **Railway**: Free tier available
- **Vercel**: Free tier available
- **AWS**: 12-month free tier for new accounts

---

## ✅ POST-DEPLOYMENT

- [ ] Verify frontend loads correctly
- [ ] Test API endpoints from production domain
- [ ] Set up monitoring/logging
  - [ ] CloudWatch (AWS)
  - [ ] Railway logs
  - [ ] Vercel analytics
- [ ] Monitor database performance
- [ ] Set up backups (RDS handles this)
- [ ] Test application flow end-to-end
- [ ] Check response times
- [ ] Monitor error rates
- [ ] Plan for scaling if needed

---

## 🎯 RECOMMENDED DEPLOYMENT PATH

1. **For Quick Demo** (15 min)
   - Use Vercel + Railway
   - Deploy with minimal security
   - Test on production

2. **For Beta Users** (2-3 hours)
   - Add basic authentication
   - Use AWS or Vercel+Railway
   - Enable HTTPS
   - Add rate limiting

3. **For Production** (4-5 hours)
   - Full authentication system
   - All security measures
   - Monitoring/logging
   - Database backups
   - Error tracking

---

**Ready to deploy?** Choose Option 1 or 2 above and follow the steps! 🚀
