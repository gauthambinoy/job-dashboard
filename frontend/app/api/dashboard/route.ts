import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

interface Job {
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
}

const SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C++', 'C#',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'SQL', 'HTML', 'CSS',
  'Bash', 'Shell', 'Perl', 'Dart', 'Elixir', 'Haskell', 'Lua', 'MATLAB',
  'Objective-C', 'Assembly', 'COBOL', 'Fortran', 'GraphQL', 'REST', 'gRPC',
  'WebSocket',
];

const TOOLS = [
  'React', 'Angular', 'Vue', 'Next.js', 'Node.js', 'Express', 'Django',
  'Flask', 'FastAPI', 'Spring', 'Spring Boot', '.NET', 'Laravel', 'Rails',
  'Svelte', 'Nuxt', 'Gatsby', 'Remix', 'Astro', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions',
  'GitLab CI', 'CircleCI', 'Datadog', 'Grafana', 'Prometheus', 'Elasticsearch',
  'Redis', 'PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB', 'Cassandra', 'Kafka',
  'RabbitMQ', 'Spark', 'Hadoop', 'Airflow', 'dbt', 'Snowflake', 'BigQuery',
  'Tableau', 'Power BI', 'Figma', 'Jira', 'Confluence', 'Slack', 'Linux',
  'Nginx', 'Apache', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code',
  'IntelliJ', 'Vim', 'Neovim',
];

const COUNTRY_LOCATION_MAP: Record<string, string[]> = {
  'Australia': ['australia', 'sydney', 'melbourne', 'brisbane', 'perth', 'adelaide', 'canberra', 'queensland', 'victoria', 'new south wales', 'wyndham', 'hoppers crossing'],
  'United Kingdom': ['uk', 'united kingdom', 'london', 'manchester', 'birmingham', 'edinburgh', 'glasgow', 'bristol', 'leeds', 'liverpool', 'cambridge', 'oxford', 'england', 'scotland', 'wales', 'cheltenham'],
  'United States': ['usa', 'united states', 'new york', 'san francisco', 'los angeles', 'seattle', 'austin', 'boston', 'chicago', 'denver', 'atlanta', 'california', 'texas', 'washington'],
  'Ireland': ['ireland', 'dublin', 'cork', 'galway', 'limerick', 'waterford'],
  'Canada': ['canada', 'toronto', 'vancouver', 'montreal', 'ottawa', 'calgary', 'ontario', 'british columbia'],
  'Germany': ['germany', 'berlin', 'munich', 'frankfurt', 'hamburg', 'deutschland', 'münchen'],
  'Netherlands': ['netherlands', 'amsterdam', 'rotterdam', 'the hague', 'utrecht', 'eindhoven', 'nederland'],
  'France': ['france', 'paris', 'lyon', 'marseille', 'toulouse'],
  'India': ['india', 'bangalore', 'mumbai', 'delhi', 'hyderabad', 'pune', 'chennai', 'bengaluru', 'noida', 'gurgaon'],
  'Singapore': ['singapore'],
  'New Zealand': ['new zealand', 'auckland', 'wellington', 'christchurch'],
  'Dubai / UAE': ['dubai', 'uae', 'abu dhabi', 'emirates', 'sharjah'],
  'Remote': ['remote', 'anywhere', 'worldwide', 'global'],
};

const SALARY_RANGES = [
  { range: '< 50K', min: 0, max: 49999 },
  { range: '50K - 80K', min: 50000, max: 79999 },
  { range: '80K - 120K', min: 80000, max: 119999 },
  { range: '120K - 160K', min: 120000, max: 159999 },
  { range: '160K - 200K', min: 160000, max: 199999 },
  { range: '200K+', min: 200000, max: Infinity },
];

