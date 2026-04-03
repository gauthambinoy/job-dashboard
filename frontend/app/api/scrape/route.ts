import { NextRequest, NextResponse } from 'next/server';

// ─── Types ───
interface RawJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  url: string;
  source: string;
  type?: string;
  remote?: boolean;
  posted_at?: string;
  tags?: string[];
}

// ─── Cache: keyed by filter hash, 5 min TTL ───
const cache = new Map<string, { jobs: RawJob[]; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// ─── Config ───
const AZ_ID = process.env.ADZUNA_APP_ID || '';
const AZ_KEY = process.env.ADZUNA_APP_KEY || '';
const RAPID = process.env.RAPIDAPI_KEY || '';

// ─── Fast fetch ───
async function f(url: string, headers?: Record<string, string>): Promise<any> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 8000);
  try {
    const r = await fetch(url, { signal: ac.signal, headers });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
  finally { clearTimeout(t); }
}

function strip(h: string): string {
  return h?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) || '';
}

// ─── Country → Adzuna code mapping ───
const COUNTRY_AZ: Record<string, string> = {
  'Australia': 'au', 'United Kingdom': 'gb', 'United States': 'us',
  'Canada': 'ca', 'Germany': 'de', 'India': 'in', 'Singapore': 'sg',
  'New Zealand': 'nz', 'Netherlands': 'nl', 'France': 'fr',
};
const AZ_CURRENCY: Record<string, string> = {
  au: 'AUD', gb: 'GBP', us: 'USD', ca: 'CAD', de: 'EUR',
  in: 'INR', sg: 'SGD', nz: 'NZD', nl: 'EUR', fr: 'EUR', za: 'ZAR',
};

// ─── Country → JSearch query suffix ───
const COUNTRY_JS: Record<string, string> = {
  'Ireland': 'Ireland', 'Dubai': 'Dubai', 'Australia': 'Australia',
  'United Kingdom': 'UK', 'United States': 'USA', 'Canada': 'Canada',
  'Germany': 'Germany', 'India': 'India', 'Singapore': 'Singapore',
  'Netherlands': 'Netherlands', 'France': 'France', 'New Zealand': 'New Zealand',
  'Dubai / UAE': 'Dubai',
};

// ─── Source name constants (used for filtering) ───
const SOURCE_ADZUNA       = 'adzuna';
const SOURCE_JSEARCH      = 'jsearch';
const SOURCE_REMOTIVE     = 'remotive';
const SOURCE_ARBEITNOW    = 'arbeitnow';
const SOURCE_JOBICY       = 'jobicy';
const SOURCE_HIMALAYAS    = 'himalayas';
const SOURCE_REMOTEOK     = 'remoteok';
const SOURCE_IRISH_CO     = 'jsearch-irish';
const SOURCE_WORKINGNOMADS = 'workingnomads';
const SOURCE_NOFLUFFJOBS  = 'nofluffjobs';
const SOURCE_LANDINGJOBS  = 'landingjobs';
const SOURCE_HACKERNEWS   = 'hackernews';
const SOURCE_DEVITJOBS    = 'devitjobs';

// Remote-only sources
const REMOTE_SOURCES = new Set([
  SOURCE_REMOTIVE, SOURCE_ARBEITNOW, SOURCE_JOBICY,
  SOURCE_HIMALAYAS, SOURCE_REMOTEOK, SOURCE_WORKINGNOMADS,
]);

// Ireland-specific sources
const IRELAND_SOURCES = new Set([
  SOURCE_IRISH_CO,
]);

// ═══════════════════════════════════════
// TARGETED source pullers
// ═══════════════════════════════════════

