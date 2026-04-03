import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface JobicyScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  count?: number; // max 50 per request
}

interface JobicyJob {
  id: number;
  url: string;
  jobSlug: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobIndustry?: string[];
  jobType: string[];
  jobGeo: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription: string;
  pubDate: string;
  annualSalaryMin?: number;
  annualSalaryMax?: number;
  salaryCurrency?: string;
  tags?: string[];
}

interface JobicyResponse {
  apiVersion: string;
  documentationUrl: string;
  friendlyNotice: string;
  jobCount: number;
  jobs: JobicyJob[];
}

const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'Vue', 'Angular', 'Node.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL',
  'Git', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'Linux',
  'HTML', 'CSS', 'Webpack', 'DevOps', 'Machine Learning', 'Data Science',
  'Spark', 'Kafka', 'Airflow', 'Snowflake', 'BigQuery', 'ETL',
  '.NET', 'Swift', 'Kotlin', 'Scala',
];

export class JobicyScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly cacheFile: string;
  private readonly count: number;

  constructor(config: JobicyScraperConfig = {}) {
    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'jobicy');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000;
    this.cacheFile = path.join(this.cacheDir, 'jobicy_jobs.json');
    this.count = Math.min(config.count || 50, 50);
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
      console.log(`[Jobicy] Returning ${cached.length} cached jobs`);
      return cached;
    }

    console.log('[Jobicy] Fetching jobs from Jobicy API...');
    try {
      const res = await this.httpClient.get<JobicyResponse>(
        `https://jobicy.com/api/v2/remote-jobs?count=${this.count}&tag=developer`,
      );
      const raw = res.data.jobs || [];
      const jobs = raw.map((j, i) => this.transform(j, i));
      this.saveToCache(jobs);
      console.log(`[Jobicy] Fetched ${jobs.length} jobs`);
      return jobs;
    } catch (err) {
      console.error('[Jobicy] Error:', err instanceof Error ? err.message : err);
      return [];
    }
  }

  private transform(raw: JobicyJob, index: number): Job {
    const description = this.stripHtml(raw.jobDescription || raw.jobExcerpt || '');
    const tagsText = (raw.tags || []).join(' ');
    const skills = this.extractSkills(description + ' ' + tagsText);
    const expLevel = this.extractExperienceLevel(raw.jobLevel || raw.jobTitle + ' ' + description);
    const country = this.mapGeoToCountry(raw.jobGeo);
    const currency = raw.salaryCurrency || this.getCurrency(country);

    return {
      id: raw.id || index + 15000,
      company: raw.companyName || 'Unknown',
      title: raw.jobTitle || 'Unknown',
      location: raw.jobGeo || 'Remote',
      country,
      salary_min: raw.annualSalaryMin || undefined,
      salary_max: raw.annualSalaryMax || undefined,
      currency,
      jd_full_text: description || raw.jobExcerpt || '',
      original_url: raw.url || 'https://jobicy.com',
      source: 'Jobicy',
      extracted_skills_required: skills.required,
      extracted_skills_nice_to_have: skills.niceToHave,
      experience_level: expLevel,
      degree_required: 'Bachelor',
      soft_skills: ['Communication', 'Problem Solving', 'Collaboration'],
      job_type: raw.jobType?.[0] || 'Remote',
      posted_date: raw.pubDate ? new Date(raw.pubDate) : new Date(),
    };
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

  private extractExperienceLevel(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal') || lower.includes('staff')) return 'Senior';
    if (lower.includes('junior') || lower.includes('graduate') || lower.includes('entry')) return 'Junior';
    if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-Level';
    return 'Mid-Level';
  }

  private mapGeoToCountry(geo: string): string {
    const lower = (geo || '').toLowerCase();
    if (lower === 'worldwide' || lower === 'remote' || lower === '' || lower === 'anywhere') return 'REMOTE';
    if (lower.includes('usa') || lower.includes('united states')) return 'US';
    if (lower.includes('uk') || lower.includes('united kingdom')) return 'GB';
    if (lower.includes('canada')) return 'CA';
    if (lower.includes('australia')) return 'AU';
    if (lower.includes('germany')) return 'DE';
    if (lower.includes('ireland')) return 'IE';
    return 'REMOTE';
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
      console.warn('[Jobicy] Cache write failed:', err instanceof Error ? err.message : err);
    }
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheFile)) fs.unlinkSync(this.cacheFile);
  }
}

export const createJobicyScraper = (config?: JobicyScraperConfig): JobicyScraper =>
  new JobicyScraper(config);
