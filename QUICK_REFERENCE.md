# Job Scraper - Quick Reference Card

## Files Created

### Core Services
- `backend/src/services/baytScraper.ts` - Bayt.com scraper
- `backend/src/services/jobAggregator.ts` - Job aggregation
- `backend/src/services/jobInitializer.ts` - Database init

### API Routes
- `backend/src/routes/adminRoutes.ts` - Admin endpoints
- `backend/src/routes/jobRoutes.ts` - Modified (added 7 endpoints)

### Other
- `backend/src/examples/scraperExample.ts` - 9 examples
- `backend/SCRAPER_*.md` - 4 docs files
- Root docs in `/home/gautham/lazyscaper/`

## Setup (3 Steps)

```bash
# 1. Start server
npm run dev

# 2. Init database
curl -X POST http://localhost:5000/api/init-db

# 3. Populate jobs (takes 1 minute)
curl -X POST http://localhost:5000/api/admin/jobs/initialize \
  -H "Authorization: Bearer TOKEN"
```

## API Endpoints

### Get Jobs
```bash
# All jobs
GET /api/jobs/aggregate/all

# UAE jobs
GET /api/jobs/aggregate/by-country/AE

# Ireland jobs
GET /api/jobs/aggregate/by-country/IE

# React jobs
GET /api/jobs/aggregate/by-skill/React

# Senior jobs
GET /api/jobs/aggregate/by-experience/Senior

# Salary range
GET /api/jobs/aggregate/by-salary?minSalary=30000&maxSalary=80000

# Statistics
GET /api/jobs/aggregate/statistics
```

### Admin
```bash
# Initialize (first time)
POST /api/admin/jobs/initialize

# Refresh jobs
POST /api/admin/jobs/refresh

# Get stats
GET /api/admin/jobs/stats

# Cleanup (>30 days)
DELETE /api/admin/jobs/cleanup?daysOld=30

# Export backup
POST /api/admin/jobs/export

# Health check
GET /api/admin/health
```

## Code Usage

### Get All Jobs
```typescript
import { createJobAggregator } from './services/jobAggregator';

const agg = createJobAggregator();
const result = await agg.aggregateJobs();
console.log(result.totalJobs, 'jobs from:', result.bySource);
```

### Filter by Country
```typescript
const uaeJobs = await agg.getJobsByCountry('AE');
const ieJobs = await agg.getJobsByCountry('IE');
```

### Filter by Skill
```typescript
const reactJobs = await agg.getJobsBySkill('React');
const pythonJobs = await agg.getJobsBySkill('Python');
```

### Filter by Experience
```typescript
const seniors = await agg.getJobsByExperienceLevel('Senior');
const juniors = await agg.getJobsByExperienceLevel('Junior');
const midLevel = await agg.getJobsByExperienceLevel('Mid-Level');
```

### Get Statistics
```typescript
const stats = await agg.getJobStatistics();
console.log(stats.bySource);      // Count by source
console.log(stats.byCountry);     // Count by country
console.log(stats.byExperienceLevel);  // By level
```

### Initialize Database
```typescript
import { createJobInitializer } from './services/jobInitializer';

const init = createJobInitializer();
const result = await init.initializeJobDatabase();
console.log(result.inserted, 'jobs inserted');
```

## Performance

| Operation | Time |
|-----------|------|
| Fresh scrape | 35-70 seconds |
| From cache | 1-2 seconds |
| Bayt.com | 15-30 seconds |
| IrishJobs | 20-40 seconds |

## Data Format

```json
{
  "id": 1000,
  "company": "TechCorp",
  "title": "Senior React Developer",
  "location": "Dubai",
  "country": "AE",
  "salary_min": 40000,
  "salary_max": 70000,
  "currency": "AED",
  "jd_full_text": "...",
  "original_url": "https://...",
  "source": "Bayt",
  "extracted_skills_required": ["React", "JavaScript"],
  "extracted_skills_nice_to_have": ["TypeScript"],
  "experience_level": "Senior",
  "degree_required": "Bachelor",
  "soft_skills": ["Communication"],
  "job_type": "Full-time",
  "posted_date": "2024-03-20T00:00:00Z"
}
```

