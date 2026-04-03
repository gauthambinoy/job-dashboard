# Job Scraper Quick Start Guide

## Installation

The scraper system is already integrated. It uses existing dependencies:
- `axios` - HTTP requests
- `cheerio` - HTML parsing
- `pg` - PostgreSQL database

## Quick Setup (5 minutes)

### 1. Initialize Database
```bash
curl -X POST http://localhost:5000/api/init-db
```

### 2. Populate with Jobs
```bash
curl -X POST http://localhost:5000/api/admin/jobs/initialize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This will:
- Scrape ~40-50 jobs from IrishJobs.ie
- Scrape ~30-50 jobs from Bayt.com
- Insert 85+ unique jobs into database

### 3. Verify Data
```bash
curl http://localhost:5000/api/admin/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Tasks

### Get All Jobs
```bash
curl http://localhost:5000/api/jobs/aggregate/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get UAE/Dubai Jobs
```bash
curl http://localhost:5000/api/jobs/aggregate/by-country/AE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get React Developer Jobs
```bash
curl http://localhost:5000/api/jobs/aggregate/by-skill/React \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Senior Level Jobs
```bash
curl http://localhost:5000/api/jobs/aggregate/by-experience/Senior \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Market Statistics
```bash
curl http://localhost:5000/api/jobs/aggregate/statistics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Refresh Data
```bash
curl -X POST http://localhost:5000/api/admin/jobs/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Programmatic Usage

### TypeScript
```typescript
import { createJobAggregator } from './services/jobAggregator';

const aggregator = createJobAggregator();

// Get all jobs
const result = await aggregator.aggregateJobs();
console.log(`Found ${result.totalJobs} jobs`);

// Filter by country
const uaeJobs = await aggregator.getJobsByCountry('AE');

// Filter by skill
const jsJobs = await aggregator.getJobsBySkill('JavaScript');

// Get statistics
const stats = await aggregator.getJobStatistics();
console.log('Statistics:', stats);
```

### Using Specific Scraper
```typescript
import { createBaytScraper } from './services/baytScraper';

const bayt = createBaytScraper();
const baytJobs = await bayt.scrapeJobs();
console.log(`Found ${baytJobs.length} jobs from Bayt.com`);
```

## Data Structure

Each job object contains:
```typescript
{
  id: 1000,
  company: "Tech Company Ltd",
  title: "Senior React Developer",
  location: "Dubai",
  country: "AE",
  salary_min: 40000,
  salary_max: 70000,
  currency: "AED",
  jd_full_text: "Full job description...",
  original_url: "https://bayt.com/en/view/...",
  source: "Bayt",
  extracted_skills_required: ["React", "JavaScript", "TypeScript"],
  extracted_skills_nice_to_have: ["Next.js", "Node.js"],
  experience_level: "Senior",
  degree_required: "Bachelor",
  soft_skills: ["Communication", "Leadership"],
  job_type: "Full-time",
  posted_date: "2024-03-20T10:00:00Z"
}
```

## Configuration

Default configuration (in code):
```typescript
// Bayt Scraper
{
  cacheDir: '.cache/bayt',
  cacheTTL: 24 * 60 * 60 * 1000,  // 24 hours
  maxRetries: 3,
  timeout: 15000  // 15 seconds
}

// Job Aggregator
{
  cacheDir: '.cache/jobs',
  cacheTTL: 24 * 60 * 60 * 1000,
  includeIrishJobs: true,
  includeBayt: true
}
```

To customize:
```typescript
import { createBaytScraper } from './services/baytScraper';

const customScraper = createBaytScraper({
  cacheTTL: 48 * 60 * 60 * 1000,  // 48 hours
  timeout: 20000,
  maxRetries: 5
});
```

## Troubleshooting

### "No jobs found"
1. Check network connection
2. Verify Bayt.com and IrishJobs.ie are accessible
3. Try refreshing cache: `POST /api/jobs/aggregate/clear-cache`

### "Database error"
1. Ensure database is running and initialized
2. Check database credentials in `.env`
3. Run: `POST /api/init-db`

### "Parse errors"
- These are normal (some job listings may be malformed)
- System gracefully skips problematic entries
- Check console logs for details

### Slow response
- First call does fresh scrape (30-70 seconds)
- Subsequent calls use cache (1-2 seconds)
- Clear cache for fresh data: `POST /api/jobs/aggregate/clear-cache`

## File Structure

```
backend/src/
├── services/
│   ├── baytScraper.ts          # Bayt.com scraper
│   ├── scraper.ts              # IrishJobs scraper
│   ├── jobAggregator.ts        # Aggregation service
│   └── jobInitializer.ts       # Database initialization
├── routes/
│   ├── jobRoutes.ts            # Job endpoints
│   └── adminRoutes.ts          # Admin endpoints
└── index.ts                    # Main app
```

## Performance

Typical times:
- Fresh scrape: 35-70 seconds
- From cache: 1-2 seconds
- Per-source scrape:
  - Bayt.com: 15-30 seconds
  - IrishJobs.ie: 20-40 seconds

## Next Steps

1. **Explore Data**
   - Use aggregate endpoints to browse jobs
   - Filter by skill, location, experience

2. **Set Up Automation**
   - Schedule `POST /api/admin/jobs/refresh` daily
   - Set cache TTL based on your needs

3. **Extend Functionality**
   - Add more job sources
   - Implement advanced filtering
   - Build recommendation engine

4. **Monitor & Maintain**
   - Check health: `GET /api/admin/health`
   - Clean up old data: `DELETE /api/admin/jobs/cleanup`
   - Export backups: `POST /api/admin/jobs/export`

## API Reference Summary

**Job Aggregation:**
- `GET /api/jobs/aggregate/all` - All jobs
- `GET /api/jobs/aggregate/by-country/:country` - By location
- `GET /api/jobs/aggregate/by-skill/:skill` - By skill
- `GET /api/jobs/aggregate/by-experience/:level` - By experience
- `GET /api/jobs/aggregate/by-salary` - By salary range
- `GET /api/jobs/aggregate/statistics` - Market stats
- `POST /api/jobs/aggregate/clear-cache` - Clear cache

**Admin:**
- `POST /api/admin/jobs/initialize` - Populate database
- `POST /api/admin/jobs/refresh` - Update jobs
- `GET /api/admin/jobs/stats` - Database stats
- `DELETE /api/admin/jobs/cleanup` - Delete old jobs
- `POST /api/admin/jobs/export` - Backup jobs
- `GET /api/admin/health` - System health

All endpoints require authentication.
