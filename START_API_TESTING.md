# START HERE: API Testing Quick Start

**Read this first (5 minutes)** - Everything you need to test the backend API

---

## What You'll Do

1. Start the backend server (1 minute)
2. Run automated tests (5 minutes)
3. Review results (5 minutes)

**Total time: 10 minutes**

---

## Step 1: Start Backend Server

Open a terminal and run:

```bash
cd /home/gautham/lazyscaper/backend
npm start
```

Expected output:
```
Backend server running on port 5000
```

Leave this terminal open.

---

## Step 2: Run Automated Tests

Open a NEW terminal and run:

```bash
cd /home/gautham/lazyscaper
node test-api.js
```

This will:
- Test all 19 API endpoints
- Validate responses
- Generate results file
- Show pass/fail summary

Expected output (green checkmarks):
```
Testing: Health Check
✓ PASSED (HTTP 200)

Testing: Create User Profile
✓ PASSED (HTTP 200)

...

=== Test Summary ===

Tests Passed: 19
Tests Failed: 0

All endpoints working ✓
```

---

## Step 3: Review Results

Check the generated results file:

```bash
cat /home/gautham/lazyscaper/API_TEST_RESULTS.md
```

This file contains:
- Each endpoint tested
- Request/response details
- Pass/fail status
- Summary statistics

---

## What Gets Tested

All these endpoint categories:

| Category | Count | Endpoints |
|----------|-------|-----------|
| System | 2 | Health, Init DB |
| Profiles | 2 | Create, Get |
| Jobs | 7 | Search, Save, Update, Delete, etc. |
| Matching | 3 | Calculate, Batch, Analyze |
| Analytics | 5 | Stats, Distribution, Timeline, etc. |
| **TOTAL** | **19** | **All endpoints** |

---

## If Tests Fail

### Most Common Issues

**1. "Connection refused" on port 5000**
```bash
# Make sure backend is running in another terminal
# Check: npm start should show "port 5000"
```

**2. "Database connection error"**
```bash
# Check PostgreSQL is running:
psql -U postgres -c "SELECT 1"

# If not running:
sudo systemctl start postgresql  # Linux
brew services start postgresql  # Mac
```

**3. "Cannot find module" error**
```bash
# Install backend dependencies:
cd backend && npm install
npm start
```

**4. "Port 5000 already in use"**
```bash
# Find what's using port 5000:
lsof -i :5000

# Kill it or use a different port:
API_PORT=5001 npm start
```

---

## Manual Testing (Optional)

Want to test a single endpoint? Use cURL:

```bash
# Test health check
curl http://localhost:5000/health

# Create a test user
curl -X POST http://localhost:5000/api/profile/testuser123 \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "AWS"],
    "experience_years": 2,
    "education": "BS CS",
    "salary_min": 55000,
    "salary_max": 80000,
    "target_countries": ["Ireland"],
    "availability": "actively_looking"
  }'

# Get the user back
curl http://localhost:5000/api/profile/testuser123
```

See `QUICK_API_TEST.md` for more examples.

---

## Need More Details?

After the quick start, read:

| Need | Read | Time |
|------|------|------|
| How to set up from scratch | `TEST_EXECUTION_GUIDE.md` | 25 min |
| Complete API reference | `API_SPECIFICATION.md` | 20 min |
| All cURL commands | `QUICK_API_TEST.md` | 10 min |
| Understand the architecture | `API_FLOW_DIAGRAM.md` | 15 min |
| Where to start? | `API_TESTING_INDEX.md` | 10 min |
| What was delivered? | `TESTING_COMPLETION_REPORT.md` | 10 min |

---

## Success Looks Like

After running tests, you should see:

```
=== Test Summary ===

Tests Passed: 19
Tests Failed: 0

All endpoints working ✓

Results saved to: API_TEST_RESULTS.md
```

✓ All green checkmarks
✓ No errors
✓ Results file generated

---

## What the Tests Cover

### Health & Setup
- Server is running ✓
- Database is initialized ✓

### User Profiles
- Create profile ✓
- Retrieve profile ✓

### Job Operations
- Search jobs ✓
- Save jobs ✓
- Update job status ✓
- Get saved jobs ✓

### Matching
- Calculate match score ✓
- Batch operations ✓

### Analytics
- View statistics ✓
- Match distribution ✓
- Location breakdown ✓
- Timeline data ✓

---

## Endpoints Tested in Order

1. GET /health
2. POST /api/init-db
3. POST /api/profile/testuser123
4. GET /api/profile/testuser123
5. GET /api/jobs/search
6. GET /api/jobs/1
7. POST /api/jobs/1/save
8. GET /api/jobs/saved/testuser123
9. PUT /api/jobs/1/status
10. POST /api/matching/calculate/testuser123/1
11. GET /api/analytics/testuser123/stats
12. GET /api/analytics/testuser123/match-distribution
13. GET /api/analytics/testuser123/location-breakdown
14. GET /api/analytics/testuser123/timeline
15. GET /api/analytics/testuser123/cluster-stats

Plus optional endpoints like:
- Job clusters
- Job notes
- Batch matching
- JD analysis

---

## Three Ways to Run Tests

### Method 1: Automated (Recommended)
```bash
node test-api.js
```
Fast, comprehensive, auto-documented

### Method 2: Bash Script
```bash
bash test-api.sh
```
No Node.js required

### Method 3: Manual cURL
```bash
curl http://localhost:5000/health
```
Full control, best for debugging

---

## Check Your Setup

Before running tests, verify:

```bash
# 1. PostgreSQL running?
psql -U postgres -c "SELECT 1"

# 2. Node.js installed?
node --version  # Should be v14+

# 3. Port 5000 available?
lsof -i :5000   # Should be empty

# 4. Backend dependencies?
cd backend && npm list | head -5
```

---

## Save Test Results

After testing, save results with timestamp:

```bash
cp API_TEST_RESULTS.md \
  API_TEST_RESULTS_$(date +%Y%m%d_%H%M%S).md
```

---

## Next Steps

1. ✓ Run the tests (you are here)
2. Review `API_TEST_RESULTS.md`
3. Read `API_SPECIFICATION.md` for details
4. Check `QUICK_API_TEST.md` for more examples
5. Explore `API_FLOW_DIAGRAM.md` to understand design

---

## Quick Reference

| Task | Command |
|------|---------|
| Start backend | `cd backend && npm start` |
| Run tests | `node test-api.js` |
| View results | `cat API_TEST_RESULTS.md` |
| Check health | `curl http://localhost:5000/health` |
| Stop backend | `Ctrl+C` in backend terminal |

---

## Troubleshooting Quick Links

- Backend won't start → Check PostgreSQL, port 5000
- Tests fail → Check backend is running
- Database error → Restart PostgreSQL
- Need help → Read `TEST_EXECUTION_GUIDE.md`

---

## You're Ready!

1. Open two terminals
2. Terminal 1: `cd backend && npm start`
3. Terminal 2: `cd .. && node test-api.js`
4. Wait for "All endpoints working ✓"
5. Check `API_TEST_RESULTS.md`

**That's it!**

---

Questions? See `API_TESTING_INDEX.md` for navigation to detailed docs.

Happy testing!
