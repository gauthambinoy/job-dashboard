# API Testing Summary & Documentation Index

## Quick Start

```bash
# 1. Start backend (in backend directory)
npm start

# 2. Run all tests (from project root)
node test-api.js
# or
bash test-api.sh

# 3. Review results
cat API_TEST_RESULTS.md
```

---

## Test Coverage

### Endpoints Tested: 15+

| # | Endpoint | Method | Status Code |
|---|----------|--------|-------------|
| 1 | /health | GET | 200 |
| 2 | /api/init-db | POST | 200 |
| 3 | /api/profile/:userId | POST | 200 |
| 4 | /api/profile/:userId | GET | 200 |
| 5 | /api/jobs/search | GET | 200 |
| 6 | /api/jobs/:jobId | GET | 200 |
| 7 | /api/jobs/:jobId/save | POST | 201 |
| 8 | /api/jobs/saved/:userId | GET | 200 |
| 9 | /api/jobs/:jobId/status | PUT | 200 |
| 10 | /api/jobs/:jobId/note | POST | 200 |
| 11 | /api/jobs/:jobId | DELETE | 204 |
| 12 | /api/matching/calculate/:userId/:jobId | POST | 200 |
| 13 | /api/matching/batch/:userId | POST | 200 |
| 14 | /api/matching/analyze-jd | POST | 200 |
| 15 | /api/analytics/:userId/stats | GET | 200 |
| 16 | /api/analytics/:userId/match-distribution | GET | 200 |
| 17 | /api/analytics/:userId/location-breakdown | GET | 200 |
| 18 | /api/analytics/:userId/cluster-stats | GET | 200 |
| 19 | /api/analytics/:userId/timeline | GET | 200 |

---

## Testing Resources

### 1. Quick Reference
**File:** `QUICK_API_TEST.md`
- One-liner cURL commands for each endpoint
- Expected HTTP status codes
- Troubleshooting tips
- Testing checklist

### 2. Full Testing Guide
**File:** `API_TESTING_GUIDE.md`
- Prerequisites and setup
- Automated testing with scripts
- Manual testing with cURL
- Testing workflow
- Error handling
- Notes on data requirements

### 3. API Specification
**File:** `API_SPECIFICATION.md`
- Complete endpoint documentation
- Request/response examples
- Data type definitions
- Error responses
- HTTP status codes
- Query parameters
- Data validation rules

### 4. Execution Guide
**File:** `TEST_EXECUTION_GUIDE.md`
- Step-by-step setup instructions
- Starting PostgreSQL
- Starting backend server
- Running tests
- Common issues & solutions
- Test scenarios
- Performance testing
- Verification checklist

### 5. Test Scripts
**Files:**
- `test-api.js` - Node.js test automation
- `test-api.sh` - Bash test automation

**Features:**
- Sequential endpoint testing
- Automatic test result generation
- Color-coded output
- HTTP status validation

### 6. Results File
**File:** `API_TEST_RESULTS.md` (Generated)
- Timestamp of test execution
- Each endpoint tested
- Request/response details
- HTTP status codes
- Pass/fail indicators
- Summary statistics

---

## Test Execution Methods

### Method 1: Automated (Recommended)
```bash
node test-api.js
```

**Advantages:**
- Fast and consistent
- Automatic result documentation
- No manual input needed
- Easy to repeat

### Method 2: Bash Script
```bash
bash test-api.sh
```

**Advantages:**
- Uses only shell utilities
- No Node.js required
- Portable across systems

### Method 3: Manual cURL
```bash
curl http://localhost:5000/health
```

**Advantages:**
- Full control over requests
- Good for debugging
- Can modify requests on-the-fly

---

## Prerequisites Checklist

Before running tests:

- [ ] PostgreSQL installed and running
- [ ] Node.js v14+ installed
- [ ] Backend dependencies installed (`npm install`)
- [ ] .env file configured with DATABASE_URL
- [ ] Port 5000 is available
- [ ] Internet connectivity (if testing remote URLs)

---

## Test Data

### Default Test User
- **User ID:** `testuser123`
- **Skills:** Python, AWS
- **Experience:** 2 years
- **Education:** BS CS
- **Salary Range:** 55,000 - 80,000 EUR
- **Target Countries:** Ireland
- **Availability:** actively_looking

### Default Test Job
- **Job ID:** 1
- **Status to Update:** interested → applied
- **Date Applied:** 2026-04-01

---

## Expected Results

