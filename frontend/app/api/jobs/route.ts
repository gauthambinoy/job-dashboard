import { NextRequest, NextResponse } from 'next/server';
import staticJobs from '../../../data/all-jobs.json';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  url?: string;
  source: string;
  type?: string;
  remote?: boolean;
  posted_at?: string;
  tags?: string[];
  matchScore: number;
}

export interface JobsApiResponse {
  results: Job[];
  total: number;
  page: number;
  totalPages: number;
  sourceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
  cached?: boolean;
  fallback?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api';

const COUNTRY_MAP: Record<string, string[]> = {
  Ireland: ['ireland', 'dublin', 'cork', 'galway', 'limerick', 'waterford'],
  'Dubai / UAE': ['dubai', 'uae', 'abu dhabi', 'emirates', 'sharjah'],
  Australia: [
    'australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide',
    'canberra', 'queensland', 'victoria', 'new south wales', 'wyndham',
  ],
  'United Kingdom': [
    'uk', 'united kingdom', 'london', 'manchester', 'birmingham', 'edinburgh',
    'glasgow', 'bristol', 'leeds', 'liverpool', 'cambridge', 'oxford', 'england',
    'scotland', 'wales', 'cheltenham',
  ],
  'United States': [
    'usa', 'united states', 'new york', 'san francisco', 'los angeles',
    'seattle', 'austin', 'boston', 'chicago', 'denver', 'atlanta', 'california',
    'texas', 'washington',
  ],
  Canada: ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'ontario', 'british columbia'],
  Germany: ['germany', 'berlin', 'munich', 'frankfurt', 'hamburg', 'münchen'],
  Netherlands: ['netherlands', 'amsterdam', 'rotterdam', 'the hague', 'utrecht', 'eindhoven'],
  France: ['france', 'paris', 'lyon', 'marseille', 'toulouse'],
  India: ['india', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'bengaluru', 'noida', 'gurgaon'],
  Singapore: ['singapore'],
  'New Zealand': ['new zealand', 'auckland', 'wellington', 'christchurch'],
  Remote: ['remote', 'anywhere', 'worldwide', 'global'],
};

const EXP_EXCLUDE: Record<string, string[]> = {
  graduate: ['senior', 'staff', 'principal', 'lead', 'head of', 'director', 'vp ', 'manager', 'architect'],
  junior: ['senior', 'staff', 'principal', 'lead', 'head of', 'director', 'vp '],
  mid: ['junior', 'intern', 'trainee', 'graduate', 'entry level', 'principal', 'staff', 'head of', 'director'],
  senior: ['junior', 'intern', 'trainee', 'graduate', 'entry level'],
  lead: ['junior', 'intern', 'trainee', 'graduate', 'entry level'],
};

// Seniority/level words to strip before title matching so that
// "Software Engineer" matches "Senior Software Engineer" etc.
const SENIORITY_WORDS = new Set([
  'junior', 'senior', 'lead', 'staff', 'principal', 'mid', 'mid-level',
  'entry', 'entry-level', 'graduate', 'intern', 'associate', 'head',
]);

// ─── Mock / sample data (fallback when no backend or file is available) ───────