async function adzunaSearch(terms: string[], countryCodes: string[], extraQueries?: { code: string; term: string }[]): Promise<RawJob[]> {
  if (!AZ_ID || !AZ_KEY) return [];
  const codes = countryCodes.length > 0 ? countryCodes : ['au', 'gb', 'us', 'ca', 'de', 'in'];
  const searchTerms = terms.length > 0 ? terms : ['software engineer', 'developer'];

  const fetches = codes.flatMap(c =>
    searchTerms.slice(0, 4).map(t =>
      f(`https://api.adzuna.com/v1/api/jobs/${c}/search/1?app_id=${AZ_ID}&app_key=${AZ_KEY}&results_per_page=25&what=${encodeURIComponent(t)}`)
        .then(d => {
          if (!d?.results) return [];
          return d.results.map((r: any) => ({
            id: `az-${r.id}`, title: r.title || '', company: r.company?.display_name || 'Unknown',
            location: r.location?.display_name || c.toUpperCase(),
            description: strip(r.description || ''),
            salary_min: r.salary_min, salary_max: r.salary_max,
            currency: AZ_CURRENCY[c] || 'USD', url: r.redirect_url || '',
            source: SOURCE_ADZUNA, type: r.contract_time || 'full_time',
            remote: false, posted_at: r.created, tags: [r.category?.label].filter(Boolean),
          }));
        })
    )
  );

  // Extra targeted queries (e.g. Ireland-related searches on GB Adzuna)
  const extraFetches = (extraQueries || []).map(({ code, term }) =>
    f(`https://api.adzuna.com/v1/api/jobs/${code}/search/1?app_id=${AZ_ID}&app_key=${AZ_KEY}&results_per_page=25&what=${encodeURIComponent(term)}`)
      .then(d => {
        if (!d?.results) return [];
        return d.results.map((r: any) => ({
          id: `az-${r.id}`, title: r.title || '', company: r.company?.display_name || 'Unknown',
          location: r.location?.display_name || code.toUpperCase(),
          description: strip(r.description || ''),
          salary_min: r.salary_min, salary_max: r.salary_max,
          currency: AZ_CURRENCY[code] || 'USD', url: r.redirect_url || '',
          source: SOURCE_ADZUNA, type: r.contract_time || 'full_time',
          remote: false, posted_at: r.created, tags: [r.category?.label].filter(Boolean),
        }));
      })
  );

  const allFetches = [...fetches, ...extraFetches];
  return (await Promise.allSettled(allFetches)).flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

// Ireland-targeted graduate/internship queries for JSearch
const IRELAND_GRAD_QUERIES = [
  'graduate programme Ireland',
  'internship Ireland 2026',
  'entry level Ireland',
  'graduate Dublin',
];

async function jsearchSearch(terms: string[], countries: string[]): Promise<RawJob[]> {
  if (!RAPID) return [];
  const locs = countries.length > 0 ? countries.map(c => COUNTRY_JS[c] || c) : ['Ireland', 'Dubai', 'Australia', 'UK'];
  const titles = terms.length > 0 ? terms.slice(0, 3) : ['software engineer'];

  // Add Ireland graduate queries when Ireland is in scope or no countries specified
  const includesIreland = countries.length === 0 || countries.includes('Ireland');
  const irelandQueries = includesIreland ? IRELAND_GRAD_QUERIES : [];

  const mapJSearchResult = (d: any): RawJob[] => {
    if (!d?.data) return [];
    return d.data.map((r: any) => ({
      id: `js-${r.job_id}`, title: r.job_title || '', company: r.employer_name || 'Unknown',
      location: `${r.job_city || ''}, ${r.job_country || ''}`.replace(/^, |, $/g, ''),
      description: strip(r.job_description || ''),
      salary_min: r.job_min_salary, salary_max: r.job_max_salary,
      currency: r.job_salary_currency || 'USD', url: r.job_apply_link || '',
      source: SOURCE_JSEARCH, type: r.job_employment_type?.toLowerCase() || 'full_time',
      remote: r.job_is_remote || false, posted_at: r.job_posted_at_datetime_utc, tags: [],
    }));
  };

  const fetches = locs.flatMap(loc =>
    titles.map(t =>
      f(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(t + ' in ' + loc)}&num_pages=1&page=1`,
        { 'x-rapidapi-key': RAPID, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' }
      ).then(mapJSearchResult)
    )
  );

  // Ireland-specific graduate/internship queries
  const irelandFetches = irelandQueries.map(q =>
    f(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(q)}&num_pages=1&page=1`,
      { 'x-rapidapi-key': RAPID, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' }
    ).then(mapJSearchResult)
  );

  const allFetches = [...fetches, ...irelandFetches];
  return (await Promise.allSettled(allFetches)).flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

async function remotiveSearch(terms: string[]): Promise<RawJob[]> {
  const cats = ['software-dev', 'devops', 'data', 'frontend-dev', 'backend-dev'];
  const fetches = cats.map(cat =>
    f(`https://remotive.com/api/remote-jobs?category=${cat}&limit=25&search=${encodeURIComponent(terms[0] || '')}`)
      .then(d => {
        if (!d?.jobs) return [];
        return d.jobs.map((r: any) => ({
          id: `rm-${r.id}`, title: r.title || '', company: r.company_name || 'Unknown',
          location: r.candidate_required_location || 'Remote',
          description: strip(r.description || ''), url: r.url || '',
          source: SOURCE_REMOTIVE, type: r.job_type || 'full_time',
          remote: true, posted_at: r.publication_date, tags: r.tags || [],
        }));
      })
  );
  return (await Promise.allSettled(fetches)).flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

async function arbeitnowSearch(): Promise<RawJob[]> {
  const d = await f('https://www.arbeitnow.com/api/job-board-api');
  if (!d?.data) return [];
  return d.data.slice(0, 60).map((r: any) => ({
    id: `an-${r.slug}`, title: r.title || '', company: r.company_name || 'Unknown',
    location: r.location || 'Europe', description: strip(r.description || ''),
    url: r.url || '', source: SOURCE_ARBEITNOW, type: r.job_types?.[0] || 'full_time',
    remote: r.remote || false,
    posted_at: r.created_at ? new Date(r.created_at * 1000).toISOString() : undefined,
    tags: r.tags || [],
  }));
}

async function jobicySearch(): Promise<RawJob[]> {
  const d = await f('https://jobicy.com/api/v2/remote-jobs?count=40&tag=engineering');
  if (!d?.jobs) return [];
  return d.jobs.map((r: any) => ({
    id: `jc-${r.id}`, title: r.jobTitle || '', company: r.companyName || 'Unknown',
    location: r.jobGeo || 'Remote', description: strip(r.jobDescription || r.jobExcerpt || ''),
    salary_min: r.minSalary, salary_max: r.maxSalary, currency: r.currency || 'USD',
    url: r.url || '', source: SOURCE_JOBICY, type: r.employmentType || 'full_time',
    remote: true, posted_at: r.pubDate, tags: r.jobIndustry || [],
  }));
}

async function himalayasSearch(): Promise<RawJob[]> {
  const d = await f('https://himalayas.app/jobs/api?limit=40');
  if (!d?.jobs) return [];
  return d.jobs.map((r: any) => ({
    id: `hm-${r.id || r.title}`, title: r.title || '', company: r.companyName || 'Unknown',
    location: r.locationRestrictions?.join(', ') || 'Remote',
    description: strip(r.description || r.excerpt || ''),
    salary_min: r.minSalary, salary_max: r.maxSalary, currency: r.currency || 'USD',
    url: `https://himalayas.app/jobs/${r.slug || ''}`, source: SOURCE_HIMALAYAS,
    type: r.employmentType || 'full_time', remote: true, tags: r.seniority || [],
  }));
}

async function remoteokSearch(): Promise<RawJob[]> {
  const d = await f('https://remoteok.com/api');
  if (!Array.isArray(d)) return [];
  return d.slice(1, 60).map((r: any) => ({
    id: `ro-${r.id}`, title: r.position || '', company: r.company || 'Unknown',
    location: r.location || 'Remote', description: strip(r.description || ''),
    salary_min: r.salary_min || undefined, salary_max: r.salary_max || undefined,
    url: r.apply_url || r.url || '', source: SOURCE_REMOTEOK, type: 'full_time',
    remote: true, posted_at: r.date, tags: r.tags || [],
  }));
}

// ─── Irish Job Sources ───

// ─── Irish company search via JSearch (working API source) ───

const IRISH_COMPANIES = [
  'AIB', 'Bank of Ireland', 'Accenture Ireland', 'Deloitte Ireland',
  'KPMG Ireland', 'PwC Ireland', 'EY Ireland', 'ESB', 'Google Dublin',
  'Amazon Dublin', 'Microsoft Dublin', 'Meta Dublin', 'Salesforce Dublin',
  'Apple Cork', 'Intel Ireland', 'Pfizer Ireland', 'Ryanair', 'Kerry Group',
  'Stripe Dublin', 'HubSpot Dublin',
];

async function irishCompanySearch(): Promise<RawJob[]> {
  if (!RAPID) return [];
  // Search top 10 Irish companies for graduate/internship roles via JSearch
  const companies = IRISH_COMPANIES.slice(0, 10);
  const suffixes = ['graduate', 'internship'];

  const fetches = companies.flatMap(company =>
    suffixes.map(suffix =>
      f(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(company + ' ' + suffix)}&num_pages=1&page=1`,
        { 'x-rapidapi-key': RAPID, 'x-rapidapi-host': 'jsearch.p.rapidapi.com' }
      ).then(d => {
        if (!d?.data) return [];
        return d.data.map((r: any) => ({
          id: `ic-${r.job_id}`, title: r.job_title || '', company: r.employer_name || company,
          location: `${r.job_city || ''}, ${r.job_country || ''}`.replace(/^, |, $/g, ''),
          description: strip(r.job_description || ''),
          salary_min: r.job_min_salary, salary_max: r.job_max_salary,
          currency: r.job_salary_currency || 'EUR', url: r.job_apply_link || '',
          source: SOURCE_IRISH_CO, type: r.job_employment_type?.toLowerCase() || 'full_time',
          remote: r.job_is_remote || false, posted_at: r.job_posted_at_datetime_utc,
          tags: ['irish-company', suffix],
        }));
      })
    )
  );
  return (await Promise.allSettled(fetches)).flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

// ─── WorkingNomads (remote jobs) ───
async function workingNomadsSearch(): Promise<RawJob[]> {
  const d = await f('https://www.workingnomads.com/api/exposed_jobs/');
  if (!Array.isArray(d)) return [];
  return d.slice(0, 60).map((r: any) => ({
    id: `wn-${r.url || r.title}`, title: r.title || '', company: r.company_name || 'Unknown',
    location: r.location || 'Remote', description: strip(r.description || ''),
    url: r.url || '', source: SOURCE_WORKINGNOMADS, type: 'full_time',
    remote: true, posted_at: r.pub_date,
    tags: [r.category_name, ...(r.tags || '').split(',').map((t: string) => t.trim())].filter(Boolean),
  }));
}

// ─── NoFluffJobs (EU tech jobs) ───
async function noFluffJobsSearch(): Promise<RawJob[]> {
  const d = await f('https://nofluffjobs.com/api/posting');
  if (!d?.postings) return [];
  return d.postings.slice(0, 60).map((r: any) => ({
    id: `nf-${r.id || r.url || r.title}`, title: r.title || '', company: r.name || 'Unknown',
    location: r.location?.places?.map((p: any) => p.city || p.country).join(', ') || 'Europe',
    description: '', url: r.url ? `https://nofluffjobs.com/job/${r.url}` : '',
    source: SOURCE_NOFLUFFJOBS, type: r.seniority?.[0] || 'full_time',
    remote: false, posted_at: r.posted ? new Date(r.posted).toISOString() : undefined,
    tags: [r.category, ...(r.seniority || [])].filter(Boolean),
  }));
}

// ─── LandingJobs (EU tech jobs) ───
async function landingJobsSearch(): Promise<RawJob[]> {
  const d = await f('https://landing.jobs/api/v1/jobs?limit=50');
  if (!d?.jobs) return [];
  return d.jobs.map((r: any) => ({
    id: `lj-${r.id || r.title}`, title: r.title || '', company: r.company_name || 'Unknown',
    location: [r.city, r.country_code].filter(Boolean).join(', ') || 'Europe',
    description: strip(r.main_requirements || ''),
    url: r.url || '', source: SOURCE_LANDINGJOBS, type: 'full_time',
    remote: false, posted_at: r.published_at,
    tags: r.tags || [],
  }));
}

// ─── YC / HackerNews Jobs ───
async function hackerNewsSearch(): Promise<RawJob[]> {
  const ids = await f('https://hacker-news.firebaseio.com/v0/jobstories.json');
  if (!Array.isArray(ids)) return [];
  const fetches = ids.slice(0, 30).map((id: number) =>
    f(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((r: any) => {
      if (!r) return null;
      // Company name is usually before the first pipe or dash in the title
      const titleStr = r.title || '';
      const sep = titleStr.match(/^(.*?)\s*[|–—-]\s*/);
      const company = sep ? sep[1].trim() : 'YC Company';
      const jobTitle = sep ? titleStr.slice(sep[0].length).trim() : titleStr;
      return {
        id: `hn-${r.id}`, title: jobTitle || titleStr, company,
        location: 'Unknown', description: strip(r.text || ''),
        url: r.url || `https://news.ycombinator.com/item?id=${r.id}`,
        source: SOURCE_HACKERNEWS, type: 'full_time',
        remote: false, posted_at: r.time ? new Date(r.time * 1000).toISOString() : undefined,
        tags: ['ycombinator'],
      } as RawJob;
    })
  );
  const results = await Promise.allSettled(fetches);
  return results
    .filter((r): r is PromiseFulfilledResult<RawJob | null> => r.status === 'fulfilled')
    .map(r => r.value)
    .filter((j): j is RawJob => j !== null);
}

// ─── DevITjobs (UK tech jobs) ───
async function devITJobsSearch(): Promise<RawJob[]> {
  const d = await f('https://devitjobs.uk/api/jobsearch?title=developer&maxResults=50');
  if (!Array.isArray(d)) return [];
  return d.map((r: any) => ({
    id: `dv-${r.id || r.url || r.title}`, title: r.title || '', company: r.company || 'Unknown',
    location: r.location || 'United Kingdom', description: '',
    salary_min: r.salary?.from || undefined, salary_max: r.salary?.to || undefined,
    currency: 'GBP', url: r.url || '', source: SOURCE_DEVITJOBS, type: 'full_time',
    remote: false, posted_at: r.created,
    tags: r.skills || [],
  }));
}

// ─── Dedup ───
function dedup(jobs: RawJob[]): RawJob[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    if (!j.title) return false;
    const key = `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Source selector ─────────────────────────────────────────────────────────

/**
 * Given the requested countries and explicit source filters, return the set of
 * source names that should actually be scraped.
 *
 * Rules:
 *  - If `requestedSources` is non-empty, only scrape those sources (intersected
 *    with what would have run anyway).
 *  - If countries are specified, skip sources that are irrelevant to those
 *    countries:
 *      Ireland   → adzuna (gb), jsearch, gradireland, irishjobs, publicjobs, jsearch-irish
 *      Australia → adzuna (au), jsearch
 *      Remote    → remotive, remoteok, jobicy, himalayas, arbeitnow
 *      Other countries that have Adzuna codes → adzuna + jsearch
 *  - If no countries are specified, run everything.
 */
function selectSources(countries: string[], requestedSources: string[]): Set<string> {
  // All available source names
  const ALL = new Set([
    SOURCE_ADZUNA, SOURCE_JSEARCH, SOURCE_REMOTIVE, SOURCE_ARBEITNOW,
    SOURCE_JOBICY, SOURCE_HIMALAYAS, SOURCE_REMOTEOK, SOURCE_IRISH_CO,
    SOURCE_WORKINGNOMADS, SOURCE_NOFLUFFJOBS, SOURCE_LANDINGJOBS,
    SOURCE_HACKERNEWS, SOURCE_DEVITJOBS,
  ]);

  let active: Set<string>;

  if (countries.length === 0) {
    // No country filter → run everything
    active = new Set(ALL);
  } else {
    active = new Set<string>();

    for (const country of countries) {
      if (country === 'Remote') {
        // Remote sources
        for (const s of REMOTE_SOURCES) active.add(s);
        // JSearch can return remote jobs too
        active.add(SOURCE_JSEARCH);
        active.add(SOURCE_HACKERNEWS);
      } else if (country === 'Ireland') {
        active.add(SOURCE_ADZUNA);   // will search gb with Ireland terms
        active.add(SOURCE_JSEARCH);
        for (const s of IRELAND_SOURCES) active.add(s);
        active.add(SOURCE_LANDINGJOBS);   // EU tech jobs
        active.add(SOURCE_NOFLUFFJOBS);   // EU tech jobs
        active.add(SOURCE_HACKERNEWS);
      } else if (country === 'United Kingdom') {
        active.add(SOURCE_ADZUNA);
        active.add(SOURCE_JSEARCH);
        active.add(SOURCE_DEVITJOBS);     // UK tech jobs
        active.add(SOURCE_LANDINGJOBS);   // EU tech jobs
        active.add(SOURCE_NOFLUFFJOBS);   // EU tech jobs
        active.add(SOURCE_HACKERNEWS);
      } else if (country === 'Australia') {
        active.add(SOURCE_ADZUNA);   // au code
        active.add(SOURCE_JSEARCH);
        active.add(SOURCE_HACKERNEWS);
      } else if (['Germany', 'France', 'Netherlands'].includes(country)) {
        active.add(SOURCE_JSEARCH);
        if (COUNTRY_AZ[country]) active.add(SOURCE_ADZUNA);
        active.add(SOURCE_LANDINGJOBS);   // EU tech jobs
        active.add(SOURCE_NOFLUFFJOBS);   // EU tech jobs
        active.add(SOURCE_HACKERNEWS);
      } else {
        // Any country that has an Adzuna code gets adzuna + jsearch
        active.add(SOURCE_JSEARCH);
        if (COUNTRY_AZ[country]) active.add(SOURCE_ADZUNA);
        active.add(SOURCE_HACKERNEWS);
      }
    }
  }

  // If the caller explicitly requested specific sources, intersect
  if (requestedSources.length > 0) {
    const req = new Set(requestedSources.map(s => s.toLowerCase()));
    for (const s of active) {
      if (!req.has(s)) active.delete(s);
    }
  }

  return active;
}

// ═══════════════════════════════════════
// Main handler — accepts filter params
// ═══════════════════════════════════════
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const titles = url.searchParams.get('titles')?.split(',').filter(Boolean) || [];
  const countries = url.searchParams.get('countries')?.split(',').filter(Boolean) || [];
  // Accept comma-separated list of source names to restrict scraping
  const requestedSources = (url.searchParams.get('sources') || '')
    .split(',').map(s => s.trim()).filter(Boolean);

  // Build cache key from filters
  const cacheKey = `${titles.sort().join('|')}::${countries.sort().join('|')}::${requestedSources.sort().join('|')}`;

  // Return cache if fresh
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return NextResponse.json({
      jobs: cached.jobs,
      total: cached.jobs.length,
      cached: true,
      age: Math.round((Date.now() - cached.ts) / 1000),
    });
  }

  const start = Date.now();

  // Build targeted search terms from selected titles
  const searchTerms = titles.length > 0
    ? [...new Set(titles.map(t => t.toLowerCase()))]
    : [];

  // Map countries to Adzuna codes
  const azCodes = countries
    .map(c => COUNTRY_AZ[c])
    .filter(Boolean) as string[];

  // Build Ireland-related Adzuna extra queries (search GB with Ireland terms)
  const includesIreland = countries.length === 0 || countries.includes('Ireland');
  const azIrelandExtras = includesIreland
    ? [
        { code: 'gb', term: 'graduate Ireland' },
        { code: 'gb', term: 'internship Dublin' },
      ]
    : [];

  // Determine which sources to actually run
  const activeSources = selectSources(countries, requestedSources);

  // Build the list of scraper tasks, skipping inactive sources
  type ScraperEntry = [string, Promise<RawJob[]>];
  const scraperTasks: ScraperEntry[] = [];

  if (activeSources.has(SOURCE_ADZUNA)) {
    scraperTasks.push([SOURCE_ADZUNA, adzunaSearch(searchTerms, azCodes, azIrelandExtras)]);
  }
  if (activeSources.has(SOURCE_JSEARCH)) {
    scraperTasks.push([SOURCE_JSEARCH, jsearchSearch(searchTerms, countries)]);
  }
  if (activeSources.has(SOURCE_REMOTIVE)) {
    scraperTasks.push([SOURCE_REMOTIVE, remotiveSearch(searchTerms)]);
  }
  if (activeSources.has(SOURCE_ARBEITNOW)) {
    scraperTasks.push([SOURCE_ARBEITNOW, arbeitnowSearch()]);
  }
  if (activeSources.has(SOURCE_JOBICY)) {
    scraperTasks.push([SOURCE_JOBICY, jobicySearch()]);
  }
  if (activeSources.has(SOURCE_HIMALAYAS)) {
    scraperTasks.push([SOURCE_HIMALAYAS, himalayasSearch()]);
  }
  if (activeSources.has(SOURCE_REMOTEOK)) {
    scraperTasks.push([SOURCE_REMOTEOK, remoteokSearch()]);
  }
  if (activeSources.has(SOURCE_IRISH_CO)) {
    scraperTasks.push([SOURCE_IRISH_CO, irishCompanySearch()]);
  }
  if (activeSources.has(SOURCE_WORKINGNOMADS)) {
    scraperTasks.push([SOURCE_WORKINGNOMADS, workingNomadsSearch()]);
  }
  if (activeSources.has(SOURCE_NOFLUFFJOBS)) {
    scraperTasks.push([SOURCE_NOFLUFFJOBS, noFluffJobsSearch()]);
  }
  if (activeSources.has(SOURCE_LANDINGJOBS)) {
    scraperTasks.push([SOURCE_LANDINGJOBS, landingJobsSearch()]);
  }
  if (activeSources.has(SOURCE_HACKERNEWS)) {
    scraperTasks.push([SOURCE_HACKERNEWS, hackerNewsSearch()]);
  }
  if (activeSources.has(SOURCE_DEVITJOBS)) {
    scraperTasks.push([SOURCE_DEVITJOBS, devITJobsSearch()]);
  }

  const results = await Promise.allSettled(scraperTasks.map(([, p]) => p));

  const allJobs: RawJob[] = [];
  const sourceStats: Record<string, number> = {};

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const job of result.value) {
        sourceStats[job.source] = (sourceStats[job.source] || 0) + 1;
      }
      allJobs.push(...result.value);
    }
  }

  const jobs = dedup(allJobs);
  const elapsed = Date.now() - start;

  // Cache by filter key
  cache.set(cacheKey, { jobs, ts: Date.now() });

  // Clean old cache entries (keep max 20)
  if (cache.size > 20) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].ts - b[1].ts);
    for (let i = 0; i < oldest.length - 20; i++) cache.delete(oldest[i][0]);
  }

  return NextResponse.json({
    jobs,
    total: jobs.length,
    raw: allJobs.length,
    sources: sourceStats,
    elapsed_ms: elapsed,
    cached: false,
    active_sources: [...activeSources],
  });
}
