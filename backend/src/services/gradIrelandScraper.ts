import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface GradIrelandScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  maxPages?: number;
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

interface RawGradIrelandJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  datePosted: string;
  jobType: string;
}

export class GradIrelandScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly cacheFile: string;
  private readonly maxPages: number;

  constructor(config: GradIrelandScraperConfig = {}) {
    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'gradireland');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000;
    this.cacheFile = path.join(this.cacheDir, 'gradireland_jobs.json');
    this.maxPages = config.maxPages || 3;
    this.ensureCacheDir();

    this.httpClient = axios.create({
      timeout: config.timeout || 20000,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IE,en;q=0.9',
      },
    });
  }

  async scrapeJobs(): Promise<Job[]> {
    const cached = this.loadFromCache();
    if (cached) {
      console.log(`[GradIreland] Returning ${cached.length} cached jobs`);
      return cached;
    }

    console.log('[GradIreland] Scraping graduate jobs from gradireland.com...');
    const jobs = await this.fetchAllJobs();
    this.saveToCache(jobs);
    console.log(`[GradIreland] Scraped and cached ${jobs.length} jobs`);
    return jobs;
  }

  private async fetchAllJobs(): Promise<Job[]> {
    const allRaw: RawGradIrelandJob[] = [];

    // GradIreland graduate jobs listing pages
    const searchUrls = [
      'https://gradireland.com/graduate-jobs?page=0',
      'https://gradireland.com/graduate-jobs?page=1',
      'https://gradireland.com/graduate-jobs?page=2',
    ];

    for (let i = 0; i < Math.min(this.maxPages, searchUrls.length); i++) {
      try {
        console.log(`[GradIreland] Fetching page ${i + 1}...`);
        const res = await this.httpClient.get(searchUrls[i]);
        const pageJobs = this.parseListingPage(res.data);
        allRaw.push(...pageJobs);

        if (pageJobs.length === 0) break;
        // Respectful delay
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.error(`[GradIreland] Error fetching page ${i + 1}:`, err instanceof Error ? err.message : err);
      }
    }

    return allRaw.map((raw, i) => this.transform(raw, i));
  }

  private parseListingPage(html: string): RawGradIrelandJob[] {
    const jobs: RawGradIrelandJob[] = [];
    const $ = cheerio.load(html);

    // GradIreland uses various listing structures; try common selectors
    const selectors = [
      '.view-content .views-row',
      '.job-listing',
      '.job-item',
      '.node--type-job',
      'article.node',
      '.search-results .result',
      '.views-row',
    ];

    let $items: cheerio.Cheerio<any> | null = null;
    for (const sel of selectors) {
      const found = $(sel);
      if (found.length > 0) {
        $items = found;
        break;
      }
    }

    if (!$items || $items.length === 0) {
      // Fallback: try to find any links that look like job listings
      $('a[href*="/graduate-jobs/"], a[href*="/job/"], a[href*="/vacancy/"]').each((_, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        const href = $el.attr('href') || '';
        if (title && title.length > 5 && title.length < 200) {
          const url = href.startsWith('http') ? href : `https://gradireland.com${href}`;
          jobs.push({
            title,
            company: $el.closest('.views-row, .job-item, article').find('.field--name-field-company, .company, .employer').text().trim() || 'Unknown',
            location: 'Ireland',
            url,
            description: '',
            datePosted: '',
            jobType: 'Graduate',
          });
        }
      });
      return jobs;
    }

    $items.each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2 a, h3 a, .views-field-title a, .job-title a, a.title').first().text().trim()
        || $el.find('a').first().text().trim();
      const href = $el.find('h2 a, h3 a, .views-field-title a, .job-title a, a.title, a').first().attr('href') || '';
      const company = $el.find('.field--name-field-company, .company, .employer, .views-field-field-company').text().trim() || 'Unknown';
      const location = $el.find('.field--name-field-location, .location, .views-field-field-location').text().trim() || 'Ireland';
      const description = $el.find('.field--name-body, .description, .summary, .views-field-body').text().trim();
      const dateText = $el.find('.date, .posted-date, .views-field-created').text().trim();

      if (title && title.length > 3) {
        const url = href.startsWith('http') ? href : `https://gradireland.com${href}`;
        jobs.push({
          title,
          company,
          location,
          url,
          description,
          datePosted: dateText,
          jobType: 'Graduate',
        });
      }
    });

    return jobs;
  }

  private transform(raw: RawGradIrelandJob, index: number): Job {
    const skills = this.extractSkills(raw.description + ' ' + raw.title);
    const expLevel = this.extractExperienceLevel(raw.title + ' ' + raw.description);
    const location = raw.location || 'Ireland';

    return {
      id: index + 20000,
      company: raw.company || 'Unknown',
      title: raw.title || 'Unknown',
      location,
      country: 'IE',
      salary_min: undefined,
      salary_max: undefined,
      currency: 'EUR',
      jd_full_text: this.buildDescription(raw),
      original_url: raw.url || 'https://gradireland.com',
      source: 'GradIreland',
      extracted_skills_required: skills.required,
      extracted_skills_nice_to_have: skills.niceToHave,
      experience_level: expLevel,
      degree_required: 'Bachelor',
      soft_skills: ['Communication', 'Teamwork', 'Problem Solving'],
      job_type: raw.jobType || 'Graduate',
      posted_date: raw.datePosted ? new Date(raw.datePosted) : new Date(),
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
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) return 'Senior';
    if (lower.includes('junior') || lower.includes('graduate') || lower.includes('entry') || lower.includes('intern')) return 'Junior';
    if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-Level';
    return 'Junior'; // Default to Junior for GradIreland since it's a graduate portal
  }

  private buildDescription(raw: RawGradIrelandJob): string {
    return [
      `Job Title: ${raw.title}`,
      `Company: ${raw.company}`,
      `Location: ${raw.location}`,
      `Job Type: ${raw.jobType || 'Graduate'}`,
      '',
      'Description:',
      raw.description || 'No description available - visit the job page for full details.',
      '',
      'Source: GradIreland',
      `URL: ${raw.url}`,
    ].filter(Boolean).join('\n').trim();
  }

  // ── Cache management ──────────────────────────────────────────────────────

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
      console.warn('[GradIreland] Cache write failed:', err instanceof Error ? err.message : err);
    }
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheFile)) fs.unlinkSync(this.cacheFile);
  }
}

export const createGradIrelandScraper = (config?: GradIrelandScraperConfig): GradIrelandScraper =>
  new GradIrelandScraper(config);
