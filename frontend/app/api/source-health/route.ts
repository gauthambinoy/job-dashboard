import { NextResponse } from 'next/server';

interface SourceHealth {
  name: string;
  url: string;
  type: 'api' | 'scrape' | 'aggregator';
  status: 'ok' | 'error';
  latencyMs: number;
  jobCount?: number;
  error?: string;
}

async function check(
  name: string,
  url: string,
  type: 'api' | 'scrape' | 'aggregator',
  timeout = 8000,
  headers?: Record<string, string>,
): Promise<SourceHealth> {
  const start = Date.now();
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), timeout);
    const res = await fetch(url, {
      signal: ac.signal,
      headers: {
        'User-Agent': 'JobDashboard/1.0',
        Accept: 'application/json,text/html',
        ...headers,
      },
    });
    clearTimeout(t);
    const latencyMs = Date.now() - start;

    if (!res.ok) return { name, url, type, status: 'error', latencyMs, error: `HTTP ${res.status}` };

    let jobCount: number | undefined;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('json')) {
      try {
        const data = await res.json();
        if (Array.isArray(data)) jobCount = data.length;
        else if (data.data && Array.isArray(data.data)) jobCount = data.data.length;
        else if (data.results && Array.isArray(data.results)) jobCount = data.results.length;
        else if (data.jobs && Array.isArray(data.jobs)) jobCount = data.jobs.length;
        else if (data.postings && Array.isArray(data.postings)) jobCount = data.postings.length;
      } catch {}
    }

    return { name, url, type, status: 'ok', latencyMs, jobCount };
  } catch (err) {
    return { name, url, type, status: 'error', latencyMs: Date.now() - start, error: err instanceof Error ? err.message : 'timeout' };
  }
}

function skippedSource(name: string, url: string, type: 'api' | 'scrape' | 'aggregator', reason: string): SourceHealth {
  return { name, url, type, status: 'error', latencyMs: 0, error: reason };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const adzunaAppId = process.env.ADZUNA_APP_ID;
  const adzunaAppKey = process.env.ADZUNA_APP_KEY;
  const rapidApiKey = process.env.RAPIDAPI_KEY;

  const checks = await Promise.all([
    // ── Free JSON APIs (primary data sources) ──
    check('RemoteOK', 'https://remoteok.com/api', 'api'),
    check('Arbeitnow', 'https://www.arbeitnow.com/api/job-board-api?page=1', 'api'),
    check('Jobicy', 'https://jobicy.com/api/v2/remote-jobs?count=5', 'api'),
    check('The Muse', 'https://www.themuse.com/api/public/jobs?page=1', 'api'),
    check('Remotive', 'https://remotive.com/api/remote-jobs?limit=5', 'api'),
    check('Himalayas', 'https://himalayas.app/jobs/api?limit=5', 'api'),
    check('Working Nomads', 'https://www.workingnomads.com/api/exposed_jobs/', 'api'),
    check('NoFluffJobs', 'https://nofluffjobs.com/api/posting', 'api'),
    check('Landing.jobs', 'https://landing.jobs/api/v1/jobs?limit=5', 'api'),
    check('DevITjobs', 'https://devitjobs.uk/api/jobsearch?title=developer&maxResults=5', 'api'),
    check('YC Jobs', 'https://hacker-news.firebaseio.com/v0/jobstories.json', 'api'),

    // ── API key sources ──
    adzunaAppId && adzunaAppKey
      ? check(
          'Adzuna',
          `https://api.adzuna.com/v1/api/jobs/gb/search/1?app_id=${encodeURIComponent(adzunaAppId)}&app_key=${encodeURIComponent(adzunaAppKey)}&what=developer&results_per_page=3`,
          'api',
        )
      : skippedSource('Adzuna', 'https://api.adzuna.com/v1/api/jobs/gb/search/1', 'api', 'ADZUNA_APP_ID/ADZUNA_APP_KEY not configured'),
    rapidApiKey
      ? check(
          'JSearch (Indeed+LinkedIn)',
          'https://jsearch.p.rapidapi.com/search?query=developer+ireland&num_pages=1',
          'api',
          6000,
          { 'x-rapidapi-key': rapidApiKey, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' },
        )
      : skippedSource('JSearch (Indeed+LinkedIn)', 'https://jsearch.p.rapidapi.com/search', 'api', 'RAPIDAPI_KEY not configured'),

    // ── HTML scrape sources ──
    check('GradIreland', 'https://gradireland.com/graduate-jobs', 'scrape', 10000),
    check('Jobs.ie', 'https://www.jobs.ie/jobs/graduate/', 'scrape', 10000),
    check('IrishJobs.ie', 'https://www.irishjobs.ie/jobs', 'scrape', 10000),
    check('LinkedIn', 'https://www.linkedin.com/jobs/search/?keywords=graduate+ireland', 'scrape', 10000),
    check('Glassdoor', 'https://www.glassdoor.ie/Job/ireland-graduate-jobs-SRCH_IL.0,7_IN104_KO8,16.htm', 'scrape', 10000),
    check('Indeed Ireland', 'https://ie.indeed.com/jobs?q=graduate+developer&l=Ireland', 'scrape', 10000),

    // ── Aggregators (portals we link to) ──
    check('Google Jobs', 'https://www.google.com/search?q=graduate+developer+ireland+jobs', 'aggregator', 10000),
    check('PublicJobs.ie', 'https://www.publicjobs.ie', 'aggregator', 10000),
  ]);

  const working = checks.filter(c => c.status === 'ok').length;
  const apis = checks.filter(c => c.type === 'api');
  const apisWorking = apis.filter(c => c.status === 'ok').length;

  return NextResponse.json({
    sources: checks,
    summary: {
      total: checks.length,
      working,
      failed: checks.length - working,
      apiSources: apis.length,
      apiWorking: apisWorking,
    },
    checkedAt: new Date().toISOString(),
  });
}
