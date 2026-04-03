# API Testing Guide

This document provides comprehensive testing instructions for all backend API endpoints.

## Prerequisites

1. **Backend Server**: Running on `http://localhost:5000`
2. **PostgreSQL Database**: Connected and ready
3. **Test User**: `testuser123`

## Starting the Backend

```bash
cd /home/gautham/lazyscaper/backend
npm start
```

Expected output:
```
Backend server running on port 5000
```

## Automated Testing

Run the automated test script:

```bash
cd /home/gautham/lazyscaper
bash test-api.sh
```

This will test all endpoints and generate `API_TEST_RESULTS.md` with detailed results.

---

## Manual Testing with cURL

### 1. Health Check

**Endpoint:** `GET /health`

```bash
curl -X GET http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

---

### 2. Initialize Database

**Endpoint:** `POST /api/init-db`

```bash
curl -X POST http://localhost:5000/api/init-db
```

**Expected Response:**
```json
{
  "status": "Database initialized successfully"
}
```

---

### 3. Create/Update User Profile

**Endpoint:** `POST /api/profile/:userId`

```bash
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
```

**Expected Response:**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "skills": ["Python", "AWS"],
  "experience_years": 2,
  "education": "BS CS",
  "salary_min": 55000,
  "salary_max": 80000,
  "target_countries": ["Ireland"],
  "availability": "actively_looking",
  "profile_updated_date": "2026-04-01T12:00:00.000Z",
  "created_at": "2026-04-01T12:00:00.000Z"
}
```

---

### 4. Get User Profile

**Endpoint:** `GET /api/profile/:userId`

```bash
curl -X GET http://localhost:5000/api/profile/testuser123
```

**Expected Response:**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "skills": ["Python", "AWS"],
  "experience_years": 2,
  "education": "BS CS",
  "salary_min": 55000,
  "salary_max": 80000,
  "target_countries": ["Ireland"],
  "availability": "actively_looking",
  "profile_updated_date": "2026-04-01T12:00:00.000Z",
  "created_at": "2026-04-01T12:00:00.000Z"
}
```

---

### 5. Search Jobs

**Endpoint:** `GET /api/jobs/search`

**Query Parameters:**
- `countries` (optional): Array of countries
- `minSalary` (optional): Minimum salary
- `maxSalary` (optional): Maximum salary
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

```bash
curl -X GET "http://localhost:5000/api/jobs/search?countries=Ireland&minSalary=50000&page=1&limit=20"
```

**Expected Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "company": "TechCorp",
      "title": "Backend Developer",
      "location": "Dublin",
      "country": "Ireland",
      "salary_min": 55000,
      "salary_max": 75000,
      "currency": "EUR",
      "job_type": "Full-time",
      "match_score": 85.5
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

---

### 6. Get Job Details

**Endpoint:** `GET /api/jobs/:jobId`

```bash
curl -X GET http://localhost:5000/api/jobs/1
```

**Expected Response:**
```json
{
  "id": 1,
  "company": "TechCorp",
  "title": "Backend Developer",
  "location": "Dublin",
  "country": "Ireland",
  "salary_min": 55000,
  "salary_max": 75000,
  "currency": "EUR",
  "jd_full_text": "We are looking for a Backend Developer...",
  "extracted_skills_required": ["Python", "AWS"],
  "experience_level": "2-4 years",
  "job_type": "Full-time",
  "match_score": 85.5
}
```

---

### 7. Save a Job

**Endpoint:** `POST /api/jobs/:jobId/save`

```bash
curl -X POST http://localhost:5000/api/jobs/1/save \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser123",
    "status": "interested"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "job_id": 1,
  "status": "interested",
  "date_saved": "2026-04-01T12:00:00.000Z",
  "created_at": "2026-04-01T12:00:00.000Z"
}
```

---

### 8. Get Saved Jobs

**Endpoint:** `GET /api/jobs/saved/:userId`

**Query Parameters:**
- `status` (optional): Filter by status (e.g., 'interested', 'applied')
- `limit` (optional): Results limit (default: 50)
- `offset` (optional): Pagination offset (default: 0)

```bash
curl -X GET "http://localhost:5000/api/jobs/saved/testuser123?status=interested&limit=50"
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "user_id": "testuser123",
    "job_id": 1,
    "status": "interested",
    "date_saved": "2026-04-01T12:00:00.000Z",
    "created_at": "2026-04-01T12:00:00.000Z"
  }
]
```

---

### 9. Update Job Status

**Endpoint:** `PUT /api/jobs/:jobId/status`

```bash
curl -X PUT http://localhost:5000/api/jobs/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser123",
    "newStatus": "applied",
    "dateApplied": "2026-04-01"
  }'
```

**Expected Response:**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "job_id": 1,
  "status": "applied",
  "date_applied": "2026-04-01T00:00:00.000Z",
  "updated_at": "2026-04-01T12:00:00.000Z"
}
```

---

### 10. Calculate Match Score

**Endpoint:** `POST /api/matching/calculate/:userId/:jobId`

```bash
curl -X POST http://localhost:5000/api/matching/calculate/testuser123/1
```

