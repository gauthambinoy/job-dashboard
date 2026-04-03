# Job Scraper System Documentation

## Overview

The job scraper system provides comprehensive job aggregation from multiple regional job portals:
- **IrishJobs** - Ireland-focused job listings
- **Bayt.com** - Middle East/UAE job listings

The system includes intelligent deduplication, caching, and filtering capabilities.

## Architecture

### Core Components

#### 1. BaytScraper (`/src/services/baytScraper.ts`)
Specialized scraper for Bayt.com - the leading Middle East job portal.

**Features:**
- Fetches real job listings for Dubai/UAE region
- Intelligent HTML parsing with multiple selector patterns
- Automatic skill extraction from job descriptions
- Experience level and degree requirement detection
- Local file-based caching (24-hour TTL)
- Handles rate limiting with delays between requests
- Robust error handling with retry logic

**Key Methods:**
```typescript
// Main scraping method
async scrapeJobs(): Promise<Job[]>

// Search specific keywords/locations
private async searchJobs(keywords: string, location: string): Promise<RawBaytJob[]>

// Parse individual job elements
private parseJobElement($: CheerioAPI, element: Element): RawBaytJob | null

// Fetch detailed job information
private async fetchJobDetails(jobUrl: string): Promise<Partial<RawBaytJob> | null>
```

**Extracted Data:**
- Job title and company name
- Location (Dubai, Abu Dhabi, UAE)
- Salary (parsed and converted to min/max range)
- Full job description
- Technical skills (from predefined tech stack list)
- Soft skills (communication, leadership, etc.)
- Experience level (Junior, Mid-Level, Senior, Entry-Level)
- Degree requirements (Bachelor, Master, High School, etc.)
- Job type (Full-time, Part-time, Contract)
- Posted date

**Technical Skills Recognized:**
Languages: JavaScript, TypeScript, Python, Java, C++, C#, .NET, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala
Frameworks: React, Vue, Angular, Node.js, Express, Django, Flask, Spring, etc.
Cloud: AWS, Azure, GCP
Tools: Docker, Kubernetes, Jenkins, Git, GitHub, GitLab
Databases: SQL, MongoDB, PostgreSQL, MySQL, Redis, Elasticsearch
Practices: Microservices, CI/CD, Agile, Scrum, DevOps

#### 2. IndeedScraper (`/src/services/scraper.ts`)
IrishJobs.ie web scraper for Ireland-focused job listings.

**Features:**
- Real job data from IrishJobs.ie
- Multi-page scraping (up to 10 pages)
- Salary range extraction
- Skill-based filtering
- Cache with stale-cache fallback

#### 3. JobAggregator (`/src/services/jobAggregator.ts`)
Intelligent job aggregation service that combines results from multiple sources.

**Features:**
- Merges jobs from IrishJobs and Bayt.com
- Automatic deduplication (by title, company, country)
- Intelligent ranking by relevance
- Source-agnostic statistics
- Multi-level filtering:
  - By country (IE, AE, etc.)
  - By skill
  - By experience level
  - By salary range
- Configurable caching

**Key Methods:**
```typescript
// Fetch all jobs from all sources
async aggregateJobs(): Promise<AggregationResult>

// Filter by country
async getJobsByCountry(country: string): Promise<Job[]>

// Filter by skill
async getJobsBySkill(skill: string): Promise<Job[]>

// Filter by experience level
async getJobsByExperienceLevel(level: 'Junior' | 'Mid-Level' | 'Senior'): Promise<Job[]>

// Filter by salary range
async getJobsBySalaryRange(minSalary: number, maxSalary: number): Promise<Job[]>

// Get market statistics
async getJobStatistics(): Promise<JobStats>
```

#### 4. JobInitializer (`/src/services/jobInitializer.ts`)
Database initialization and management service.

**Features:**
- Populate database from scrapers
- Refresh existing data
- Database statistics
- Cleanup old jobs
- JSON export functionality

**Key Methods:**
```typescript
// Initialize database with all scraped jobs
async initializeJobDatabase(): Promise<InitResult>

// Refresh existing jobs
async refreshJobs(): Promise<RefreshResult>

// Get database statistics
async getDatabaseStats(): Promise<DatabaseStats>

// Delete jobs older than N days
async deleteOldJobs(daysOld: number): Promise<DeleteResult>

// Export jobs to JSON
async exportJobsToJson(filename?: string): Promise<string>
```

## API Endpoints

### Job Aggregation Endpoints
All endpoints require authentication.

#### GET `/api/jobs/aggregate/all`
Returns aggregated jobs from all sources.

