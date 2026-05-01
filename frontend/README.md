# Job Dashboard Frontend

Next.js 16 frontend for the Ireland Graduate Job Dashboard portfolio project.

## Run locally

```bash
npm ci
NEXT_PUBLIC_API_URL=http://localhost:5000/api BACKEND_URL=http://localhost:5000/api npm run dev
```

Open http://localhost:3000.

## Production build

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api npm run build
npm run start
```

## Important env vars

- `NEXT_PUBLIC_API_URL` — browser-visible Express API base URL.
- `BACKEND_URL` — server-side API base used by Next.js route handlers.
- `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` — optional Adzuna source health/live data.
- `RAPIDAPI_KEY` — optional JSearch live data.

## Data resilience

`app/api/jobs` tries backend data first, live serverless scraping second, bundled `data/all-jobs.json` third, then a tiny mock fallback. This keeps the recruiter demo usable even if an upstream job source is down.

## Deploy on Vercel

Set the project root to `frontend`, add the env vars above, and deploy. The included `next.config.ts` also supports standalone Docker builds.
