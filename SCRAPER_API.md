# Job Scraper API Documentation

## Overview

The job scraper system provides production-ready, multi-country job aggregation from three major job boards:
- **Australia**: Seek.com.au (via SeekScraper)
- **Ireland**: IrishJobs.ie (via IndeedScraper with IE filter)
- **Dubai/UAE**: Bayt.com (via BaytScraper)

## Features

- Real job listing scraping with HTML parsing
- Automatic rate limiting (2+ seconds between requests)
- Local caching with configurable TTL (24 hours default)
- Retry logic with exponential backoff
- Production-ready error handling
- 30-50 real jobs per country/source
- Skill extraction from job descriptions
- Experience level detection
- Salary parsing support

## API Endpoints

All scraper endpoints are protected with JWT authentication.

### 1. Scrape Seek.com.au

**Endpoint**: `GET /api/scraper/seek`

**Query Parameters**:
- `keywords` (string, default: "developer") - Job search keywords
- `location` (string, default: "Australia") - Location to search in
- `useCache` (boolean, default: true) - Use cached results if available

**Example Request**:
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/seek?keywords=developer&location=Sydney&useCache=true"
```

**Response**:
```json
{
  "success": true,
  "source": "Seek",
  "country": "AU",
  "jobsCount": 45,
  "jobs": [
    {
      "id": 1,
      "title": "Senior Full Stack Developer",
      "company": "Tech Corp Australia",
      "location": "Sydney, NSW",
      "country": "AU",
      "salary_min": 120000,
      "salary_max": 160000,
      "currency": "AUD",
      "jd_full_text": "...",
      "original_url": "https://www.seek.com.au/jobs/...",
      "source": "Seek",
      "extracted_skills_required": ["React", "Node.js", "TypeScript"],
      "extracted_skills_nice_to_have": ["AWS", "Docker"],
      "experience_level": "Senior",
      "degree_required": "Bachelor",
      "soft_skills": ["Communication", "Problem Solving", "Team Collaboration"],
      "job_type": "Full-time",
      "posted_date": "2024-03-29T10:00:00Z"
    }
  ],
  "cacheInfo": {
    "exists": true,
    "age": 3600000,
    "jobs": 45
  }
}
```

---

### 2. Scrape All Countries

**Endpoint**: `GET /api/scraper/all`

**Query Parameters**:
- `keywords` (string, default: "developer") - Job search keywords
- `countries` (string, default: "AU,IE,AE") - Comma-separated country codes
- `useCache` (boolean, default: true) - Use cached results

**Example Request**:
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/all?keywords=python&countries=AU,IE,AE&useCache=true"
```

**Response**:
```json
{
  "success": true,
  "totalJobs": 135,
  "jobsByCountry": [
    {"country": "AU", "count": 45},
    {"country": "IE", "count": 45},
    {"country": "AE", "count": 45}
  ],
  "jobs": [...]
}
```

---

### 3. Get Jobs by Country

**Endpoint**: `GET /api/scraper/country/:country`

**Path Parameters**:
- `country` (string) - Country code (AU, IE, AE)

**Query Parameters**:
- `keywords` (string, default: "developer") - Job search keywords

**Example Request**:
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/country/AU?keywords=developer"
```

**Response**:
```json
{
  "success": true,
  "country": "AU",
  "jobsCount": 45,
  "jobs": [...]
}
```

---

### 4. Get Jobs by Source

**Endpoint**: `GET /api/scraper/source/:source`

**Path Parameters**:
- `source` (string) - Job source (Seek, IrishJobs, Bayt)

**Query Parameters**:
- `keywords` (string, default: "developer") - Job search keywords

**Valid Sources**:
- `Seek` - Seek.com.au (Australia)
- `IrishJobs` - IrishJobs.ie (Ireland)
- `Bayt` - Bayt.com (Dubai/UAE)

**Example Request**:
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/source/Seek?keywords=react"
```

**Response**:
```json
{
  "success": true,
  "source": "Seek",
  "jobsCount": 45,
  "jobs": [...]
}
```

---

### 5. Sync Jobs to Database

**Endpoint**: `POST /api/scraper/sync`

**Request Body**:
```json
{
  "countries": "AU,IE,AE"
}
```

**Example Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"countries": "AU,IE,AE"}' \
  "http://localhost:5000/api/scraper/sync"
```

**Response**:
```json
{
  "success": true,
  "message": "Sync completed. 100 new jobs added, 35 duplicates skipped, 0 errors",
  "stats": {
    "totalJobs": 135,
    "newJobs": 100,
    "duplicates": 35,
    "errors": 0
  }
}
```

---

### 6. Clear Scraper Cache

**Endpoint**: `DELETE /api/scraper/cache`

**Example Request**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/cache"
```

