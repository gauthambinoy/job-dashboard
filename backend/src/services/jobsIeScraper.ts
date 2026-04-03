import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface JobsIeScraperConfig {
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

interface RawJobsIeJob {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  datePosted: string;
  salary: string;
  jobType: string;
}

export class JobsIeScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly cacheFile: string;
  private readonly maxPages: number;

  constructor(config: JobsIeScraperConfig = {}) {
    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'jobsie');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000;
    this.cacheFile = path.join(this.cacheDir, 'jobsie_jobs.json');
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
      console.log(`[JobsIe] Returning ${cached.length} cached jobs`);
      return cached;
    }

    console.log('[JobsIe] Scraping graduate/entry-level jobs from jobs.ie...');
    const jobs = await this.fetchAllJobs();
    this.saveToCache(jobs);
    console.log(`[JobsIe] Scraped and cached ${jobs.length} jobs`);
    return jobs;
  }

  private async fetchAllJobs(): Promise<Job[]> {
    const allRaw: RawJobsIeJob[] = [];

    // Jobs.ie search URLs for graduate/entry-level roles in Ireland
    const searchUrls = [
      'https://www.jobs.ie/jobs/graduate',
      'https://www.jobs.ie/jobs/entry-level',
      'https://www.jobs.ie/jobs/junior',
    ];

    for (let i = 0; i < Math.min(this.maxPages, searchUrls.length); i++) {
      try {
        console.log(`[JobsIe] Fetching ${searchUrls[i]}...`);
        const res = await this.httpClient.get(searchUrls[i]);
        const pageJobs = this.parseListingPage(res.data);
        allRaw.push(...pageJobs);

        // Respectful delay
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.error(`[JobsIe] Error fetching ${searchUrls[i]}:`, err instanceof Error ? err.message : err);
      }
    }

    // Deduplicate by URL before transforming
    const uniqueRaw = this.deduplicateRaw(allRaw);
    return uniqueRaw.map((raw, i) => this.transform(raw, i));
  }

  private parseListingPage(html: string): RawJobsIeJob[] {
    const jobs: RawJobsIeJob[] = [];
    const $ = cheerio.load(html);

    // Jobs.ie uses various listing structures; try common selectors
    const selectors = [
      '.job-listing',
      '.job-item',
      '.search-result',
      '.listing-item',
      '.result',
      'article',
      '.views-row',
      '[data-job-id]',
      '.job-card',
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
      // Fallback: look for job links
      $('a[href*="/job/"], a[href*="/jobs/"], a[href*="job-detail"]').each((_, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        const href = $el.attr('href') || '';
        if (title && title.length > 5 && title.length < 200 && !title.toLowerCase().includes('search')) {
          const url = href.startsWith('http') ? href : `https://www.jobs.ie${href}`;
          jobs.push({
            title,
            company: 'Unknown',
            location: 'Ireland',
            url,
            description: '',
            datePosted: '',
            salary: '',
            jobType: 'Full-time',
          });
        }
      });
      return jobs;
    }

    $items.each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2 a, h3 a, .job-title a, .title a, a.job-link').first().text().trim()
        || $el.find('a').first().text().trim();
      const href = $el.find('h2 a, h3 a, .job-title a, .title a, a.job-link, a').first().attr('href') || '';
      const company = $el.find('.company, .employer, .company-name').text().trim() || 'Unknown';
      const location = $el.find('.location, .job-location').text().trim() || 'Ireland';
      const description = $el.find('.description, .summary, .snippet').text().trim();
      const salary = $el.find('.salary, .pay').text().trim();
      const dateText = $el.find('.date, .posted-date, time').text().trim();

      if (title && title.length > 3) {
        const url = href.startsWith('http') ? href : `https://www.jobs.ie${href}`;
        jobs.push({
          title,
          company,
          location,
          url,
          description,
          datePosted: dateText,
          salary,
          jobType: 'Full-time',
        });
      }
    });

    return jobs;
  }

  private deduplicateRaw(jobs: RawJobsIeJob[]): RawJobsIeJob[] {
    const seen = new Set<string>();
    return jobs.filter(job => {
      const key = job.url || `${job.title}|${job.company}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private transform(raw: RawJobsIeJob, index: number): Job {
    const skills = this.extractSkills(raw.description + ' ' + raw.title);
    const expLevel = this.extractExperienceLevel(raw.title + ' ' + raw.description);
    const salary = this.parseSalary(raw.salary);

    return {
      id: index + 22000,
      company: raw.company || 'Unknown',
      title: raw.title || 'Unknown',
      location: raw.location || 'Ireland',
      country: 'IE',
      salary_min: salary.min,
      salary_max: salary.max,
      currency: 'EUR',
      jd_full_text: this.buildDescription(raw),
      original_url: raw.url || 'https://www.jobs.ie',
      source: 'JobsIe',
      extracted_skills_required: skills.required,
      extracted_skills_nice_to_have: skills.niceToHave,
      experience_level: expLevel,
      degree_required: 'Bachelor',
      soft_skills: ['Communication', 'Teamwork', 'Problem Solving'],
      job_type: raw.jobType || 'Full-time',
      posted_date: raw.datePosted ? new Date(raw.datePosted) : new Date(),
    };
  }

  private parseSalary(salaryStr: string): { min?: number; max?: number } {
    if (!salaryStr) return {};
    // Try to extract numbers like "30,000 - 40,000" or "EUR 30000"
    const numbers = salaryStr.replace(/,/g, '').match(/\d+/g);
    if (!numbers || numbers.length === 0) return {};
    const vals = numbers.map(Number).filter(n => n > 1000); // Filter out non-salary numbers
    if (vals.length >= 2) return { min: vals[0], max: vals[1] };
    if (vals.length === 1) return { min: vals[0], max: vals[0] };
    return {};
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
    return 'Junior'; // Default to Junior since we search for graduate/entry-level
  }

  private buildDescription(raw: RawJobsIeJob): string {
    return [
      `Job Title: ${raw.title}`,
      `Company: ${raw.company}`,
      `Location: ${raw.location}`,
      raw.salary ? `Salary: ${raw.salary}` : '',
      `Job Type: ${raw.jobType || 'Full-time'}`,
      '',
      'Description:',
      raw.description || 'No description available - visit the job page for full details.',
      '',
      'Source: Jobs.ie',
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
      console.warn('[JobsIe] Cache write failed:', err instanceof Error ? err.message : err);
    }
  }

  clearCache(): void {
    if (fs.existsSync(this.cacheFile)) fs.unlinkSync(this.cacheFile);
  }
}

export const createJobsIeScraper = (config?: JobsIeScraperConfig): JobsIeScraper =>
  new JobsIeScraper(config);
