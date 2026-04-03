import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface TheMuseScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  maxPages?: number;
}

interface MuseLevel {
  name: string;
  short_name: string;
}

interface MuseLocation {
  name: string;
}

interface MuseCategory {
  name: string;
}

interface MuseCompany {
  name: string;
}

interface MuseJob {
  id: number;
  name: string;
  short_name: string;
  type: string;
  publication_date: string;
  short_description: string;
  description: string;
  refs: { landing_page: string };
  levels: MuseLevel[];
  locations: MuseLocation[];
  categories: MuseCategory[];
  company: { short_name: string; name: string };
}

interface MuseResponse {
  page: number;
  page_count: number;
  items_per_page: number;
  took: number;
  timed_out: boolean;
  total: number;
  results: MuseJob[];
}

const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Vue', 'Angular', 'Node.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL',
  'Git', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Linux',
  'HTML', 'CSS', 'Webpack', 'DevOps', 'Machine Learning', 'Data Science',
  '.NET', 'Swift', 'Kotlin', 'Scala', 'Spark', 'Kafka',
];

export class TheMuseScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly cacheFile: string;
  private readonly maxPages: number;

  constructor(config: TheMuseScraperConfig = {}) {
    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'themuse');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000;
    this.cacheFile = path.join(this.cacheDir, 'themuse_jobs.json');
    this.maxPages = config.maxPages || 3;
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
      console.log(`[TheMuse] Returning ${cached.length} cached jobs`);
      return cached;
    }

    console.log('[TheMuse] Fetching jobs from The Muse API...');
    const allRaw: MuseJob[] = [];

    try {
      for (let page = 1; page <= this.maxPages; page++) {
        const res = await this.httpClient.get<MuseResponse>(
          `https://www.themuse.com/api/public/jobs?page=${page}&descending=true&category=Computer+and+IT&category=Data+and+Analytics&category=Software+Engineer`,
        );
        const results = res.data.results || [];
        if (results.length === 0) break;
        allRaw.push(...results);
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (err) {
      console.error('[TheMuse] Error:', err instanceof Error ? err.message : err);
    }

    const jobs = allRaw.map((j, i) => this.transform(j, i));
    this.saveToCache(jobs);
    console.log(`[TheMuse] Fetched ${jobs.length} jobs`);
    return jobs;
  }

  private transform(raw: MuseJob, index: number): Job {
    const description = this.stripHtml(raw.description || raw.short_description || '');
    const skills = this.extractSkills(description);
    const expLevel = this.mapLevel(raw.levels?.[0]?.short_name || '');
    const location = raw.locations?.[0]?.name || 'Remote';
    const country = this.inferCountry(location);

    return {
      id: raw.id || index + 20000,
      company: raw.company?.name || 'Unknown',
      title: raw.name || 'Unknown',
      location,
      country,
      salary_min: undefined,
      salary_max: undefined,
      currency: this.getCurrency(country),
      jd_full_text: description,
      original_url: raw.refs?.landing_page || 'https://www.themuse.com/jobs',
      source: 'TheMuse',
      extracted_skills_required: skills.required,
      extracted_skills_nice_to_have: skills.niceToHave,
      experience_level: expLevel,
      degree_required: 'Bachelor',
      soft_skills: ['Communication', 'Collaboration', 'Problem Solving'],
      job_type: raw.type || 'Full-time',
      posted_date: raw.publication_date ? new Date(raw.publication_date) : new Date(),
    };
  }

  private mapLevel(level: string): string {
    const lower = level.toLowerCase();
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('manager')) return 'Senior';
    if (lower.includes('junior') || lower.includes('entry') || lower.includes('intern')) return 'Junior';
    if (lower.includes('mid')) return 'Mid-Level';
    return 'Mid-Level';
  }

  private extractSkills(text: string): { required: string[]; niceToHave: string[] } {
    const lower = text.toLowerCase();
    const required: string[] = [];
    const niceToHave: string[] = [];
    const niceIdx = Math.max(lower.indexOf('nice to have'), lower.indexOf('preferred'), lower.indexOf('bonus'));

    for (const skill of TECH_SKILLS) {
      if (!lower.includes(skill.toLowerCase())) continue;
      const idx = lower.indexOf(skill.toLowerCase());
      if (niceIdx !== -1 && idx > niceIdx && idx - niceIdx < 300) {
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

  private inferCountry(location: string): string {
    const lower = location.toLowerCase();
    if (lower.includes('remote') || lower.includes('flexible') || lower === '') return 'REMOTE';
    if (lower.includes('new york') || lower.includes('san francisco') || lower.includes('chicago') ||
        lower.includes('austin') || lower.includes('seattle') || lower.includes('boston') ||
        lower.includes('los angeles') || lower.includes(', ny') || lower.includes(', ca') ||
        lower.includes(', tx') || lower.includes('united states') || lower.includes(', us')) return 'US';
    if (lower.includes('london') || lower.includes('manchester') || lower.includes('uk') ||
        lower.includes('united kingdom')) return 'GB';
    if (lower.includes('toronto') || lower.includes('canada') || lower.includes('vancouver')) return 'CA';
    if (lower.includes('sydney') || lower.includes('melbourne') || lower.includes('australia')) return 'AU';
    if (lower.includes('berlin') || lower.includes('munich') || lower.includes('germany')) return 'DE';
    if (lower.includes('dublin') || lower.includes('ireland')) return 'IE';
    return 'US';
  }

  private getCurrency(country: string): string {
    const map: Record<string, string> = { DE: 'EUR', NL: 'EUR', FR: 'EUR', IE: 'EUR', GB: 'GBP', AU: 'AUD', CA: 'CAD', US: 'USD' };
    return map[country] || 'USD';
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) fs.mkdirSync(this.cacheDir, { recursive: true });
  }

  private loadFromCache(): Job[] | null {
    try {
      if (!fs.existsSync(this.cacheFile)) return null;
      const stats = fs.statSync(this.cacheFile);
      if (Date.now() - stats.mtime.getTime() > this.cacheTTL) return null;
      return JSON.parse(fs.readFileSync(this.cacheFile, 'utf-8'));
    } catch { return null; }
  }

  private saveToCache(jobs: Job[]): void {
    try {
      fs.writeFileSync(this.cacheFile, JSON.stringify(jobs, null, 2));
    } catch (err) {
      console.warn('[TheMuse] Cache write failed:', err instanceof Error ? err.message : err);
    }
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheFile)) fs.unlinkSync(this.cacheFile);
  }
}

export const createTheMuseScraper = (config?: TheMuseScraperConfig): TheMuseScraper =>
  new TheMuseScraper(config);
