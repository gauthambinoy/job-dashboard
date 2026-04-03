# Quick API Test Reference

## One-Line Test Summary

Test all endpoints with a single command:

```bash
node test-api.js
# or
bash test-api.sh
```

---

## Quick Manual Test Commands

Copy and paste these commands to test each endpoint:

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Initialize Database
```bash
curl -X POST http://localhost:5000/api/init-db
```

### 3. Create Profile
```bash
curl -X POST http://localhost:5000/api/profile/testuser123 \
  -H "Content-Type: application/json" \
  -d '{"skills":["Python","AWS"],"experience_years":2,"education":"BS CS","salary_min":55000,"salary_max":80000,"target_countries":["Ireland"],"availability":"actively_looking"}'
```

### 4. Get Profile
```bash
curl http://localhost:5000/api/profile/testuser123
```

### 5. Search Jobs
```bash
curl "http://localhost:5000/api/jobs/search?countries=Ireland&minSalary=50000"
```

### 6. Get Job
```bash
curl http://localhost:5000/api/jobs/1
```

### 7. Save Job
```bash
curl -X POST http://localhost:5000/api/jobs/1/save \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser123","status":"interested"}'
```

### 8. Get Saved Jobs
```bash
curl http://localhost:5000/api/jobs/saved/testuser123
```

### 9. Update Job Status
```bash
curl -X PUT http://localhost:5000/api/jobs/1/status \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser123","newStatus":"applied","dateApplied":"2026-04-01"}'
```

### 10. Calculate Match
```bash
curl -X POST http://localhost:5000/api/matching/calculate/testuser123/1
```

### 11. Analytics - Stats
```bash
curl http://localhost:5000/api/analytics/testuser123/stats
```

### 12. Analytics - Match Distribution
```bash
curl http://localhost:5000/api/analytics/testuser123/match-distribution
```

### 13. Analytics - Location Breakdown
```bash
curl http://localhost:5000/api/analytics/testuser123/location-breakdown
```

### 14. Analytics - Timeline
```bash
curl http://localhost:5000/api/analytics/testuser123/timeline
```

### 15. Analytics - Cluster Stats
```bash
curl http://localhost:5000/api/analytics/testuser123/cluster-stats
```

---

## Expected Status Codes

| Endpoint | Expected Code |
|----------|---------------|
| GET /health | 200 |
| POST /api/init-db | 200 |
| POST /api/profile/:userId | 200 |
| GET /api/profile/:userId | 200 |
| GET /api/jobs/search | 200 |
| GET /api/jobs/:jobId | 200 or 404 |
| POST /api/jobs/:jobId/save | 201 |
| GET /api/jobs/saved/:userId | 200 |
| PUT /api/jobs/:jobId/status | 200 |
| POST /api/matching/calculate/:userId/:jobId | 200 or 404 |
| GET /api/analytics/:userId/stats | 200 |
| GET /api/analytics/:userId/match-distribution | 200 |
| GET /api/analytics/:userId/location-breakdown | 200 |
| GET /api/analytics/:userId/timeline | 200 |
| GET /api/analytics/:userId/cluster-stats | 200 |

---

## Troubleshooting

### Backend Not Running
```bash
# Check if port 5000 is listening
lsof -i :5000

# Start backend
cd backend && npm start
```

### Database Connection Error
```bash
# Check PostgreSQL is running
psql -U postgres -d job_dashboard -c "SELECT 1"

# Initialize database via API
curl -X POST http://localhost:5000/api/init-db
```

### 404 on Job Endpoints
Some endpoints (like `/api/jobs/1`) require data in the database. Ensure you've:
1. Created a user profile first
2. Search jobs endpoint may return empty results if no data exists

---

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] PostgreSQL connected
- [ ] Health check returns 200
- [ ] Database initialized
- [ ] User profile created
- [ ] Jobs search works
- [ ] Job save works
- [ ] Status update works
- [ ] Match calculation works
- [ ] Analytics endpoints return data
- [ ] All results logged to `API_TEST_RESULTS.md`

---

## Performance Notes

- Initial database initialization may take a few seconds
- Large batch matching operations may be slower
- Match distribution and analytics queries depend on saved jobs data

---

## Test Results

After running tests, check:
```bash
cat API_TEST_RESULTS.md
```

All tests should show "PASSED" with HTTP 2xx status codes.