**Response:**
```json
{
  "totalJobs": 85,
  "bySource": {
    "IrishJobs": 40,
    "Bayt": 45
  },
  "jobs": [...],
  "aggregatedAt": "2024-04-01T10:30:00.000Z"
}
```

#### GET `/api/jobs/aggregate/by-country/:country`
Get jobs for specific country (IE, AE, etc.).

**Example:** `GET /api/jobs/aggregate/by-country/AE`

#### GET `/api/jobs/aggregate/by-skill/:skill`
Get jobs requiring specific skill.

**Example:** `GET /api/jobs/aggregate/by-skill/React`

#### GET `/api/jobs/aggregate/by-experience/:level`
Filter by experience level: Junior, Mid-Level, Senior.

**Example:** `GET /api/jobs/aggregate/by-experience/Senior`

#### GET `/api/jobs/aggregate/by-salary?minSalary=30000&maxSalary=80000`
Filter by salary range.

#### GET `/api/jobs/aggregate/statistics`
Get market statistics and trends.

**Response:**
```json
{
  "totalJobs": 85,
  "bySource": { "IrishJobs": 40, "Bayt": 45 },
  "byCountry": { "IE": 40, "AE": 45 },
  "byExperienceLevel": { "Senior": 20, "Mid-Level": 50, "Junior": 15 },
  "byJobType": { "Full-time": 80, "Contract": 5 },
  "averageSalaryByCountry": {
    "IE": { "min": 45000, "max": 75000 },
    "AE": { "min": 40000, "max": 70000 }
  }
}
```

#### POST `/api/jobs/aggregate/clear-cache`
Manually clear aggregated jobs cache.

### Admin Endpoints
Protected admin endpoints for job management.

#### POST `/api/admin/jobs/initialize`
Initialize database with jobs from all scrapers.

**Response:**
```json
{
  "success": true,
  "message": "Successfully initialized database: 85 new jobs inserted, 0 duplicates skipped",
  "inserted": 85,
  "skipped": 0,
  "errors": []
}
```

#### POST `/api/admin/jobs/refresh`
Update existing jobs with fresh data.

#### GET `/api/admin/jobs/stats`
Get database job statistics.

**Response:**
```json
{
  "totalJobs": 85,
  "bySource": { "IrishJobs": 40, "Bayt": 45 },
  "byCountry": { "IE": 40, "AE": 45 },
  "byExperienceLevel": { "Senior": 20, "Mid-Level": 50, "Junior": 15 },
  "oldestJob": "2024-03-15T00:00:00.000Z",
  "newestJob": "2024-04-01T12:00:00.000Z"
}
```

#### DELETE `/api/admin/jobs/cleanup?daysOld=30`
Delete jobs older than specified days.

#### POST `/api/admin/jobs/export`
Export all jobs to JSON file.

**Request Body:**
```json
{
  "filename": "jobs_backup_2024.json"
}
```

#### GET `/api/admin/health`
Health check for scraper system.

## Usage Examples

### JavaScript/TypeScript

```typescript
import { createJobAggregator } from './services/jobAggregator';
import { createBaytScraper } from './services/baytScraper';
import { createJobInitializer } from './services/jobInitializer';

// Scrape just Bayt.com
const baytScraper = createBaytScraper();
const baytJobs = await baytScraper.scrapeJobs();

// Aggregate from all sources
const aggregator = createJobAggregator();
const result = await aggregator.aggregateJobs();
console.log(`Found ${result.totalJobs} jobs from sources:`, result.bySource);

// Get UAE jobs
const uaeJobs = await aggregator.getJobsByCountry('AE');

// Get React developer jobs
const reactJobs = await aggregator.getJobsBySkill('React');

// Get senior positions
const seniorJobs = await aggregator.getJobsByExperienceLevel('Senior');

// Initialize database
const initializer = createJobInitializer();
const initResult = await initializer.initializeJobDatabase();
console.log(initResult.message);

// Get statistics
const stats = await aggregator.getJobStatistics();
```

### cURL Examples

```bash
# Get all aggregated jobs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/jobs/aggregate/all

# Get UAE jobs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/jobs/aggregate/by-country/AE

# Get React developer jobs
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/jobs/aggregate/by-skill/React

# Get market statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/jobs/aggregate/statistics

# Initialize database (admin)
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/admin/jobs/initialize

# Clear cache
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  https://api.example.com/api/jobs/aggregate/clear-cache
```

## Caching Strategy

### Location
- BaytScraper: `.cache/bayt/`
- Aggregator: `.cache/jobs/`
- IrishJobs: `.scraper_cache/`