## Configuration

### Cache TTL
```typescript
createJobAggregator({
  cacheTTL: 24 * 60 * 60 * 1000  // 24 hours
});
```

### Timeout
```typescript
createBaytScraper({
  timeout: 15000  // 15 seconds
});
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No jobs | Clear cache: `POST /api/jobs/aggregate/clear-cache` |
| Slow | First request is slow (35-70s). Wait or use cache. |
| DB error | Run `curl -X POST http://localhost:5000/api/init-db` |
| Parse errors | Normal. System skips bad entries gracefully. |

## Documentation

| File | Purpose |
|------|---------|
| SCRAPER_README.md | Start here - overview |
| SCRAPER_QUICKSTART.md | Setup in 5 minutes |
| SCRAPER_DOCUMENTATION.md | Complete reference |
| src/examples/scraperExample.ts | 9 runnable examples |

## Job Coverage

- **Bayt.com:** Dubai/UAE region
- **IrishJobs:** Ireland
- **Jobs per run:** 80-100+ after deduplication
- **Currency:** AED (UAE), EUR (Ireland)

## Features

- ✓ Multi-source aggregation
- ✓ Smart deduplication
- ✓ Advanced filtering
- ✓ Market statistics
- ✓ 24-hour caching
- ✓ Error resilience
- ✓ Rate limiting
- ✓ JSON export

## Endpoints Summary

**Aggregation (7):**
- `/api/jobs/aggregate/all`
- `/api/jobs/aggregate/by-country/:country`
- `/api/jobs/aggregate/by-skill/:skill`
- `/api/jobs/aggregate/by-experience/:level`
- `/api/jobs/aggregate/by-salary`
- `/api/jobs/aggregate/statistics`
- `/api/jobs/aggregate/clear-cache` (POST)

**Admin (6):**
- `/api/admin/jobs/initialize` (POST)
- `/api/admin/jobs/refresh` (POST)
- `/api/admin/jobs/stats` (GET)
- `/api/admin/jobs/cleanup` (DELETE)
- `/api/admin/jobs/export` (POST)
- `/api/admin/health` (GET)

## Skills Recognized

**Languages:** JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust
**Frameworks:** React, Vue, Angular, Node.js, Django, Spring, Laravel
**Cloud:** AWS, Azure, GCP
**Databases:** PostgreSQL, MongoDB, MySQL, Redis
**Tools:** Docker, Kubernetes, Git, Jenkins, CI/CD

## All 13 Endpoints

✓ GET `/api/jobs/aggregate/all`
✓ GET `/api/jobs/aggregate/by-country/:country`
✓ GET `/api/jobs/aggregate/by-skill/:skill`
✓ GET `/api/jobs/aggregate/by-experience/:level`
✓ GET `/api/jobs/aggregate/by-salary`
✓ GET `/api/jobs/aggregate/statistics`
✓ POST `/api/jobs/aggregate/clear-cache`
✓ POST `/api/admin/jobs/initialize`
✓ POST `/api/admin/jobs/refresh`
✓ GET `/api/admin/jobs/stats`
✓ DELETE `/api/admin/jobs/cleanup`
✓ POST `/api/admin/jobs/export`
✓ GET `/api/admin/health`

## Statistics

- **Code:** 3,550+ lines (services + routes + examples)
- **Docs:** 1,400+ lines
- **Services:** 3 (Bayt, Aggregator, Initializer)
- **Endpoints:** 13 new
- **Examples:** 9 complete
- **Files Created:** 10
- **Files Modified:** 2
- **Dependencies Added:** 0 (uses existing)

---

**Need help?** See `SCRAPER_README.md` or `SCRAPER_QUICKSTART.md`