**Response**:
```json
{
  "success": true,
  "message": "Cache cleared successfully"
}
```

---

### 7. Get Scraper Status

**Endpoint**: `GET /api/scraper/status`

**Example Request**:
```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/status"
```

**Response**:
```json
{
  "success": true,
  "status": "healthy",
  "scraperVersion": "1.0.0",
  "supportedCountries": ["AU", "IE", "AE"],
  "supportedSources": {
    "AU": "Seek",
    "IE": "IrishJobs",
    "AE": "Bayt"
  },
  "features": {
    "caching": true,
    "retryLogic": true,
    "rateLimiting": true,
    "multiCountry": true
  }
}
```

---

## Job Object Structure

All jobs returned follow this structure:

```typescript
interface Job {
  id?: number;
  company: string;
  title: string;
  location: string;
  country: string; // 'AU', 'IE', 'AE'
  salary_min?: number;
  salary_max?: number;
  currency?: string; // 'AUD', 'EUR', 'AED'
  jd_full_text: string; // Full job description
  original_url: string; // Link to original job posting
  source: 'Seek' | 'IrishJobs' | 'Bayt'; // Source job board
  extracted_skills_required?: string[]; // Required technical skills
  extracted_skills_nice_to_have?: string[]; // Nice-to-have skills
  experience_level?: string; // 'Junior', 'Mid-Level', 'Senior'
  degree_required?: string; // Education requirement
  soft_skills?: string[]; // Communication, Leadership, etc.
  job_type?: string; // 'Full-time', 'Contract', 'Part-time'
  posted_date?: Date; // Job posting date
  cluster_id?: string; // Clustering identifier
  match_score?: number; // Job-profile match score
}
```

---

## Implementation Details

### SeekScraper (Australia)

Located at: `/backend/src/services/seekScraper.ts`

**Features**:
- Real HTML parsing with Cheerio
- Seek.com.au job board integration
- Australian salary ranges (AUD)
- Sydney, Melbourne, Brisbane, Perth, Adelaide, Hobart locations
- Rate limiting (2+ seconds between requests)
- 24-hour cache TTL
- Retry logic (3 attempts default)

**Configuration**:
```typescript
const scraper = createSeekScraper({
  cacheDir: '/path/to/cache',
  cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
  maxRetries: 3,
  retryDelay: 2000, // milliseconds
  requestTimeout: 15000, // milliseconds
});
```

### MultiCountryScraper

Located at: `/backend/src/services/multiCountryScraper.ts`

**Features**:
- Unified interface for all job sources
- Parallel scraping from multiple sources
- Combined caching
- Country-specific filtering
- Source-specific filtering
- Fallback data generation

---

## Usage Examples

### Example 1: Get all developer jobs

```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/all?keywords=developer"
```

### Example 2: Get React jobs from Australia only

```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/country/AU?keywords=react"
```

### Example 3: Sync all jobs to database

```bash
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"countries": "AU,IE,AE"}' \
  "http://localhost:5000/api/scraper/sync"
```

### Example 4: Get jobs from Seek only

```bash
curl -H "Authorization: Bearer {token}" \
  "http://localhost:5000/api/scraper/source/Seek?keywords=python"
```

---

## Performance Considerations

1. **Caching**: First request may take 10-30 seconds. Subsequent requests within 24 hours are instant.
2. **Rate Limiting**: Minimum 2 seconds between HTTP requests to avoid blocking.
3. **Database Sync**: Can handle 100+ jobs per sync operation.
4. **Memory**: Generates ~2-3MB cache files per 100 jobs.

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing/invalid JWT token
- `500 Internal Server Error` - Scraping or database error

**Error Response Format**:
```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

---

## Integration with Job Pipeline

The scraper is fully integrated with the existing job management system:

1. **Database Storage**: `/api/scraper/sync` inserts jobs into `jobs` table
2. **Job Search**: Search results include scraped jobs via `/api/jobs/search`
3. **Clustering**: Jobs are grouped by domain automatically
4. **Matching**: User profiles matched against scraped jobs

---

## Future Enhancements

- Additional job boards (LinkedIn, Glassdoor, Monster)
- Advanced skill extraction with ML
- Real-time job updates (webhook integration)
- Job description analysis and categorization
- Salary trend analysis
- Industry insights and reports

---

## Support

For issues or questions, contact the development team or check logs:
```bash
# View backend logs
tail -f /var/log/lazyscaper/backend.log

# View cache directory
ls -la /home/gautham/lazyscaper/backend/.cache/
```
