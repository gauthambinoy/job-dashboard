# LazyScaper API Specification

## Overview

The LazyScaper API provides endpoints for user profile management, job searching, saved jobs tracking, match calculation, and analytics.

**Base URL:** `http://localhost:5000`

---

## Authentication & Headers

Currently, the API does not require authentication. All requests should include:

```
Content-Type: application/json
```

---

## Core Entities

### User Profile
```typescript
{
  id: number;
  user_id: string;
  skills: string[];
  experience_years: number;
  education: string;
  salary_min: number;
  salary_max: number;
  target_countries: string[];
  availability: string;
  profile_updated_date: ISO8601DateTime;
  created_at: ISO8601DateTime;
}
```

### Job
```typescript
{
  id: number;
  company: string;
  title: string;
  location: string;
  country: string;
  salary_min: number;
  salary_max: number;
  currency: string;
  jd_full_text: string;
  original_url: string;
  source: string;
  extracted_skills_required: string[];
  extracted_skills_nice_to_have: string[];
  experience_level: string;
  degree_required: string;
  soft_skills: string[];
  job_type: string;
  posted_date: ISO8601DateTime;
  cluster_id: string;
  match_score: number;
  created_at: ISO8601DateTime;
  updated_at: ISO8601DateTime;
}
```

### Saved Job
```typescript
{
  id: number;
  user_id: string;
  job_id: number;
  cluster_id: string;
  status: string; // 'interested', 'applied', 'interviewing', 'rejected', 'offered'
  cv_variant_used: string;
  notes: string;
  date_saved: ISO8601DateTime;
  date_applied: ISO8601DateTime;
  interview_date: ISO8601DateTime;
  result_notes: string;
  created_at: ISO8601DateTime;
  updated_at: ISO8601DateTime;
}
```

### Match Score
```typescript
{
  totalScore: number; // 0-100
  skillMatch: number;
  experienceMatch: number;
  salaryMatch: number;
  locationMatch: number;
  breakdown: {
    skillsMatched: string[];
    skillsMissing: string[];
    experienceGap: number;
  }
}
```

---

## Endpoints

### 1. System Endpoints

#### Health Check
**GET /health**

Check if the API is running and responsive.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T12:00:00.000Z"
}
```

#### Initialize Database
**POST /api/init-db**

Create database schema and tables.

**Response (200):**
```json
{
  "status": "Database initialized successfully"
}
```

---

### 2. Profile Endpoints

#### Create or Update User Profile
**POST /api/profile/:userId**

Create a new user profile or update existing one.

**Parameters:**
- `userId` (path): Unique user identifier

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

**Response (200):**
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

#### Get User Profile
**GET /api/profile/:userId**

Retrieve user profile by user ID.

**Parameters:**
- `userId` (path): Unique user identifier

**Response (200):**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "skills": ["Python", "AWS"],
  ...
}
```

**Response (404):**
```json
{
  "error": "Profile not found"
}
```

---

### 3. Job Search Endpoints

#### Search Jobs
**GET /api/jobs/search**

Search jobs with optional filters.

**Query Parameters:**
- `countries` (optional): Array of country names or single country
- `minSalary` (optional): Minimum salary (integer)
- `maxSalary` (optional): Maximum salary (integer)
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20): Results per page

**Response (200):**
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
  "total": 150
}
```

#### Get Job by ID
**GET /api/jobs/:jobId**

Retrieve detailed information for a specific job.

**Parameters:**
- `jobId` (path): Job identifier

**Response (200):**
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
  "jd_full_text": "We are looking for...",
  "extracted_skills_required": ["Python", "AWS"],
  "experience_level": "2-4 years",
  "job_type": "Full-time",
  "match_score": 85.5,
  "created_at": "2026-03-01T00:00:00.000Z"
}
```

**Response (404):**
```json
{
  "error": "Not found"
}
```

#### Get Jobs by Cluster
**GET /api/jobs/cluster/:clusterId**

Retrieve all jobs in a specific cluster.

