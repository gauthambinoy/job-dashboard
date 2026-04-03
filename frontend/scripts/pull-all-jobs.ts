#!/usr/bin/env npx tsx
/**
 * Unified Job Puller — pulls from all available free APIs
 * Run: npx tsx scripts/pull-all-jobs.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── Types ───
interface Job {
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
  type?: string;        // full_time, part_time, contract
  remote?: boolean;
  posted_at?: string;
  tags?: string[];
}

// ─── Config ───
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '0f81e522';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

const SEARCH_TERMS = ['software engineer', 'frontend developer', 'backend developer', 'data engineer', 'devops engineer', 'fullstack developer'];
const OUTPUT_DIR = path.join(__dirname, '..', 'data');

// ─── Helpers ───
async function fetchJSON(url: string, headers?: Record<string, string>): Promise<any> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (e: any) {
    console.error(`  ✗ Failed: ${url.slice(0, 80)}... — ${e.message}`);
    return null;
  }
}

function dedup(jobs: Job[]): Job[] {
  const seen = new Set<string>();
  return jobs.filter(j => {
    const key = `${j.title.toLowerCase().trim()}|${j.company.toLowerCase().trim()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stripHTML(html: string): string {
  return html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1000) || '';
}

// ─── Source 1: Adzuna (AU, GB, US, CA, DE, FR, NL, IN, NZ, SG, ZA, BR) ───
async function pullAdzuna(): Promise<Job[]> {
  if (!ADZUNA_APP_KEY) { console.log('  ⚠ Adzuna: no API key, skipping'); return []; }
  const countries = ['au', 'gb', 'us', 'ca', 'de', 'fr', 'nl', 'in', 'nz', 'sg', 'za'];
  const jobs: Job[] = [];

  for (const country of countries) {
    for (const term of SEARCH_TERMS.slice(0, 3)) { // top 3 terms to stay in rate limits
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=50&what=${encodeURIComponent(term)}`;
      const data = await fetchJSON(url);
      if (!data?.results) continue;

      for (const r of data.results) {
        jobs.push({
          id: `adzuna-${r.id}`,
          title: r.title || '',
          company: r.company?.display_name || 'Unknown',
          location: r.location?.display_name || country.toUpperCase(),
          description: stripHTML(r.description || ''),
          salary_min: r.salary_min,
          salary_max: r.salary_max,
          currency: country === 'au' ? 'AUD' : country === 'gb' ? 'GBP' : country === 'us' ? 'USD' : country === 'ca' ? 'CAD' : country === 'in' ? 'INR' : 'EUR',
          url: r.redirect_url || '',
          source: 'adzuna',
          type: r.contract_time || 'full_time',
          remote: false,
          posted_at: r.created,
          tags: [r.category?.label || ''].filter(Boolean),
        });
      }
      console.log(`  ✓ Adzuna ${country.toUpperCase()} "${term}": ${data.results.length} jobs`);
    }
  }
  return jobs;
}

// ─── Source 2: JSearch via RapidAPI (LinkedIn + Indeed + Glassdoor) ───
async function pullJSearch(): Promise<Job[]> {
  if (!RAPIDAPI_KEY) { console.log('  ⚠ JSearch: no API key, skipping'); return []; }
  const jobs: Job[] = [];
  const queries = [
    'software engineer in Ireland',
    'software engineer in Dubai',
    'software engineer in Australia',
    'frontend developer in Dublin',
    'backend developer in UAE',
    'data engineer in Melbourne',
  ];

  for (const query of queries) {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1&page=1`;
    const data = await fetchJSON(url, {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
    });
    if (!data?.data) continue;

    for (const r of data.data) {
      jobs.push({
        id: `jsearch-${r.job_id}`,
        title: r.job_title || '',
        company: r.employer_name || 'Unknown',
        location: `${r.job_city || ''}, ${r.job_country || ''}`.replace(/^, |, $/g, ''),
        description: stripHTML(r.job_description || ''),
        salary_min: r.job_min_salary,
        salary_max: r.job_max_salary,
        currency: r.job_salary_currency || 'USD',
        url: r.job_apply_link || '',
        source: 'jsearch',
        type: r.job_employment_type?.toLowerCase() || 'full_time',
        remote: r.job_is_remote || false,
        posted_at: r.job_posted_at_datetime_utc,
        tags: [],
      });
    }
    console.log(`  ✓ JSearch "${query}": ${data.data.length} jobs`);
  }
  return jobs;
}

// ─── Source 3: Remotive (Free, no key) ───
async function pullRemotive(): Promise<Job[]> {
  const jobs: Job[] = [];
  const categories = ['software-dev', 'devops', 'data', 'frontend-dev', 'backend-dev'];

  for (const cat of categories) {
    const url = `https://remotive.com/api/remote-jobs?category=${cat}&limit=50`;
    const data = await fetchJSON(url);
    if (!data?.jobs) continue;

    for (const r of data.jobs) {
      jobs.push({
        id: `remotive-${r.id}`,
        title: r.title || '',
        company: r.company_name || 'Unknown',
        location: r.candidate_required_location || 'Remote',
        description: stripHTML(r.description || ''),
        salary_min: undefined,
        salary_max: undefined,
        url: r.url || '',
        source: 'remotive',
        type: r.job_type || 'full_time',
        remote: true,
        posted_at: r.publication_date,
        tags: r.tags || [],
      });
    }
    console.log(`  ✓ Remotive "${cat}": ${data.jobs.length} jobs`);
  }
  return jobs;
}

// ─── Source 4: Arbeitnow (Free, no key — EU/Remote) ───
async function pullArbeitnow(): Promise<Job[]> {
  const url = 'https://www.arbeitnow.com/api/job-board-api';
  const data = await fetchJSON(url);
  if (!data?.data) return [];

  const jobs = data.data.map((r: any) => ({
    id: `arbeitnow-${r.slug}`,
    title: r.title || '',
    company: r.company_name || 'Unknown',
    location: r.location || 'Europe',
    description: stripHTML(r.description || ''),
    url: r.url || '',
    source: 'arbeitnow',
    type: r.job_types?.[0] || 'full_time',
    remote: r.remote || false,
    posted_at: r.created_at ? new Date(r.created_at * 1000).toISOString() : undefined,
    tags: r.tags || [],
  }));
  console.log(`  ✓ Arbeitnow: ${jobs.length} jobs`);
  return jobs;
}

// ─── Source 5: Jobicy (Free, no key — Remote) ───
async function pullJobicy(): Promise<Job[]> {
  const url = 'https://jobicy.com/api/v2/remote-jobs?count=50&tag=engineering';
  const data = await fetchJSON(url);
  if (!data?.jobs) return [];

  const jobs = data.jobs.map((r: any) => ({
    id: `jobicy-${r.id}`,
    title: r.jobTitle || '',
    company: r.companyName || 'Unknown',
    location: r.jobGeo || 'Remote',
    description: stripHTML(r.jobDescription || r.jobExcerpt || ''),
    salary_min: r.minSalary,
    salary_max: r.maxSalary,
    currency: r.currency || 'USD',
    url: r.url || '',
    source: 'jobicy',
    type: r.employmentType || 'full_time',
    remote: true,
    posted_at: r.pubDate,
    tags: r.jobIndustry || [],
  }));
  console.log(`  ✓ Jobicy: ${jobs.length} jobs`);
  return jobs;
}

// ─── Source 6: Himalayas (Free, no key — Remote) ───
async function pullHimalayas(): Promise<Job[]> {
  const url = 'https://himalayas.app/jobs/api?limit=50';
  const data = await fetchJSON(url);
  if (!data?.jobs) return [];

  const jobs = data.jobs.map((r: any) => ({
    id: `himalayas-${r.id || r.title}`,
    title: r.title || '',
    company: r.companyName || 'Unknown',
    location: r.locationRestrictions?.join(', ') || 'Remote',
    description: stripHTML(r.description || r.excerpt || ''),
    salary_min: r.minSalary,
    salary_max: r.maxSalary,
    currency: r.currency || 'USD',
    url: `https://himalayas.app/jobs/${r.slug || ''}`,
    source: 'himalayas',
    type: r.employmentType || 'full_time',
    remote: true,
    posted_at: r.pubDate,
    tags: r.seniority || [],
  }));
  console.log(`  ✓ Himalayas: ${jobs.length} jobs`);
  return jobs;
}

// ─── Source 7: RemoteOK (Free, no key) ───
async function pullRemoteOK(): Promise<Job[]> {
  const data = await fetchJSON('https://remoteok.com/api');
  if (!Array.isArray(data)) return [];

  // First element is legal notice, skip it
  const listings = data.slice(1);
  const jobs = listings.slice(0, 100).map((r: any) => ({
    id: `remoteok-${r.id}`,
    title: r.position || '',
    company: r.company || 'Unknown',
    location: r.location || 'Remote',
    description: stripHTML(r.description || ''),
    salary_min: r.salary_min || undefined,
    salary_max: r.salary_max || undefined,
    url: r.apply_url || r.url || '',
    source: 'remoteok',
    type: 'full_time',
    remote: true,
    posted_at: r.date,
    tags: r.tags || [],
  }));
  console.log(`  ✓ RemoteOK: ${jobs.length} jobs`);
  return jobs;
}

// ─── Source 8: DevITjobs UK (Free, no key) ───
async function pullDevITjobs(): Promise<Job[]> {
  const data = await fetchJSON('https://devitjobs.uk/api/jobsLight');
  if (!Array.isArray(data)) return [];

  const jobs = data.slice(0, 100).map((r: any) => ({
    id: `devitjobs-${r._id}`,
    title: r.title || r.jobUrl || '',
    company: r.company || 'Unknown',
    location: r.actualCity || r.cityCategory || 'UK',
    description: '',
    salary_min: r.salaryFrom,
    salary_max: r.salaryTo,
    currency: 'GBP',
    url: `https://devitjobs.uk/jobs/${r.jobUrl || ''}`,
    source: 'devitjobs_uk',
    type: r.workplace || 'full_time',
    remote: r.workplace === 'remote',
    posted_at: r.activeFrom,
    tags: r.perkKeys || [],
  }));
  console.log(`  ✓ DevITjobs UK: ${jobs.length} jobs`);
  return jobs;
}

// ─── Source 9: The Muse (Free public API, no key) ───
async function pullTheMuse(): Promise<Job[]> {
  const jobs: Job[] = [];
  const categories = ['Engineering', 'Data Science', 'IT'];

  for (const cat of categories) {
    const url = `https://www.themuse.com/api/public/jobs?category=${encodeURIComponent(cat)}&page=1&per_page=50`;
    const data = await fetchJSON(url);
    if (!data?.results) continue;

    for (const r of data.results) {
      jobs.push({
        id: `muse-${r.id}`,
        title: r.name || '',
        company: r.company?.name || 'Unknown',
        location: r.locations?.map((l: any) => l.name).join(', ') || 'Unknown',
        description: stripHTML(r.contents || ''),
        url: r.refs?.landing_page || '',
        source: 'themuse',
        type: r.type || 'full_time',
        remote: r.locations?.some((l: any) => l.name?.toLowerCase().includes('remote')) || false,
        posted_at: r.publication_date,
        tags: r.categories?.map((c: any) => c.name) || [],
      });
    }
    console.log(`  ✓ The Muse "${cat}": ${data.results.length} jobs`);
  }
  return jobs;
}

// ─── Source 10: Reed UK (Free, needs key — user can sign up at reed.co.uk/developers) ───
async function pullReed(): Promise<Job[]> {
  const REED_KEY = process.env.REED_API_KEY || '';
  if (!REED_KEY) { console.log('  ⚠ Reed: no API key, skipping (free signup: reed.co.uk/developers)'); return []; }
  const jobs: Job[] = [];

  for (const term of SEARCH_TERMS.slice(0, 3)) {
    const url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(term)}&resultsToTake=50`;
    const data = await fetchJSON(url, {
      'Authorization': 'Basic ' + Buffer.from(REED_KEY + ':').toString('base64'),
    });
    if (!data?.results) continue;

    for (const r of data.results) {
      jobs.push({
        id: `reed-${r.jobId}`,
        title: r.jobTitle || '',
        company: r.employerName || 'Unknown',
        location: r.locationName || 'UK',
        description: stripHTML(r.jobDescription || ''),
        salary_min: r.minimumSalary,
        salary_max: r.maximumSalary,
        currency: 'GBP',
        url: r.jobUrl || '',
        source: 'reed',
        type: r.contractType || 'full_time',
        remote: false,
        posted_at: r.date,
        tags: [],
      });
    }
    console.log(`  ✓ Reed "${term}": ${data.results.length} jobs`);
  }
  return jobs;
}

// ─── Source 11: Jooble (Free, needs key — jooble.org/api) ───
async function pullJooble(): Promise<Job[]> {
  const JOOBLE_KEY = process.env.JOOBLE_API_KEY || '';
  if (!JOOBLE_KEY) { console.log('  ⚠ Jooble: no API key, skipping (free signup: jooble.org/api)'); return []; }
  const jobs: Job[] = [];

  for (const term of SEARCH_TERMS.slice(0, 3)) {
    const url = `https://jooble.org/api/${JOOBLE_KEY}`;
    const data = await fetchJSON(url, { 'Content-Type': 'application/json' });
    // Jooble uses POST, simplified here — would need POST body
    if (!data?.jobs) continue;
    console.log(`  ✓ Jooble "${term}": ${data.jobs.length} jobs`);
  }
  return jobs;
}

// ─── Source 12: USAJOBS (Free, needs key — developer.usajobs.gov) ───
async function pullUSAJobs(): Promise<Job[]> {
  const USAJOBS_KEY = process.env.USAJOBS_API_KEY || '';
  const USAJOBS_EMAIL = process.env.USAJOBS_EMAIL || '';
  if (!USAJOBS_KEY) { console.log('  ⚠ USAJOBS: no API key, skipping (free signup: developer.usajobs.gov)'); return []; }
  const jobs: Job[] = [];

  for (const term of SEARCH_TERMS.slice(0, 2)) {
    const url = `https://data.usajobs.gov/api/Search?Keyword=${encodeURIComponent(term)}&ResultsPerPage=50`;
    const data = await fetchJSON(url, {
      'Authorization-Key': USAJOBS_KEY,
      'User-Agent': USAJOBS_EMAIL,
    });
    if (!data?.SearchResult?.SearchResultItems) continue;

    for (const item of data.SearchResult.SearchResultItems) {
      const r = item.MatchedObjectDescriptor;
      jobs.push({
        id: `usajobs-${r.PositionID}`,
        title: r.PositionTitle || '',
        company: r.OrganizationName || 'US Government',
        location: r.PositionLocationDisplay || 'USA',
        description: stripHTML(r.UserArea?.Details?.MajorDuties?.join(' ') || r.QualificationSummary || ''),
        salary_min: parseFloat(r.PositionRemuneration?.[0]?.MinimumRange) || undefined,
        salary_max: parseFloat(r.PositionRemuneration?.[0]?.MaximumRange) || undefined,
        currency: 'USD',
        url: r.PositionURI || '',
        source: 'usajobs',
        type: r.PositionSchedule?.[0]?.Name || 'full_time',
        remote: false,
        posted_at: r.PublicationStartDate,
        tags: [],
      });
    }
    console.log(`  ✓ USAJOBS "${term}": ${data.SearchResult.SearchResultItems.length} jobs`);
  }
  return jobs;
}

// ─── MAIN ───
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   LazyScaper — Unified Job Data Pull     ║');
  console.log('╚══════════════════════════════════════════╝\n');

  const start = Date.now();

  // Pull from all sources in parallel
  console.log('⏳ Pulling from all sources...\n');
  const results = await Promise.allSettled([
    pullAdzuna(),
    pullJSearch(),
    pullRemotive(),
    pullArbeitnow(),
    pullJobicy(),
    pullHimalayas(),
    pullRemoteOK(),
    pullDevITjobs(),
    pullTheMuse(),
    pullReed(),
    pullUSAJobs(),
  ]);

  // Collect all jobs
  let allJobs: Job[] = [];
  const sourceStats: Record<string, number> = {};

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      for (const job of result.value) {
        sourceStats[job.source] = (sourceStats[job.source] || 0) + 1;
      }
      allJobs.push(...result.value);
    }
  }

  // Deduplicate
  const beforeDedup = allJobs.length;
  allJobs = dedup(allJobs);

  // Save to file
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const outputPath = path.join(OUTPUT_DIR, 'all-jobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(allJobs, null, 2));

  // Also save a lightweight index
  const indexPath = path.join(OUTPUT_DIR, 'jobs-index.json');
  const index = allJobs.map(j => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    source: j.source,
    salary_min: j.salary_min,
    salary_max: j.salary_max,
    remote: j.remote,
    url: j.url,
  }));
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));

  // Summary
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║              RESULTS SUMMARY              ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Total jobs pulled:  ${beforeDedup.toString().padStart(6)}`);
  console.log(`║  After dedup:        ${allJobs.length.toString().padStart(6)}`);
  console.log(`║  Time taken:         ${elapsed.padStart(5)}s`);
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  BY SOURCE:');
  for (const [source, count] of Object.entries(sourceStats).sort((a, b) => b[1] - a[1])) {
    console.log(`║    ${source.padEnd(16)} ${count.toString().padStart(5)} jobs`);
  }
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Saved: ${outputPath}`);
  console.log(`║  Index: ${indexPath}`);
  console.log('╚══════════════════════════════════════════╝');

  // Print keys needed
  const missing: string[] = [];
  if (!ADZUNA_APP_KEY) missing.push('ADZUNA_APP_KEY');
  if (!RAPIDAPI_KEY) missing.push('RAPIDAPI_KEY');
  if (!process.env.REED_API_KEY) missing.push('REED_API_KEY (free: reed.co.uk/developers)');
  if (!process.env.USAJOBS_API_KEY) missing.push('USAJOBS_API_KEY (free: developer.usajobs.gov)');
  if (!process.env.JOOBLE_API_KEY) missing.push('JOOBLE_API_KEY (free: jooble.org/api)');

  if (missing.length > 0) {
    console.log('\n⚡ Add these keys to .env.local for more data:');
    for (const m of missing) console.log(`   • ${m}`);
  }
}

main().catch(console.error);
