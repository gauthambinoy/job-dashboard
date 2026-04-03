# Test Execution Guide

## Overview

This document provides step-by-step instructions for executing API tests and verifying the backend functionality.

---

## Prerequisites

1. **Node.js**: v14 or higher
2. **PostgreSQL**: Running and accessible
3. **Backend**: Source code available
4. **Network**: localhost:5000 must be accessible

---

## Pre-Test Checklist

- [ ] PostgreSQL is running
- [ ] Database credentials configured
- [ ] Backend dependencies installed (`npm install`)
- [ ] Environment variables configured (.env)
- [ ] Port 5000 is available

---

## Step 1: Start PostgreSQL

### Linux/Mac
```bash
# Using PostgreSQL service
sudo systemctl start postgresql
# or
brew services start postgresql
```

### Verify Connection
```bash
psql -U postgres -c "SELECT 1"
```

---

## Step 2: Prepare Backend

### Navigate to Backend Directory
```bash
cd /home/gautham/lazyscaper/backend
```

### Install Dependencies (if needed)
```bash
npm install
```

### Check Environment Variables
```bash
cat .env
# Should contain: DATABASE_URL=postgresql://...
```

### Update .env if Needed
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_dashboard
API_PORT=5000
NODE_ENV=development
EOF
```

---

## Step 3: Start Backend Server

### Method 1: Direct Start
```bash
cd /home/gautham/lazyscaper/backend
npm start
```

### Method 2: Development Mode
```bash
npm run dev
```

### Expected Output
```
Backend server running on port 5000
```

### Verify Server is Running
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status":"ok","timestamp":"..."}
```

---

## Step 4: Run Tests

### Method 1: Node.js Test Script (Recommended)

From the project root directory:

```bash
cd /home/gautham/lazyscaper
node test-api.js
```

This will:
- Test all endpoints sequentially
- Capture request/response data
- Generate `API_TEST_RESULTS.md`
- Display pass/fail summary

### Method 2: Bash Script

```bash
cd /home/gautham/lazyscaper
bash test-api.sh
```

Similar to Method 1 but using shell script.

### Method 3: Manual Testing with cURL

Test endpoints one-by-one using cURL commands from `QUICK_API_TEST.md`.

---

## Step 5: Review Results

### Check Results File
```bash
cat /home/gautham/lazyscaper/API_TEST_RESULTS.md
```

### Look for:
- All endpoints listed
- HTTP 2xx status codes for successful tests
- Clear pass/fail indicators
- Timestamp of test execution

### Sample Success Output
```
## Health Check
**Endpoint:** `GET /health`
**HTTP Status:** 200
**Response:**
```json
{"status":"ok","timestamp":"2026-04-01T12:00:00.000Z"}
```
✓ PASSED (HTTP 200)
```

---

## Common Issues & Solutions

### Issue: Backend Won't Start

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Restart backend
npm start
```

### Issue: Database Connection Failed

**Error:** `ECONNREFUSED: Connection refused`

**Solution:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Test connection
psql -U postgres -c "SELECT 1"
```

### Issue: Database Not Found

**Error:** `database "job_dashboard" does not exist`

**Solution:**
```bash
# Create database
createdb -U postgres job_dashboard

# Initialize database via API
curl -X POST http://localhost:5000/api/init-db
```

### Issue: Tests Fail with 404 Errors

**Cause:** No test data in database

**Solution:**
```bash
# 1. Initialize database
curl -X POST http://localhost:5000/api/init-db

# 2. Create test profile
curl -X POST http://localhost:5000/api/profile/testuser123 \
  -H "Content-Type: application/json" \
  -d '{"skills":["Python"],"experience_years":2,"education":"BS CS","salary_min":55000,"salary_max":80000,"target_countries":["Ireland"],"availability":"actively_looking"}'

# 3. Re-run tests
node test-api.js
```

---

## Test Scenarios

### Scenario 1: Basic Connectivity
**Goal:** Verify backend is accessible

```bash
# Test 1: Health check
curl http://localhost:5000/health

# Expected: HTTP 200 with status "ok"
```

### Scenario 2: User Profile Management
**Goal:** Test profile creation and retrieval

