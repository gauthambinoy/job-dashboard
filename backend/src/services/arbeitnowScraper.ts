import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface ArbeitnowScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
  links: { next?: string };
  meta: { current_page: number; last_page: number };
}

const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Vue', 'Angular', 'Node.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL',
  'Git', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Linux',
  'HTML', 'CSS', 'Webpack', 'DevOps', 'Machine Learning', 'Data Science',
];

export class ArbeitnowScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly cacheFile: string;

  constructor(config: ArbeitnowScraperConfig = {}) {
    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'arbeitnow');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours
    this.cacheFile = path.join(this.cacheDir, 'arbeitnow_jobs.json');
    this.ensureCacheDir();

    this.httpClient = axios.create({
      timeout: config.timeout || 15000,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'JobDashboard/1.0',
      },
    });
  }

  async scrapeJobs(): Promise<Job[]> {
    const cached = this.loadFromCache();
    if (cached) {
      console.log(`[Arbeitnow] Returning ${cached.length} cached jobs`);
      return cached;
    }

    console.log('[Arbeitnow] Fetching jobs from Arbeitnow API...');
    const jobs = await this.fetchAllJobs();
    this.saveToCache(jobs);
    console.log(`[Arbeitnow] Fetched and cached ${jobs.length} jobs`);
    return jobs;
  }

  private async fetchAllJobs(): Promise<Job[]> {
    const allRaw: ArbeitnowJob[] = [];
    let page = 1;
    const maxPages = 5;

    try {
      while (page <= maxPages) {
        const url = `https://www.arbeitnow.com/api/job-board-api?page=${page}`;
        console.log(`[Arbeitnow] Fetching page ${page}...`);
        const res = await this.httpClient.get<ArbeitnowResponse>(url);
        const { data, meta } = res.data;

        if (!data || data.length === 0) break;
        allRaw.push(...data);

        if (page >= meta.last_page) break;
        page++;

        // Respectful delay
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error('[Arbeitnow] Error fetching jobs:', err instanceof Error ? err.message : err);
    }

    return allRaw.map((raw, i) => this.transform(raw, i));
  }

  private transform(raw: ArbeitnowJob, index: number): Job {
    const skills = this.extractSkills(raw.description, raw.tags);
    const expLevel = this.extractExperienceLevel(raw.title + ' ' + raw.description);
    const jobType = raw.job_types?.[0] ?? (raw.remote ? 'Remote' : 'Full-time');
    const country = raw.remote ? 'REMOTE' : this.extractCountry(raw.location);
    const currency = this.getCurrency(country);

    return {
      id: index + 8000,
      company: raw.company_name || 'Unknown',
      title: raw.title || 'Unknown',
      location: raw.remote ? `${raw.location} (Remote)` : raw.location || 'Remote',
      country,
      salary_min: undefined,
      salary_max: undefined,
      currency,
      jd_full_text: this.buildDescription(raw),
      original_url: raw.url || `https://www.arbeitnow.com`,
      source: 'Arbeitnow' as any,
      extracted_skills_required: skills.required,
      extracted_skills_nice_to_have: skills.niceToHave,
      experience_level: expLevel,
      degree_required: 'Bachelor',
      soft_skills: ['Communication', 'Problem Solving', 'Collaboration'],
      job_type: jobType,
      posted_date: raw.created_at ? new Date(raw.created_at * 1000) : new Date(),
    };
  }

  private extractSkills(description: string, tags: string[]): { required: string[]; niceToHave: string[] } {
    const text = (description + ' ' + tags.join(' ')).toLowerCase();
    const required: string[] = [];
    const niceToHave: string[] = [];

    // Tags from Arbeitnow are reliable skill indicators
    const tagSkills = tags.filter(t =>
      TECH_SKILLS.some(s => s.toLowerCase() === t.toLowerCase())
    );
    required.push(...tagSkills.slice(0, 6));

    // Extract from description
    const niceIdx = Math.max(text.indexOf('nice to have'), text.indexOf('preferred'), text.indexOf('bonus'));
    for (const skill of TECH_SKILLS) {
      if (required.includes(skill)) continue;
      if (!text.includes(skill.toLowerCase())) continue;
      const idx = text.indexOf(skill.toLowerCase());
      if (niceIdx !== -1 && idx > niceIdx && idx - niceIdx < 200) {
        niceToHave.push(skill);
      } else {
        required.push(skill);
      }
    }

    return {
      required: [...new Set(required)].slice(0, 8),
      niceToHave: [...new Set(niceToHave)].slice(0, 4),
    };
  }

  private extractExperienceLevel(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal') || lower.includes('staff')) return 'Senior';
    if (lower.includes('junior') || lower.includes('graduate') || lower.includes('entry')) return 'Junior';
    if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-Level';
    return 'Mid-Level';
  }

  private extractCountry(location: string): string {
    const lower = (location || '').toLowerCase();
    if (lower.includes('germany') || lower.includes('berlin') || lower.includes('munich') || lower.includes('de')) return 'DE';
    if (lower.includes('united states') || lower.includes('us') || lower.includes('new york')) return 'US';
    if (lower.includes('united kingdom') || lower.includes('london') || lower.includes('uk')) return 'GB';
    if (lower.includes('ireland') || lower.includes('dublin')) return 'IE';
    if (lower.includes('australia') || lower.includes('sydney') || lower.includes('melbourne')) return 'AU';
    if (lower.includes('canada') || lower.includes('toronto')) return 'CA';
    if (lower.includes('netherlands') || lower.includes('amsterdam')) return 'NL';
    if (lower.includes('france') || lower.includes('paris')) return 'FR';
    if (lower.includes('remote') || !location) return 'REMOTE';
    return 'US';
  }

  private getCurrency(country: string): string {
    const map: Record<string, string> = { DE: 'EUR', NL: 'EUR', FR: 'EUR', IE: 'EUR', GB: 'GBP', AU: 'AUD', CA: 'CAD' };
    return map[country] || 'USD';
  }

  private buildDescription(raw: ArbeitnowJob): string {
    return [
      `Job Title: ${raw.title}`,
      `Company: ${raw.company_name}`,
      `Location: ${raw.location}${raw.remote ? ' (Remote)' : ''}`,
      raw.job_types?.length ? `Job Type: ${raw.job_types.join(', ')}` : '',
      raw.tags?.length ? `Tags: ${raw.tags.join(', ')}` : '',
      '',
      'Description:',
      raw.description || 'No description available',
      '',
      'Source: Arbeitnow',
      `URL: ${raw.url}`,
    ].filter(Boolean).join('\n').trim();
  }

  // ── Cache management ──────────────────────────────────────────────────────

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private loadFromCache(): Job[] | null {
    try {
      if (!fs.existsSync(this.cacheFile)) return null;
      const stats = fs.statSync(this.cacheFile);
      if (Date.now() - stats.mtime.getTime() > this.cacheTTL) return null;
      return JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'));
    } catch {
      return null;
    }
  }

  private saveToCache(jobs: Job[]): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(jobs, null, 2));
    } catch (err) {
      console.warn('[Arbeitnow] Failed to save cache:', err instanceof Error ? err.message : err);
    }
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheFile)) fs.unlinkSync(this.cacheFile);
  }
}

export const createArbeitnowScraper = (config?: ArbeitnowScraperConfig): ArbeitnowScraper =>
  new ArbeitnowScraper(config);