**Parameters:**
- `clusterId` (path): Cluster identifier

**Response (200):**
```json
[
  {
    "id": 1,
    "company": "TechCorp",
    "title": "Backend Developer",
    ...
  }
]
```

---

### 4. Saved Jobs Endpoints

#### Save a Job
**POST /api/jobs/:jobId/save**

Save a job to the user's saved jobs list.

**Parameters:**
- `jobId` (path): Job identifier

**Request Body:**
```json
{
  "userId": "testuser123",
  "status": "interested"
}
```

**Response (201):**
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

#### Get Saved Jobs
**GET /api/jobs/saved/:userId**

Retrieve all saved jobs for a user.

**Parameters:**
- `userId` (path): User identifier

**Query Parameters:**
- `status` (optional): Filter by status
- `limit` (optional, default: 50): Results limit
- `offset` (optional, default: 0): Pagination offset

**Response (200):**
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

#### Update Job Status
**PUT /api/jobs/:jobId/status**

Update the status of a saved job (e.g., from "interested" to "applied").

**Parameters:**
- `jobId` (path): Job identifier

**Request Body:**
```json
{
  "userId": "testuser123",
  "newStatus": "applied",
  "dateApplied": "2026-04-01",
  "interviewDate": "2026-04-15"
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "job_id": 1,
  "status": "applied",
  "date_applied": "2026-04-01T00:00:00.000Z",
  "interview_date": "2026-04-15T00:00:00.000Z",
  "updated_at": "2026-04-01T12:00:00.000Z"
}
```

#### Add Note to Job
**POST /api/jobs/:jobId/note**

Add or update a note for a saved job.

**Parameters:**
- `jobId` (path): Job identifier

**Request Body:**
```json
{
  "userId": "testuser123",
  "note": "Great company culture based on reviews"
}
```

**Response (200):**
```json
{
  "id": 1,
  "user_id": "testuser123",
  "job_id": 1,
  "notes": "Great company culture based on reviews",
  "updated_at": "2026-04-01T12:00:00.000Z"
}
```

#### Delete Saved Job
**DELETE /api/jobs/:jobId**

Remove a job from saved jobs.

**Parameters:**
- `jobId` (path): Job identifier

**Request Body:**
```json
{
  "userId": "testuser123"
}
```

**Response (204):** No Content

---

### 5. Matching Endpoints

#### Calculate Match Score
**POST /api/matching/calculate/:userId/:jobId**

Calculate match score between a user profile and a job.

**Parameters:**
- `userId` (path): User identifier
- `jobId` (path): Job identifier

**Response (200):**
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

**Response (404):**
```json
{
  "error": "User profile not found"
}
```

#### Batch Calculate Matches
**POST /api/matching/batch/:userId**

Calculate match scores for multiple jobs in batch.

**Parameters:**
- `userId` (path): User identifier

**Request Body:**
```json
{
  "countries": ["Ireland"],
  "minSalary": 50000,
  "maxSalary": 100000
}
```

**Response (200):**
```json
[
  {
    "id": 1,
    "company": "TechCorp",
    "title": "Backend Developer",
    "match_score": 85.5,
    "match_details": {
      "totalScore": 85.5,
      "skillMatch": 90,
      "experienceMatch": 85,
      "salaryMatch": 80,
      "locationMatch": 100
    }
  }
]
```

#### Analyze Job Description
**POST /api/matching/analyze-jd**

Extract and analyze skills from a job description.

**Request Body:**
```json
{
  "jdText": "We are looking for a Python developer with AWS experience..."
}
```

**Response (200):**
```json
{
  "skills_required": ["Python", "AWS"],
  "skills_nice_to_have": ["Docker", "Kubernetes"],
  "experience_level": "2-4 years",
  "degree_required": "Bachelor's",
  "soft_skills": ["Communication", "Problem-solving"]
}
```

---

### 6. Analytics Endpoints

#### Get Application Statistics
**GET /api/analytics/:userId/stats**

Get overall application statistics for a user.