**Expected Response:**
```json
{
  "totalScore": 85.5,
  "skillMatch": 90,
  "experienceMatch": 85,
  "salaryMatch": 80,
  "locationMatch": 100,
  "breakdown": {
    "skillsMatched": ["Python", "AWS"],
    "skillsMissing": ["Docker"],
    "experienceGap": 0.5
  }
}
```

---

### 11. Batch Calculate Matches

**Endpoint:** `POST /api/matching/batch/:userId`

```bash
curl -X POST http://localhost:5000/api/matching/batch/testuser123 \
  -H "Content-Type: application/json" \
  -d '{
    "countries": ["Ireland"],
    "minSalary": 50000,
    "maxSalary": 100000
  }'
```

**Expected Response:**
```json
[
  {
    "id": 1,
    "company": "TechCorp",
    "title": "Backend Developer",
    "match_score": 85.5,
    "match_details": {
      "totalScore": 85.5,
      "skillMatch": 90
    }
  }
]
```

---

### 12. Get Analytics - Application Stats

**Endpoint:** `GET /api/analytics/:userId/stats`

```bash
curl -X GET http://localhost:5000/api/analytics/testuser123/stats
```

**Expected Response:**
```json
{
  "totalSaved": 5,
  "applied": 3,
  "interviewing": 1,
  "rejected": 0,
  "offered": 0,
  "conversionRateApplied": 20.0,
  "conversionRateInterview": 0.0
}
```

---

### 13. Get Analytics - Match Distribution

**Endpoint:** `GET /api/analytics/:userId/match-distribution`

```bash
curl -X GET http://localhost:5000/api/analytics/testuser123/match-distribution
```

**Expected Response:**
```json
{
  "ranges": [
    {
      "min": 0,
      "max": 20,
      "count": 0,
      "percentage": 0.0
    },
    {
      "min": 20,
      "max": 40,
      "count": 1,
      "percentage": 20.0
    },
    {
      "min": 40,
      "max": 60,
      "count": 2,
      "percentage": 40.0
    },
    {
      "min": 60,
      "max": 80,
      "count": 1,
      "percentage": 20.0
    },
    {
      "min": 80,
      "max": 100,
      "count": 1,
      "percentage": 20.0
    }
  ],
  "averageMatch": 60.5,
  "medianMatch": 55.0
}
```

---

### 14. Get Analytics - Location Breakdown

**Endpoint:** `GET /api/analytics/:userId/location-breakdown`

```bash
curl -X GET http://localhost:5000/api/analytics/testuser123/location-breakdown
```

**Expected Response:**
```json
[
  {
    "country": "Ireland",
    "totalSaved": 3,
    "applied": 2,
    "interviewing": 1,
    "rejected": 0,
    "offered": 0
  },
  {
    "country": "Germany",
    "totalSaved": 2,
    "applied": 1,
    "interviewing": 0,
    "rejected": 0,
    "offered": 0
  }
]
```

---

### 15. Get Analytics - Cluster Stats

**Endpoint:** `GET /api/analytics/:userId/cluster-stats`

```bash
curl -X GET http://localhost:5000/api/analytics/testuser123/cluster-stats
```

**Expected Response:**
```json
[
  {
    "clusterId": "backend-eng",
    "domain": "Backend Engineering",
    "jobCount": 15,
    "totalSaved": 3,
    "applied": 2,
    "interviewed": 1,
    "offered": 0,
    "averageMatchScore": 75.5,
    "conversionRate": 33.33
  }
]
```

---

### 16. Get Analytics - Application Timeline

**Endpoint:** `GET /api/analytics/:userId/timeline`

```bash
curl -X GET http://localhost:5000/api/analytics/testuser123/timeline
```

**Expected Response:**
```json
[
  {
    "date": "2026-03-15",
    "status": "saved",
    "count": 2
  },
  {
    "date": "2026-03-20",
    "status": "applied",
    "count": 1
  },
  {
    "date": "2026-03-25",
    "status": "interviewed",
    "count": 1
  }
]
```

---

## Testing Workflow

### Step 1: Verify Backend is Running

```bash
curl -X GET http://localhost:5000/health
```

### Step 2: Initialize Database

```bash
curl -X POST http://localhost:5000/api/init-db
```

### Step 3: Create Test Data

```bash
# Create a test user profile
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
```

### Step 4: Run Full Test Suite

```bash
bash test-api.sh
```

### Step 5: Review Results

```bash
cat API_TEST_RESULTS.md
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful deletion |
| 400 | Bad Request - Invalid input parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Backend error |

### Debugging Tips

1. **Check Backend Logs**: Monitor the backend console for detailed error messages
2. **Verify Database Connection**: Ensure PostgreSQL is running and accessible
3. **Validate JSON**: Use `jq` to validate JSON responses
4. **Check Status Codes**: Always verify HTTP status codes

---

## Notes

- All timestamps are in ISO 8601 format
- Currency is typically EUR for European jobs
- Match scores are on a scale of 0-100
- Salary values are in the currency specified
- Dates can be provided in YYYY-MM-DD format

---

## Conclusion

Use this guide to test all API endpoints. The automated test script (`test-api.sh`) provides a quick way to verify all endpoints are working correctly.
