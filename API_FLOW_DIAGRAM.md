# API Flow Diagrams

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React)                            │
│                    Port 3000 (Optional)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP Request/Response
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  Backend API (Node.js/Express)                   │
│                    Port 5000                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes:                                                │   │
│  │  - /health                                              │   │
│  │  - /api/profile/*                                       │   │
│  │  - /api/jobs/*                                          │   │
│  │  - /api/matching/*                                      │   │
│  │  - /api/analytics/*                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                  SQL Queries (TCP 5432)
                             │
┌────────────────────────────▼────────────────────────────────────┐
│              PostgreSQL Database                                 │
│                  Port 5432                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Tables:                                                │   │
│  │  - user_profiles                                        │   │
│  │  - jobs                                                 │   │
│  │  - job_clusters                                         │   │
│  │  - saved_jobs                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## User Registration & Profile Setup

```
User Registration Flow:

1. User starts app
   │
   ├─ POST /api/profile/testuser123
   │  {"skills": [...], "experience_years": 2, ...}
   │
   ├─ Backend processes request
   │  ├─ Validate input
   │  └─ Insert/Update user_profiles table
   │
   └─ HTTP 200 response with profile data
      └─ Can now GET /api/profile/testuser123
```

## Job Search & Discovery

```
Job Discovery Flow:

1. User searches for jobs
   │
   ├─ GET /api/jobs/search?countries=Ireland&minSalary=50000
   │
   ├─ Backend:
   │  ├─ Query jobs table with filters
   │  ├─ Apply pagination (page, limit)
   │  └─ Return results sorted by match_score
   │
   └─ HTTP 200 with jobs array
      └─ Total count and pagination info included
```

## Match Calculation Process

```
Match Score Calculation:

User Profile + Job Details → Match Score

Components:
├─ Skill Match (40%)
│  └─ Compare required skills with user skills
│
├─ Experience Match (30%)
│  └─ Compare experience level requirement
│
├─ Salary Match (20%)
│  └─ Check salary range overlap
│
└─ Location Match (10%)
   └─ Verify country preference

Result: totalScore (0-100)
```

## Saved Jobs Status Progression

```
Status Lifecycle:

interested
   │
   ├─ applied
   │    │
   │    ├─ interviewing
   │    │    │
   │    │    ├─ offered
   │    │    │
   │    │    └─ rejected
   │    │
   │    └─ rejected
   │
   └─ deleted
```

## Analytics Data Pipeline

```
Analytics Flow:

Saved Jobs → Analysis → Insights

1. Application Stats
   └─ Count by status (interested, applied, offered, etc.)

2. Match Distribution
   └─ Group match scores into ranges

3. Location Breakdown
   └─ Aggregate by country

4. Timeline
   └─ Track events by date

5. Cluster Stats
   └─ Performance by job domain
```

## Testing Workflow

```
API Testing Process:

Setup:
├─ Start PostgreSQL
├─ Start Backend (npm start)
└─ Initialize Database (POST /api/init-db)

Execute Tests:
├─ Create test user profile
├─ Test job search
├─ Test save/update operations
├─ Test match calculation
└─ Test analytics endpoints

Verify:
├─ Check HTTP status codes (2xx)
├─ Validate response structure
└─ Generate report (API_TEST_RESULTS.md)
```

## Key Takeaways

- All endpoints follow REST conventions
- Requests use JSON format
- All responses are JSON (including errors)
- Database consistency maintained via foreign keys
- Match scores enable intelligent job ranking
- Analytics provide insights into job search progress
- Comprehensive error handling with appropriate HTTP codes