const MOCK_JOBS: Omit<Job, 'matchScore'>[] = [
  {
    id: 'mock-1',
    title: 'Software Engineer',
    company: 'TechCorp',
    location: 'Dublin, Ireland',
    description: 'Build and maintain web applications using React and Node.js.',
    salary_min: 60000,
    salary_max: 85000,
    currency: 'EUR',
    url: 'https://example.com/job/1',
    source: 'sample',
    type: 'full_time',
    remote: false,
    posted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    tags: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: 'mock-2',
    title: 'Frontend Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    description: 'Create beautiful, responsive UIs with React and TypeScript.',
    salary_min: 55000,
    salary_max: 75000,
    currency: 'EUR',
    url: 'https://example.com/job/2',
    source: 'sample',
    type: 'full_time',
    remote: true,
    posted_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    tags: ['React', 'TypeScript', 'CSS'],
  },
  {
    id: 'mock-3',
    title: 'Backend Engineer',
    company: 'DataSystems Ltd',
    location: 'London, United Kingdom',
    description: 'Design scalable microservices with Go and PostgreSQL.',
    salary_min: 70000,
    salary_max: 100000,
    currency: 'GBP',
    url: 'https://example.com/job/3',
    source: 'sample',
    type: 'full_time',
    remote: false,
    posted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    tags: ['Go', 'PostgreSQL', 'Kubernetes'],
  },
  {
    id: 'mock-4',
    title: 'Full Stack Developer',
    company: 'Innovate AU',
    location: 'Sydney, Australia',
    description: 'Work across the stack — Python backend, React frontend.',
    salary_min: 90000,
    salary_max: 120000,
    currency: 'AUD',
    url: 'https://example.com/job/4',
    source: 'sample',
    type: 'full_time',
    remote: false,
    posted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    tags: ['Python', 'Django', 'React'],
  },
  {
    id: 'mock-5',
    title: 'DevOps Engineer',
    company: 'CloudOps GmbH',
    location: 'Berlin, Germany',
    description: 'Manage CI/CD pipelines, Kubernetes clusters and AWS infrastructure.',
    salary_min: 75000,
    salary_max: 110000,
    currency: 'EUR',
    url: 'https://example.com/job/5',
    source: 'sample',
    type: 'full_time',
    remote: true,
    posted_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    tags: ['Kubernetes', 'AWS', 'Terraform'],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function detectCountry(location: string): string {
  const loc = location.toLowerCase();
  for (const [country, keywords] of Object.entries(COUNTRY_MAP)) {
    if (keywords.some(kw => loc.includes(kw))) return country;
  }
  return 'Other';
}

/**
 * Strip seniority/level words from a title so that "Senior Software Engineer"
 * and "Software Engineer" share the same core tokens for matching.
 */
function coreTokens(title: string): string[] {
  return title
    .toLowerCase()
    // remove roman numerals / level suffixes like "II", "III", "IV"
    .replace(/\b(i{2,3}|iv|vi{0,3}|ix)\b/g, '')
    // keep only letters, digits, spaces
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !SENIORITY_WORDS.has(w));
}

function scoreJob(job: Omit<Job, 'matchScore'>, titles: string[]): number {
  let score = 50;
  const tl = job.title.toLowerCase();

  if (titles.length > 0) {
    if (titles.some(t => tl.includes(t.toLowerCase()))) score += 25;
    if (titles.some(t => tl === t.toLowerCase())) score += 10;
  } else {
    score += 15;
  }

  if (job.salary_min || job.salary_max) score += 5;

  if (job.posted_at) {
    const days = (Date.now() - new Date(job.posted_at).getTime()) / 86400000;
    if (days < 3) score += 10;
    else if (days < 7) score += 7;
    else if (days < 14) score += 4;
  }

  return Math.min(Math.round(score), 99);
}

function buildBreakdowns(jobs: Job[]): {
  sourceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
} {
  const sourceBreakdown: Record<string, number> = {};
  const countryBreakdown: Record<string, number> = {};

  for (const job of jobs) {
    sourceBreakdown[job.source] = (sourceBreakdown[job.source] || 0) + 1;
    const country = detectCountry(job.location || '');
    countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
  }

  return { sourceBreakdown, countryBreakdown };
}

// ─── Data loading ─────────────────────────────────────────────────────────────

/** Try to get jobs from the Express backend (public endpoint, no auth). */
async function fetchFromBackend(params: URLSearchParams): Promise<Omit<Job, 'matchScore'>[] | null> {
  const backendUrl = `${BACKEND_URL}/public/jobs?limit=500`;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 8000);

  try {
    const res = await fetch(backendUrl, { signal: ac.signal, next: { revalidate: 0 } });
    if (!res.ok) return null;
    const data = await res.json();
    const jobs: any[] = Array.isArray(data) ? data : (data.jobs || data.results || []);
    if (!jobs.length) return null;
    return jobs.map((j: any) => ({
      id: String(j.id ?? j._id ?? Math.random()),
      title: j.title || '',
      company: j.company || j.company_name || 'Unknown',
      location: j.location || '',
      description: j.jd_full_text || j.description || j.summary || '',
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      currency: j.currency,
      url: j.original_url || j.url || j.redirect_url || j.apply_url || '',
      source: j.source || 'backend',
      type: j.type || j.job_type || j.contract_time,
      remote: j.remote ?? j.is_remote ?? (j.location || '').toLowerCase().includes('remote'),
      posted_at: j.posted_date || j.posted_at || j.created_at || j.date,
      tags: j.extracted_skills_required || j.tags || j.skills || [],
    }));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Read the static all-jobs.json fallback file bundled with the frontend. */
function readStaticFile(): Omit<Job, 'matchScore'>[] | null {
  const raw = staticJobs as unknown;
  const arr = Array.isArray(raw)
    ? raw
    : (raw && typeof raw === 'object' && 'jobs' in raw && Array.isArray(raw.jobs))
      ? raw.jobs
      : (raw && typeof raw === 'object' && 'results' in raw && Array.isArray(raw.results))
        ? raw.results
        : [];

  return arr.length > 0 ? arr as Omit<Job, 'matchScore'>[] : null;
}

// ─── Filtering & pagination ───────────────────────────────────────────────────

function applyFilters(
  jobs: Omit<Job, 'matchScore'>[],
  params: {
    titles: string[];
    countries: string[];
    sources: string[];
    level: string;
    keywords: string;
  },
): Omit<Job, 'matchScore'>[] {
  const { titles, countries, sources, level, keywords } = params;
  const kw = keywords.toLowerCase();

  return jobs.filter(job => {
    const tl = (job.title || '').toLowerCase();
    const text = `${tl} ${job.description || ''}`.toLowerCase();
    const loc = (job.location || '').toLowerCase();
    const src = (job.source || '').toLowerCase();

    // Free-text keyword search across title, company, description
    if (kw && !`${tl} ${(job.company || '').toLowerCase()} ${text}`.includes(kw)) return false;

    // Source filter
    if (sources.length > 0 && !sources.some(s => src.includes(s.toLowerCase()))) return false;

    // ── Title match ──
    // Strip seniority words from both the search title and the job title,
    // then require that ALL core tokens from the search title appear in the
    // job title's core tokens. This lets "Software Engineer" match
    // "Senior Software Engineer", "Lead Software Engineer II", etc.
    if (titles.length > 0) {
      const jobCore = coreTokens(tl);
      const match = titles.some(t => {
        const searchCore = coreTokens(t);
        if (searchCore.length === 0) return tl.includes(t.toLowerCase());
        // Every core token from the search title must appear in the job title
        return searchCore.every(tok => jobCore.some(jt => jt.includes(tok) || tok.includes(jt)));
      });
      if (!match) return false;
    }

    // ── Country filter — STRICT ──
    // When specific countries are selected:
    //   - The job location must clearly match at least one selected country's keywords.
    //   - If the location is empty OR maps to "Other" (no known country), exclude it.
    //   - "Other" / unknown locations are never allowed through when a country filter is active.
    if (countries.length > 0) {
      if (!loc.trim()) return false; // empty location → exclude

      const detectedCountry = detectCountry(loc);

      // Allow through if the detected country is one of the selected ones
      const match = countries.some(c => {
        // Direct keyword check against the country's keyword list
        const kws = COUNTRY_MAP[c] || [c.toLowerCase()];
        return kws.some(kw => loc.includes(kw));
      });

      if (!match) return false; // location doesn't match any selected country
      if (detectedCountry === 'Other') return false; // vague location, no known country
    }

    // Experience-level filter
    if (level && EXP_EXCLUDE[level]) {
      if (EXP_EXCLUDE[level].some(kw => text.includes(kw))) return false;
    }

    return true;
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sp = url.searchParams;

  // ── Parse query params ──
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
  const limit = Math.min(500, Math.max(1, parseInt(sp.get('limit') || '20', 10)));
  const titles = sp.get('titles')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const countries = sp.get('countries')?.split(',').map(s => s.trim()).filter(Boolean) || [];
  // Accept both "source" and "sources" for flexibility
  const sources = (sp.get('sources') || sp.get('source') || '')
    .split(',').map(s => s.trim()).filter(Boolean);
  const level = sp.get('level') || '';
  const keywords = sp.get('q') || sp.get('keywords') || '';
  const isGraduate = sp.get('is_graduate') || '';
  const companyId = sp.get('company_id') || '';

  // ── Resolve raw jobs (cascade through data sources) ──
  let rawJobs: Omit<Job, 'matchScore'>[] = [];
  let isFallback = false;

  // 1. Try the PostgreSQL backend (primary source — populated by the pipeline)
  const backendParams = new URLSearchParams();
  backendParams.set('limit', '500');
  backendParams.set('page', '1');
  const dbJobs = await fetchFromBackend(backendParams);
  if (dbJobs && dbJobs.length > 0) {
    rawJobs.push(...dbJobs);
  }

  // 2. Also try the live scrape API for fresh results (Indeed, Adzuna, Remotive etc)
  try {
    const scrapeParams = new URLSearchParams();
    if (titles.length > 0) scrapeParams.set('titles', titles.slice(0, 5).join(','));
    if (countries.length > 0) scrapeParams.set('countries', countries.join(','));
    if (sources.length > 0) scrapeParams.set('sources', sources.join(','));
    const origin = req.nextUrl.origin;
    const scrapeRes = await fetch(`${origin}/api/scrape?${scrapeParams}`, { next: { revalidate: 0 } });
    if (scrapeRes.ok) {
      const scrapeData = await scrapeRes.json();
      const scrapeJobs: any[] = scrapeData.jobs || [];
      const mapped = scrapeJobs.map((j: any) => ({
        id: String(j.id ?? Math.random()),
        title: j.title || '',
        company: j.company || 'Unknown',
        location: j.location || '',
        description: j.description || '',
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        currency: j.currency,
        url: j.url || '',
        source: j.source || 'live',
        type: j.type,
        remote: j.remote,
        posted_at: j.posted_at,
        tags: j.tags || [],
      }));
      rawJobs.push(...mapped);
    }
  } catch { /* scrape API unavailable, continue with DB data */ }

  // 3. Try static file fallback
  if (rawJobs.length === 0) {
    const staticJobs = readStaticFile();
    if (staticJobs) {
      rawJobs = staticJobs;
      isFallback = true;
    }
  }

  // 4. Use built-in mock data so the UI always has something to show
  if (rawJobs.length === 0) {
    rawJobs = MOCK_JOBS;
    isFallback = true;
  }

  // Deduplicate by title+company
  const seen = new Set<string>();
  rawJobs = rawJobs.filter(j => {
    const key = `${j.title.toLowerCase()}|${j.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // ── Filter ──
  const filtered = applyFilters(rawJobs, { titles, countries, sources, level, keywords });

  // ── Score & sort ──
  const scored: Job[] = filtered
    .map(job => ({ ...job, matchScore: scoreJob(job, titles) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  // ── Breakdowns (computed over full filtered set, not just this page) ──
  const { sourceBreakdown, countryBreakdown } = buildBreakdowns(scored);

  // ── Paginate ──
  const total = scored.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const results = scored.slice((page - 1) * limit, page * limit);

  const response: JobsApiResponse & { fallback?: boolean } = {
    results,
    total,
    page,
    totalPages,
    sourceBreakdown,
    countryBreakdown,
    ...(isFallback ? { fallback: true } : {}),
  };

  return NextResponse.json(response);
}