### TTL (Time-To-Live)
- Default: 24 hours
- Configurable per scraper/aggregator

### Cache Invalidation
```typescript
// Manual cache clear
aggregator.clearCache();

// Cache expires automatically after TTL
// Stale cache is used as fallback on errors
```

## Error Handling

The system implements comprehensive error handling:

1. **Network Errors**: Automatic retry with exponential backoff
2. **Parse Errors**: Graceful degradation, skip malformed jobs
3. **Database Errors**: Clear error messages with status codes
4. **Timeout**: Configurable per scraper (default 15-30 seconds)

```typescript
// Example error handling
try {
  const jobs = await aggregator.aggregateJobs();
} catch (error) {
  console.error('Aggregation failed:', error.message);
  // Falls back to stale cache if available
}
```

## Rate Limiting

- Bayt.com: 2-3 second delay between requests
- IrishJobs: 2-3 second delay between page requests
- Maximum 10 pages per scrape session

## Performance Metrics

Typical performance:
- Bayt scrape: 15-30 seconds (for 30-50 jobs)
- IrishJobs scrape: 20-40 seconds (for 50+ jobs)
- Aggregation: 1-2 seconds (from cache)
- First aggregation: 35-70 seconds (fresh data)

## Data Quality

### Deduplication
Jobs are deduplicated by:
1. Title (case-insensitive)
2. Company (case-insensitive)
3. Country code

When duplicates found, the job with more complete data is kept.

### Ranking
Jobs are ranked by:
1. Salary information availability
2. Number of extracted skills
3. Posted date (newer first)

## Database Schema

Jobs stored in `jobs` table with fields:
- id: Auto-incremented ID
- company: Company name
- title: Job title
- location: Job location
- country: ISO country code (IE, AE)
- salary_min, salary_max: Salary range
- currency: Currency code (EUR, AED)
- jd_full_text: Full job description
- original_url: Source URL (unique constraint)
- source: Data source (IrishJobs, Bayt)
- extracted_skills_required: Array of required technical skills
- extracted_skills_nice_to_have: Array of optional skills
- experience_level: Junior, Mid-Level, Senior, Entry-Level
- degree_required: Education requirement
- soft_skills: Array of soft skills
- job_type: Full-time, Part-time, Contract
- posted_date: When job was posted
- created_at, updated_at: Timestamp tracking

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/jobs_db

# API
API_PORT=5000
FRONTEND_URL=http://localhost:3000

# Scraping
SCRAPER_TIMEOUT=30000
SCRAPER_CACHE_TTL=86400000
```

### Scraper Configuration
```typescript
const baytScraper = createBaytScraper({
  cacheDir: '/custom/cache/path',
  cacheTTL: 48 * 60 * 60 * 1000, // 48 hours
  maxRetries: 5,
  timeout: 20000, // 20 seconds
  userAgent: 'Custom User Agent'
});

const aggregator = createJobAggregator({
  includeIrishJobs: true,
  includeBayt: true,
  cacheDir: '/custom/cache/path',
  cacheTTL: 24 * 60 * 60 * 1000
});
```

## Monitoring & Maintenance

### Health Check
```bash
curl https://api.example.com/api/admin/health
```

### Regular Maintenance Tasks
```typescript
// Weekly cleanup (delete jobs older than 30 days)
POST /api/admin/jobs/cleanup?daysOld=30

// Monthly backup
POST /api/admin/jobs/export

// Refresh stale data
POST /api/admin/jobs/refresh
```

### Logging
All scrapers log to console:
- INFO: Job counts, cache operations
- WARN: Parsing errors, network issues
- ERROR: Critical failures, uncaught exceptions

## Troubleshooting

### No jobs returned
1. Check network connectivity
2. Verify Bayt.com and IrishJobs.ie are accessible
3. Check cache directory permissions
4. Review error logs for parsing issues

### Database insert failures
1. Verify `original_url` uniqueness
2. Check database connectivity
3. Ensure columns match schema

### Slow performance
1. Clear cache if too large
2. Increase timeout values
3. Check network latency
4. Consider implementing database indexing on frequently filtered fields

## Future Enhancements

Potential improvements:
- Additional job portals (LinkedIn, Indeed, Glassdoor)
- Advanced NLP skill extraction
- Salary prediction models
- Job market trend analysis
- Real-time notifications
- Job recommendations engine
- Automated salary benchmarking

## Support

For issues or questions:
1. Check logs in console output
2. Verify environment variables
3. Test individual scrapers separately
4. Review error messages in API responses
5. Check database connectivity
