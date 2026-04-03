# Next Steps - Quick Reference Commands

## Phase 1: Database Setup

### Option A: Using Docker Compose (Recommended)
```bash
# Navigate to project root
cd /home/gautham/lazyscaper

# Start PostgreSQL with docker-compose
docker-compose up postgres

# Wait for database to be ready (check logs for "database system is ready to accept connections")
# Then in another terminal, initialize schema:
docker-compose exec postgres psql -U postgres -d job_dashboard -f schema.sql
```

### Option B: Using Docker Only
```bash
# Pull PostgreSQL image
docker pull postgres:15-alpine

# Start PostgreSQL container
docker run --name job_dashboard_db \
  -e POSTGRES_DB=job_dashboard \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15-alpine

# Initialize database
sleep 10
docker exec -i job_dashboard_db psql -U postgres -d job_dashboard < backend/schema.sql
```

### Option C: Local PostgreSQL Installation
```bash
# macOS (using Homebrew)
brew install postgresql
brew services start postgresql
createdb job_dashboard
psql -d job_dashboard -f backend/schema.sql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb job_dashboard
sudo -u postgres psql -d job_dashboard -f backend/schema.sql

# Windows
# Download from https://www.postgresql.org/download/windows/
# Use pgAdmin or command line after installation
```

---

## Phase 2: Start Development Servers

### Terminal 1: Start Backend
```bash
cd /home/gautham/lazyscaper/backend
npm run dev

# Expected output:
# [nodemon] starting `ts-node src/index.ts`
# Backend server running on port 5000
# Database connection verified
```

### Terminal 2: Start Frontend
```bash
cd /home/gautham/lazyscaper/frontend
npm run dev

# Expected output:
# - ready started server on 0.0.0.0:3000, url: http://localhost:3000
# - compiled client and server successfully
```

---

## Phase 3: Verify Connection

### Check Backend Health
```bash
# Health check
curl http://localhost:5000/health

# Expected response (with database):
# {
#   "status": "healthy",
#   "timestamp": "2026-04-01T...",
#   "database": "connected",
#   "environment": "development",
#   "api_port": 5000
# }
```

### Check Frontend API Status
```bash
# Open browser: http://localhost:3000/api-status
# Or use curl:
curl http://localhost:3000/api-status
```

---

## Phase 4: Run Integration Tests

### Run Comprehensive API Tests
```bash
# Navigate to project root
cd /home/gautham/lazyscaper

# Run API test script
bash test-api.sh

# Output will be saved to API_TEST_RESULTS.md
cat API_TEST_RESULTS.md
```

### Run Individual API Tests
```bash
# Test user profile creation
curl -X POST http://localhost:5000/api/profile/testuser \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Node.js", "React", "PostgreSQL"],
    "experienceYears": 5,
    "education": "Bachelor of Science",
    "salaryMin": 60000,
    "salaryMax": 120000,
    "targetCountries": ["Ireland", "UAE"],
    "availability": "actively_looking"
  }'

# Get user profile
curl http://localhost:5000/api/profile/testuser

# Search jobs
curl "http://localhost:5000/api/jobs/search?countries=Ireland&minSalary=50000"

# Analyze job description
curl -X POST http://localhost:5000/api/matching/analyze-jd \
  -H "Content-Type: application/json" \
  -d '{
    "jdText": "We are looking for a Senior Backend Engineer with 5+ years of experience in Node.js and PostgreSQL."
  }'

# Get analytics
curl http://localhost:5000/api/analytics/testuser/stats
```

---

## Phase 5: Manual Testing in Browser

### Test Frontend Features
```
1. Open http://localhost:3000 in browser
2. Navigate to /profile - Create user profile
3. Navigate to /search - Search for jobs
4. Navigate to /tracker - View saved jobs
5. Navigate to /analytics - View analytics dashboard
6. Navigate to /analytics/clusters - View job clusters
7. Navigate to /api-status - Check backend connectivity
```

---

## Phase 6: Production Deployment Preparation

### Build Production Versions
```bash
# Frontend production build
cd frontend
npm run build

# Backend production build
cd backend
npm run build
```

### Verify Production Builds
```bash
# Frontend (.next directory)
ls -la frontend/.next

# Backend (dist directory)
ls -la backend/dist
```

---

## Deployment Commands

### Deploy to Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend
cd frontend

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-api-domain.com/api
```

### Deploy to Railway (Backend + Database)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link project
cd backend
railway link

# Deploy
railway up

# Configure database
railway variable add DATABASE_URL <from Railway dashboard>
```