**Parameters:**
- `userId` (path): User identifier

**Response (200):**
```json
{
  "totalSaved": 15,
  "applied": 8,
  "interviewing": 2,
  "rejected": 1,
  "offered": 1,
  "conversionRateApplied": 20.0,
  "conversionRateInterview": 50.0
}
```

#### Get Match Score Distribution
**GET /api/analytics/:userId/match-distribution**

Get distribution of match scores for a user's saved jobs.

**Parameters:**
- `userId` (path): User identifier

**Response (200):**
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
      "count": 2,
      "percentage": 13.33
    },
    {
      "min": 40,
      "max": 60,
      "count": 5,
      "percentage": 33.33
    },
    {
      "min": 60,
      "max": 80,
      "count": 6,
      "percentage": 40.0
    },
    {
      "min": 80,
      "max": 100,
      "count": 2,
      "percentage": 13.33
    }
  ],
  "averageMatch": 62.5,
  "medianMatch": 65.0
}
```

#### Get Location Breakdown
**GET /api/analytics/:userId/location-breakdown**

Get job statistics by country/location.

**Parameters:**
- `userId` (path): User identifier

**Response (200):**
```json
[
  {
    "country": "Ireland",
    "totalSaved": 8,
    "applied": 5,
    "interviewing": 1,
    "rejected": 0,
    "offered": 1
  },
  {
    "country": "Germany",
    "totalSaved": 5,
    "applied": 2,
    "interviewing": 1,
    "rejected": 1,
    "offered": 0
  }
]
```

#### Get Cluster Statistics
**GET /api/analytics/:userId/cluster-stats**

Get performance statistics for job clusters.

**Parameters:**
- `userId` (path): User identifier

**Response (200):**
```json
[
  {
    "clusterId": "backend-eng",
    "domain": "Backend Engineering",
    "jobCount": 15,
    "totalSaved": 8,
    "applied": 5,
    "interviewed": 1,
    "offered": 1,
    "averageMatchScore": 72.5,
    "conversionRate": 25.0
  }
]
```

#### Get Application Timeline
**GET /api/analytics/:userId/timeline**

Get timeline of application events.

**Parameters:**
- `userId` (path): User identifier

**Response (200):**
```json
[
  {
    "date": "2026-03-15",
    "status": "saved",
    "count": 3
  },
  {
    "date": "2026-03-20",
    "status": "applied",
    "count": 2
  },
  {
    "date": "2026-03-25",
    "status": "interviewed",
    "count": 1
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "userId required"
}
```

### 404 Not Found
```json
{
  "error": "Profile not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch profile"
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Successful GET, POST, or PUT |
| 201 | Created - Resource created successfully |
| 204 | No Content - Successful DELETE |
| 400 | Bad Request - Invalid parameters or missing required fields |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server-side error |

---

## Data Types

- **string**: Text values
- **number**: Integer or decimal values
- **boolean**: true/false
- **ISO8601DateTime**: Format "2026-04-01T12:00:00.000Z"
- **array**: Collections of values

---

## Query Parameter Examples

```
GET /api/jobs/search?countries=Ireland&countries=Germany&minSalary=50000&maxSalary=100000&page=1&limit=50
GET /api/jobs/saved/testuser123?status=applied&limit=10&offset=0
```

---

## Rate Limiting

Currently not implemented. All requests are accepted.

---

## Pagination

Most list endpoints support pagination via:
- `limit` (default: 20 or 50): Number of results per page
- `offset` or `page`: Starting position or page number

---

## Data Validation

- Email fields: Valid email format required
- Salary fields: Must be positive integers
- Arrays: Can be empty
- Dates: ISO 8601 format

---

## Notes

- All timestamps are in UTC (ISO 8601 format)
- Salary values are in the currency specified (typically EUR)
- Match scores are on a scale of 0-100
- User IDs are case-sensitive strings
- Job IDs are numeric identifiers

---

## Testing

See `API_TESTING_GUIDE.md` for comprehensive testing instructions.