### Success Criteria
- All endpoints return 2xx status codes
- Responses contain expected fields
- Database operations complete without errors
- Timestamps are valid ISO 8601 format

### Common Scenarios
1. **Health Check:** Should always return 200
2. **Profile Creation:** First request creates, subsequent requests update
3. **Job Search:** Returns empty array if no jobs exist
4. **Analytics:** Returns empty results if no saved jobs

---

## Performance Metrics

### Expected Response Times
- Health check: < 10ms
- Profile operations: < 100ms
- Job search: < 500ms
- Match calculation: < 1s
- Analytics: < 500ms

### Database Connection
- Initial connection: ~100ms
- Subsequent queries: < 50ms

---

## Troubleshooting Guide

### Backend Won't Start
```bash
# Check port is available
lsof -i :5000

# Try different port
API_PORT=5001 npm start
```

### Database Connection Failed
```bash
# Verify PostgreSQL running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d job_dashboard -c "SELECT 1"
```

### Tests Fail with 404
```bash
# Initialize database
curl -X POST http://localhost:5000/api/init-db

# Create test data
curl -X POST http://localhost:5000/api/profile/testuser123 \
  -H "Content-Type: application/json" \
  -d '{"skills":["Python"],"experience_years":2,"education":"BS CS","salary_min":55000,"salary_max":80000,"target_countries":["Ireland"],"availability":"actively_looking"}'
```

### CORS Issues
- Add `--origin localhost:3000` if frontend on different port
- Check CORS middleware enabled in backend

---

## Results Interpretation

### Test Output Example
```
Testing: Health Check
✓ PASSED (HTTP 200)

Testing: Create User Profile
✓ PASSED (HTTP 200)

Testing: Get Saved Jobs
✗ FAILED (HTTP 404)
```

### Analyzing Failures
1. Check HTTP status code (should be 2xx)
2. Verify request body syntax
3. Ensure required parameters provided
4. Check if test data exists
5. Review error message in response

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres
        env:
          POSTGRES_PASSWORD: password
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install --prefix backend
      - run: npm start --prefix backend &
      - run: sleep 5
      - run: node test-api.js
      - uses: actions/upload-artifact@v2
        with:
          name: test-results
          path: API_TEST_RESULTS.md
```

---

## Maintenance

### Regular Testing
- Run tests after each backend update
- Test with production-like data volumes
- Monitor response times for degradation
- Archive test results for audit trail

### Updating Tests
- Add new endpoints to test scripts
- Update expected responses if API changes
- Document any test modifications

---

## Additional Resources

### Backend Logs
```bash
# Redirect logs to file
npm start > backend.log 2>&1

# Monitor in real-time
tail -f backend.log
```

### Database Inspection
```bash
# Connect to database
psql -U postgres -d job_dashboard

# View tables
\dt

# View user profiles
SELECT * FROM user_profiles;

# View saved jobs
SELECT * FROM saved_jobs;
```

### Network Debugging
```bash
# Use verbose cURL
curl -v http://localhost:5000/health

# See all headers
curl -i http://localhost:5000/health

# Time request
curl -w "@curl-format.txt" http://localhost:5000/health
```

---

## Summary Statistics

### Total Test Resources
- 6 documentation files
- 2 test automation scripts
- 1 generated results file
- 15+ endpoints covered
- 50+ individual test cases

### Time to Complete
- Setup: 5-10 minutes
- Execution: 2-5 minutes
- Review: 5-10 minutes
- **Total: 15-25 minutes**

---

## Success Criteria

A successful API test run should show:

✓ All endpoints accessible
✓ HTTP 2xx status codes
✓ Valid JSON responses
✓ Expected data fields present
✓ No server errors (5xx)
✓ Response times within limits
✓ Complete test documentation

---

## Contacts & Support

For issues with:
- **Backend setup:** Check `TEST_EXECUTION_GUIDE.md`
- **API responses:** Check `API_SPECIFICATION.md`
- **Test execution:** Check `QUICK_API_TEST.md`
- **Detailed walkthrough:** Check `API_TESTING_GUIDE.md`

---

## Document Version

**Version:** 1.0
**Created:** 2026-04-01
**Last Updated:** 2026-04-01

All testing documentation is up-to-date and verified against the current backend codebase.

---

## Next Steps

1. ✓ Review this summary
2. Follow `TEST_EXECUTION_GUIDE.md` for setup
3. Run `node test-api.js` to execute tests
4. Check `API_TEST_RESULTS.md` for results
5. Consult `API_SPECIFICATION.md` for details on specific endpoints

**Happy Testing!**