### Deploy with Docker
```bash
# Build images
docker-compose build

# Run with Docker Compose
docker-compose up

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

---

## Troubleshooting Commands

### Check If Services Are Running
```bash
# Backend
lsof -i :5000
netstat -an | grep 5000

# Frontend
lsof -i :3000
netstat -an | grep 3000

# Database
lsof -i :5432
netstat -an | grep 5432
```

### View Server Logs
```bash
# Backend logs (if still running)
# Should show in terminal where you ran npm run dev

# Check recent logs
tail -f backend/server.log 2>/dev/null || echo "No log file"

# Database logs (Docker)
docker-compose logs postgres
```

### Restart Services
```bash
# Stop all services
docker-compose down

# Restart all services
docker-compose up

# Or restart individual services
npm run dev  # Run in respective directory
```

### Database Reset (If Needed)
```bash
# WARNING: This deletes all data

# Using Docker Compose
docker-compose down -v
docker-compose up postgres
docker-compose exec postgres psql -U postgres -d job_dashboard -f backend/schema.sql

# Using direct psql
psql -U postgres -d job_dashboard -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d job_dashboard -f backend/schema.sql
```

---

## Development Utilities

### Clear Build Caches
```bash
# Frontend
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache

# Backend
rm -rf backend/dist
rm -rf backend/.tsbuildinfo

# Rebuild
cd frontend && npm run build
cd backend && npm run build
```

### Update Dependencies
```bash
# Frontend
cd frontend
npm update
npm audit fix

# Backend
cd backend
npm update
npm audit fix
```

### Check for Issues
```bash
# Frontend
cd frontend
npm run lint
npm run build  # Full type check

# Backend
cd backend
npm run build  # Full type check
```

---

## Quick Test Sequence

### Complete Test (2-3 minutes)
```bash
#!/bin/bash

echo "1. Checking backend..."
curl http://localhost:5000/health

echo -e "\n2. Creating test user..."
curl -X POST http://localhost:5000/api/profile/testuser \
  -H "Content-Type: application/json" \
  -d '{"skills": ["Node.js"], "experienceYears": 5, "targetCountries": ["Ireland"]}'

echo -e "\n3. Getting test user..."
curl http://localhost:5000/api/profile/testuser

echo -e "\n4. Checking frontend..."
curl http://localhost:3000/api-status

echo -e "\n✓ All tests completed!"
```

### Save this as `quick-test.sh` and run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

## Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (.env)
```env
# Local Development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/job_dashboard
API_PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000

# Production (example)
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/job_dashboard
API_PORT=5000
NODE_ENV=production
JWT_SECRET=<secure-random-key>
FRONTEND_URL=https://yourdomain.com
```

---

## Important Notes

### Before Going to Production
1. Change JWT_SECRET to a secure random value:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Use a real PostgreSQL database (not local)

3. Enable SSL/TLS for all connections

4. Configure secure database backups

5. Set up monitoring and alerting

6. Test all endpoints with real data

7. Review and update CORS configuration

### Database Backup
```bash
# Backup
pg_dump job_dashboard > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql job_dashboard < backup_20260401_214000.sql
```

### Scaling Considerations
- Use database connection pooling (PgBouncer)
- Implement Redis caching
- Use CDN for static assets
- Configure load balancing
- Monitor performance metrics

---

## Support Resources

### Documentation Files Generated
- `LOCAL_BUILD_TEST_REPORT.md` - Detailed build report
- `BUILD_VERIFICATION_CHECKLIST.md` - Complete verification checklist
- `COMPLETE_BUILD_SUMMARY.md` - Architecture and technical overview
- `FINAL_BUILD_STATUS.txt` - This summary
- `NEXT_STEPS_COMMANDS.md` - This reference guide

### Official Documentation
- Next.js: https://nextjs.org/docs
- Express: https://expressjs.com/
- PostgreSQL: https://www.postgresql.org/docs/
- Railway: https://docs.railway.app/
- Vercel: https://vercel.com/docs

---

## Command Quick Reference

```bash
# Build
npm run build                    # In frontend or backend directory

# Development
npm run dev                      # Start development server

# Production
npm start                        # Start production server

# Type Checking
npm run build                    # Includes TypeScript check

# Database
psql -U postgres -d job_dashboard    # Connect to database
\dt                                  # List tables
\d <table_name>                     # Show table schema

# Docker
docker-compose up                # Start all services
docker-compose down              # Stop all services
docker-compose logs -f           # View logs
docker-compose ps                # Show status
```

---

**Last Updated:** April 1, 2026
**Status:** Ready for Database Setup
**Next Step:** Execute Phase 1 commands