async function loadJobs(origin: string): Promise<Job[]> {
  // Try live scraper first
  try {
    const res = await fetch(`${origin}/api/scrape`, { next: { revalidate: 0 } });
    if (res.ok) {
      const data = await res.json();
      if (data.jobs?.length > 0) return data.jobs;
    }
  } catch {}
  // Fallback to static file
  const dataPath = path.join(process.cwd(), 'data', 'all-jobs.json');
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function countKeywords(jobs: Job[], keywords: string[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  // Pre-build regex for each keyword for accurate word boundary matching
  const regexMap: Record<string, RegExp> = {};
  for (const kw of keywords) {
    // Escape special regex chars, use word boundaries where possible
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    regexMap[kw] = new RegExp(`\\b${escaped}\\b`, 'i');
  }

  for (const job of jobs) {
    const text = `${job.title} ${job.description || ''}`;
    for (const kw of keywords) {
      if (regexMap[kw].test(text)) {
        counts[kw] = (counts[kw] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function getExperienceLevel(title: string): string {
  const t = title.toLowerCase();
  if (/\b(junior|jr\.?|graduate|grad|intern|internship|trainee|entry[- ]level)\b/.test(t)) return 'Entry';
  if (/\b(senior|sr\.?)\b/.test(t)) return 'Senior';
  if (/\b(lead|staff|principal|distinguished|fellow)\b/.test(t)) return 'Lead';
  if (/\b(manager|director|vp|vice president|cto|cio|head of)\b/.test(t)) return 'Management';
  return 'Mid';
}

function getCountry(location: string): string {
  const loc = location.toLowerCase();
  for (const [country, keywords] of Object.entries(COUNTRY_LOCATION_MAP)) {
    if (keywords.some(kw => loc.includes(kw))) return country;
  }
  return 'Other';
}

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const jobs = await loadJobs(origin);
  const totalJobs = jobs.length;

  // Skills & Tools
  const topSkills = countKeywords(jobs, SKILLS).slice(0, 50);
  const topTools = countKeywords(jobs, TOOLS).slice(0, 30);

  // Top Titles
  const titleCounts: Record<string, number> = {};
  for (const job of jobs) {
    const t = job.title.trim();
    if (t) titleCounts[t] = (titleCounts[t] || 0) + 1;
  }
  const topTitles = Object.entries(titleCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // Top Companies
  const companyCounts: Record<string, number> = {};
  for (const job of jobs) {
    const c = job.company?.trim();
    if (c) companyCounts[c] = (companyCounts[c] || 0) + 1;
  }
  const topCompanies = Object.entries(companyCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Top Locations
  const locationCounts: Record<string, number> = {};
  for (const job of jobs) {
    const l = job.location?.trim();
    if (l) locationCounts[l] = (locationCounts[l] || 0) + 1;
  }
  const topLocations = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Source Breakdown
  const sourceBreakdown: Record<string, number> = {};
  for (const job of jobs) {
    sourceBreakdown[job.source] = (sourceBreakdown[job.source] || 0) + 1;
  }

  // Country Breakdown
  const countryBreakdown: Record<string, number> = {};
  for (const job of jobs) {
    const country = getCountry(job.location || '');
    countryBreakdown[country] = (countryBreakdown[country] || 0) + 1;
  }

  // Salary Ranges
  const salaryRanges = SALARY_RANGES.map(r => {
    const count = jobs.filter(j => {
      const sal = j.salary_max || j.salary_min;
      if (!sal) return false;
      return sal >= r.min && sal <= r.max;
    }).length;
    return { range: r.range, count };
  });

  // Remote vs Onsite
  const remoteCount = jobs.filter(j => j.remote === true).length;
  const remoteVsOnsite = { remote: remoteCount, onsite: totalJobs - remoteCount };

  // Experience Levels
  const expCounts: Record<string, number> = {};
  for (const job of jobs) {
    const level = getExperienceLevel(job.title);
    expCounts[level] = (expCounts[level] || 0) + 1;
  }
  const experienceLevels = Object.entries(expCounts)
    .map(([level, count]) => ({ level, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalJobs,
    topSkills,
    topTools,
    topTitles,
    topCompanies,
    topLocations,
    sourceBreakdown,
    countryBreakdown,
    salaryRanges,
    remoteVsOnsite,
    experienceLevels,
  });
}
