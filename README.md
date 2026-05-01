# Ireland Graduate Job Dashboard

A production-oriented graduate job intelligence dashboard for Ireland-focused tech job hunting. It combines live job APIs, targeted Irish graduate sources, deduplication, search/filtering, analytics, and a polished Next.js portfolio UI.

**Live demo:** https://job-dashboard-chi-rose.vercel.app
**Best portfolio framing:** “I built a job-market data product to automate my own graduate job search, with scraping, normalization, dedupe, analytics, and deployable frontend/backend services.”

## Why this project stands out

- **Real user problem:** helps graduates discover, compare, and track Ireland/remote-friendly roles faster.
- **End-to-end system:** data ingestion, caching, PostgreSQL persistence, API routes, dashboard UX, Docker, and CI.
- **Recruiter-friendly product surface:** public demo, source-health page, analytics, search, company directory, tracker, and CV studio.
- **Startup-ready direction:** the pipeline can grow into alerts, CV tailoring, employer intelligence, and application CRM features.

## Screenshots / demo checklist

The live demo is the primary showcase. Before pinning the repo, add 3–5 images to the GitHub repo or README assets:

1. Landing page hero showing “Ireland Graduate Roles 2026”.
2. Search results filtered to Ireland + graduate/junior software roles.
3. Analytics dashboard with source/country/skills breakdowns.
4. Source health page proving live data integrations.
5. Tracker or CV studio as the user workflow screenshot.

## Architecture

```text
frontend/ Next.js 16 + TypeScript + MUI/Tailwind
  ├─ app/                 Product pages and serverless API routes
  ├─ app/api/jobs          Public search endpoint with DB/live/static fallback
  ├─ app/api/scrape        Live multi-source fetcher for serverless deployments
  ├─ app/api/source-health Integration health checks
  └─ data/                 Static fallback job dataset and graduate company index

backend/ Express + TypeScript + PostgreSQL
  ├─ src/services/*Scraper.ts  Source-specific scrapers/API clients
  ├─ src/services/jobAggregator.ts  Multi-source aggregation + cache
  ├─ src/services/jobPipeline.ts    Dedupe + database upsert pipeline
  ├─ src/scripts/refreshJobs.ts     Scheduled refresh entry point
  └─ schema.sql                    PostgreSQL schema and indexes
```

## Data pipeline

1. **Collect** from free JSON APIs and targeted graduate sources: RemoteOK, Arbeitnow, Jobicy, The Muse, GradIreland/Jobs.ie-style sources, Adzuna, and optional RapidAPI JSearch.
2. **Normalize** each source into a common job shape: title, company, location, description, salary, source, URL, tags, and posted date.
3. **Deduplicate** by source URL in PostgreSQL and by title/company in the frontend fallback path.
4. **Score and filter** roles by target titles, countries, seniority exclusions, keywords, source, recency, and salary availability.
5. **Serve resiliently:** frontend first tries the backend, then live serverless scraping, then bundled static data, then a small mock fallback so the demo never appears empty.

## Tech stack

- **Frontend:** Next.js 16, React 19, TypeScript, MUI, Tailwind, Recharts/Chart.js, Axios.
- **Backend:** Node.js 20, Express 5, TypeScript, PostgreSQL, Jest/Supertest.
- **Infra:** Vercel-ready frontend, Railway/Docker-ready backend, GitHub Actions CI, Dockerfiles for both services.

## Local setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL 15+ if running the backend with persistence

### 1) Configure environment

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Set at least:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lazyscaper
JWT_SECRET=<strong local secret>
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
BACKEND_URL=http://localhost:5000/api
```

Optional live-data keys:

```bash
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
RAPIDAPI_KEY=
```

### 2) Install and run

```bash
cd backend && npm ci && npm run dev
# new terminal
cd frontend && npm ci && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

### 3) Initialize and refresh data

Create the schema in your Postgres database with `backend/schema.sql`, then run:

```bash
cd backend
npm run refresh-jobs
```

For a no-database demo, the frontend still works from `frontend/data/all-jobs.json` and live serverless sources.

## Validation scripts

```bash
# Backend
cd backend
npm test
npm run build

# Frontend
cd frontend
npm run build
npm run lint
```

Current CI runs backend tests/build, frontend build, and Docker build checks on pushes/PRs.

## Free deployment path

### Frontend: Vercel

1. Import this GitHub repo into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://<your-backend-domain>/api`
   - `BACKEND_URL=https://<your-backend-domain>/api`
   - Optional: `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `RAPIDAPI_KEY`
4. Deploy. The frontend can still demo from static/live serverless fallback data while backend setup is in progress.

### Backend + Postgres: Railway free/low-cost style setup

1. Create a Railway project from `backend/`.
2. Add a Railway Postgres database.
3. Set backend variables:
   - `DATABASE_URL` from Railway Postgres
   - `JWT_SECRET` strong random value
   - `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
   - `NODE_ENV=production`
   - Optional API keys above
4. Deploy using the included `backend/Dockerfile` / `backend/railway.toml`.
5. Run the SQL in `backend/schema.sql`, then run `npm run refresh-jobs` from a Railway shell/job.

## Scheduled scraping

Use one of these free/simple options:

- **GitHub Actions cron:** add a workflow that installs backend deps and runs `npm run refresh-jobs` with `DATABASE_URL` and API keys from repository secrets.
- **Railway cron/job:** schedule `npm run refresh-jobs` every 6–12 hours.
- **Manual refresh:** run `cd backend && npm run refresh-jobs` before demos or interviews.

Recommended cadence: every 8 hours for active job-search mode; daily for portfolio/demo mode.

## API highlights

- `GET /health` — backend + database health.
- `GET /api/public/jobs?limit=100` — public jobs feed for the frontend.
- `GET /api/jobs/search` — authenticated backend search.
- `POST /api/matching/calculate/:userId/:jobId` — match scoring.
- `GET /api/analytics/:userId/stats` — analytics summary.
- `GET /api/source-health` — frontend integration health dashboard.

## CI/CD

`.github/workflows/ci.yml` checks:

- backend `npm test`
- backend `npm run build`
- frontend `npm run build`
- Docker image build for frontend/backend

## Security notes

- Real `.env`, `.env.local`, `.vercel`, caches, build output, and `node_modules` are gitignored.
- API keys are optional and must be stored in host/GitHub secrets, not committed.
- The public frontend endpoint has static/mock fallback data to preserve demo reliability without exposing protected backend routes.

## Roadmap

- Add GitHub Actions scheduled scraper workflow after backend database hosting is finalized.
- Add README screenshots/GIFs from the live Vercel demo.
- Add saved-job auth flow to the public demo or mark private features clearly.
- Add email/Discord alerts for new high-match graduate roles.
- Add employer intelligence pages: hiring window, visa friendliness, grad programme status, and application deadlines.

## License

MIT