```bash
# Test 1: Create profile
curl -X POST http://localhost:5000/api/profile/testuser123 \
  -H "Content-Type: application/json" \
  -d '{"skills":["Python"],"experience_years":2,"education":"BS CS","salary_min":55000,"salary_max":80000,"target_countries":["Ireland"],"availability":"actively_looking"}'

# Expected: HTTP 200 with profile data

# Test 2: Get profile
curl http://localhost:5000/api/profile/testuser123

# Expected: HTTP 200 with same profile data
```

### Scenario 3: Job Operations
**Goal:** Test job search and saved jobs

```bash
# Test 1: Search jobs
curl "http://localhost:5000/api/jobs/search?countries=Ireland"

# Expected: HTTP 200 with jobs array (may be empty)

# Test 2: Save job (requires job ID)
curl -X POST http://localhost:5000/api/jobs/1/save \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser123","status":"interested"}'

# Expected: HTTP 201 with saved job data

# Test 3: Get saved jobs
curl http://localhost:5000/api/jobs/saved/testuser123

# Expected: HTTP 200 with saved jobs array
```

### Scenario 4: Analytics
**Goal:** Test analytics endpoints

```bash
# Test 1: Get stats
curl http://localhost:5000/api/analytics/testuser123/stats

# Expected: HTTP 200 with stats data

# Test 2: Get match distribution
curl http://localhost:5000/api/analytics/testuser123/match-distribution

# Expected: HTTP 200 with distribution data
```

---

## Performance Testing

### Load Test with Apache Bench (ab)

Install Apache Bench:
```bash
# Linux
sudo apt-get install apache2-utils

# Mac
brew install httpd
```

Test single endpoint:
```bash
ab -n 100 -c 10 http://localhost:5000/health
```

Parameters:
- `-n 100`: Total requests
- `-c 10`: Concurrent requests

---

## Continuous Testing

### Auto-run Tests on File Change

Install `nodemon`:
```bash
npm install -g nodemon
```

Create test watcher:
```bash
nodemon -w test-api.js -e js --exec "node test-api.js"
```

---

## Test Report Documentation

The test script automatically generates `API_TEST_RESULTS.md` containing:

1. Test timestamp
2. Each endpoint tested
3. HTTP method and path
4. Request body (if applicable)
5. HTTP status code
6. Response body
7. Pass/fail indicator
8. Summary statistics

### Example Report Entry
```markdown
## Create User Profile

**Endpoint:** `POST /api/profile/testuser123`

**Request Body:**
```json
{
  "skills": ["Python", "AWS"],
  "experience_years": 2,
  "education": "BS CS",
  "salary_min": 55000,
  "salary_max": 80000,
  "target_countries": ["Ireland"],
  "availability": "actively_looking"
}
```

**HTTP Status:** 200

**Response:**
```json
{
  "id": 1,
  "user_id": "testuser123",
  ...
}
```

✓ PASSED (HTTP 200)
```

---

## Verification Checklist

After running all tests, verify:

- [ ] Health check returns 200
- [ ] Database initialized successfully
- [ ] User profile created and retrieved
- [ ] Job search endpoint accessible
- [ ] Save job endpoint works
- [ ] Update job status works
- [ ] Match calculation works
- [ ] All analytics endpoints return data
- [ ] No 5xx errors in results
- [ ] Test results saved to file

---

## Next Steps

1. **Review API Specification**: Read `API_SPECIFICATION.md`
2. **Check Manual Tests**: Try commands in `QUICK_API_TEST.md`
3. **Integrate Tests**: Add to CI/CD pipeline
4. **Monitor Performance**: Track response times

---

## Support & Debugging

### Enable Debug Logging
```bash
# In backend, modify index.ts to add:
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, new Date());
  next();
});
```

### Check Backend Logs
```bash
# Watch backend console during test
npm start 2>&1 | tee backend.log
```

### Database Query Logging
```bash
# In PostgreSQL
psql -U postgres
\set ECHO all
```

### Network Debugging
```bash
# See actual HTTP requests
curl -v http://localhost:5000/health

# Detailed output with -v flag
```

---

## Completion

Once all tests pass:

1. Generate final report
2. Document any deviations
3. Note timestamp of successful execution
4. Archive test results

**Success Criteria:** All endpoints return 2xx status codes and expected data.
