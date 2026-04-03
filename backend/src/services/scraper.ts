import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface ScraperFilters {
  countries: string[];
  domains?: string[];
  minExp?: number;
  maxExp?: number;
}

/**
 * IrishJobs.ie Web Scraper
 * Fetches real job listings from irishjobs.ie with proper error handling and caching
 */
export class IndeedScraper {
  private baseUrl: string;
  private searchUrl: string;
  private cacheDir: string;
  private cacheDuration: number = 24 * 60 * 60 * 1000; // 24 hours
  private axiosInstance: AxiosInstance;

  constructor() {
    this.baseUrl = 'https://www.irishjobs.ie';
    this.searchUrl = 'https://www.irishjobs.ie/jobs';
    this.cacheDir = path.join(process.cwd(), '.scraper_cache');
    this.ensureCacheDir();
    this.axiosInstance = axios.create({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 30000,
    });
  }

  async scrapeJobs(filters: ScraperFilters): Promise<Job[]> {
    try {
      console.log('Starting IrishJobs.ie scraper...');
      const cachedJobs = this.getCachedJobs();
      if (cachedJobs.length > 0) {
        console.log(`Loaded ${cachedJobs.length} jobs from cache`);
        return this.filterJobs(cachedJobs, filters);
      }
      const jobs = await this.scrapeIrishJobsLive(filters);
      if (jobs.length > 0) {
        this.cacheJobs(jobs);
        console.log(`Successfully scraped and cached ${jobs.length} jobs`);
      }
      return jobs;
    } catch (error) {
      console.error('Error scraping jobs from IrishJobs.ie:', error);
      const staleCachedJobs = this.getCachedJobs(true);
      if (staleCachedJobs.length > 0) {
        console.log(`Using stale cache with ${staleCachedJobs.length} jobs due to scraping error`);
        return this.filterJobs(staleCachedJobs, filters);
      }
      throw new Error(
        `Failed to scrape jobs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private async scrapeIrishJobsLive(filters: ScraperFilters): Promise<Job[]> {
    const jobs: Job[] = [];
    const maxPages = 10;
    try {
      for (let page = 1; page <= maxPages; page++) {
        try {
          const pageJobs = await this.scrapePage(page);
          if (pageJobs.length === 0) {
            console.log(`No more jobs found on page ${page}`);
            break;
          }
          jobs.push(...pageJobs);
          console.log(`Scraped ${pageJobs.length} jobs from page ${page}. Total: ${jobs.length}`);
          await this.delay(2000 + Math.random() * 1000);
          if (jobs.length >= 50) {
            console.log('Reached target of 50+ jobs');
            break;
          }
        } catch (pageError) {
          console.warn(`Error scraping page ${page}:`, pageError);
          continue;
        }
      }
      return jobs.slice(0, 100);
    } catch (error) {
      console.error('Error in scrapeIrishJobsLive:', error);
      throw error;
    }
  }

  private async scrapePage(pageNumber: number): Promise<Job[]> {
    try {
      const url = pageNumber === 1 ? this.searchUrl : `${this.searchUrl}?pagenum=${pageNumber}`;
      console.log(`Fetching page ${pageNumber} from ${url}`);
      const response = await this.axiosInstance.get(url);
      const $ = cheerio.load(response.data);
      const jobs: Job[] = [];
      let jobId = Date.now() + Math.floor(Math.random() * 10000);

      const jobElements = $('div[class*="job-item"], div[class*="job"], article[class*="job"]');
      if (jobElements.length === 0) {
        console.warn('No job elements found on page');
        return [];
      }

      jobElements.each((_index, element) => {
        try {
          const job = this.parseJobElement($, element, jobId++);
          if (job && job.title && job.company) {
            jobs.push(job);
          }
        } catch (parseError) {
          console.warn(`Error parsing job element ${_index}:`, parseError);
        }
      });

      return jobs;
    } catch (error) {
      console.error(`Error scraping page ${pageNumber}:`, error);
      throw error;
    }
  }

  private parseJobElement(
    $: cheerio.CheerioAPI,
    element: any,
    jobId: number,
  ): Job | null {
    try {
      const $element = $(element);

      const titleSelectors = ['h2 a', 'h3 a', 'a[data-job-title]', '.job-title', 'a.job-link'];
      let title = '';
      for (const selector of titleSelectors) {
        const found = $element.find(selector).first().text().trim();
        if (found) {
          title = found;
          break;
        }
      }

      const companySelectors = ['.company-name', '.employer', 'span[data-company]', 'a.company-link'];
      let company = '';
      for (const selector of companySelectors) {
        const found = $element.find(selector).first().text().trim();
        if (found) {
          company = found;
          break;
        }
      }

      const locationSelectors = ['.location', 'span.job-location', '[data-location]', '.job-region'];
      let location = 'Ireland';
      for (const selector of locationSelectors) {
        const found = $element.find(selector).first().text().trim();
        if (found) {
          location = found;
          break;
        }
      }

      const descriptionSelectors = [
        '.job-description',
        '.job-summary',
        'p.summary',
        'div[class*="description"]',
      ];
      let description = '';
      for (const selector of descriptionSelectors) {
        const found = $element.find(selector).first().text().trim();
        if (found) {
          description = found;
          break;
        }
      }

      const salaryText = $element.find('.salary, .job-salary, span[class*="salary"]').first().text();
      const salaryInfo = this.parseSalary(salaryText);

      const urlSelectors = ['a[href*="/jobs/"]', 'a.job-link', 'h2 a', 'h3 a'];
      let jobUrl = '';
      for (const selector of urlSelectors) {
        const href = $element.find(selector).first().attr('href');
        if (href) {
          jobUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          break;
        }
      }
      if (!jobUrl) {
        jobUrl = `${this.baseUrl}/jobs/${jobId}`;
      }

      const skillsInfo = this.extractSkillsAndExperience(description);
      const jobTypeText = $element.text().toLowerCase();
      const jobType = this.determineJobType(jobTypeText);

      const job: Job = {
        id: jobId,
        company: company || 'Unknown Company',
        title: title || 'Unknown Position',
        location,
        country: 'IE',
        salary_min: salaryInfo.min,
        salary_max: salaryInfo.max,
        currency: 'EUR',
        jd_full_text: description || `Position: ${title}\nCompany: ${company}`,
        original_url: jobUrl,
        source: 'IrishJobs',
        extracted_skills_required: skillsInfo.required,
        extracted_skills_nice_to_have: skillsInfo.niceToHave,
        experience_level: skillsInfo.level,
        degree_required: skillsInfo.degreeRequired,
        soft_skills: ['Communication', 'Problem Solving', 'Team Player'],
        job_type: jobType,
        posted_date: new Date(),
      };

      return job;
    } catch (error) {
      console.warn('Error parsing job element:', error);
      return null;
    }
  }

  private parseSalary(salaryText: string): { min: number; max: number } {
    const defaultSalary = { min: 45000, max: 75000 };
    if (!salaryText) return defaultSalary;

    const match = salaryText.match(/€?\s*(\d+[,.]?\d*)[k]?\s*[-–]\s*€?\s*(\d+[,.]?\d*)[k]?/i);
    if (match) {
      let min = parseFloat(match[1].replace(/,/g, ''));
      let max = parseFloat(match[2].replace(/,/g, ''));
      if (salaryText.includes('k')) {
        min = min < 1000 ? min * 1000 : min;
        max = max < 1000 ? max * 1000 : max;
      }
      return { min: Math.round(min), max: Math.round(max) };
    }

    const singleMatch = salaryText.match(/€?\s*(\d+[,.]?\d*)[k]?/);
    if (singleMatch) {
      let salary = parseFloat(singleMatch[1].replace(/,/g, ''));
      if (salaryText.includes('k')) {
        salary = salary < 1000 ? salary * 1000 : salary;
      }
      const roundedSalary = Math.round(salary);
      return { min: roundedSalary * 0.9, max: roundedSalary * 1.1 };
    }

    return defaultSalary;
  }

  private extractSkillsAndExperience(description: string) {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python',
      'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'SQL', 'PostgreSQL', 'MongoDB',
      'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git',
      'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'CI/CD', 'Jenkins',
      'Linux', 'Windows', 'HTML', 'CSS', 'SASS', 'Webpack', 'Babel', 'Jest', 'Mocha',
      'API', 'JSON', 'XML', 'HTML5',
    ];

    const required: string[] = [];
    const niceToHave: string[] = [];
    const descLower = description.toLowerCase();

    const requiredSection = descLower.match(
      /(?:required|must have|essential|mandatory)[\s\S]*?(?:nice to have|preferred|additional|what we offer|$)/i,
    );
    const nicSection = descLower.match(
      /(?:nice to have|preferred|additional|desirable)[\s\S]*?(?:what we offer|benefits|$)/i,
    );

    for (const skill of commonSkills) {
      if (requiredSection && requiredSection[0].includes(skill.toLowerCase())) {
        if (!required.includes(skill)) required.push(skill);
      } else if (nicSection && nicSection[0].includes(skill.toLowerCase())) {
        if (!niceToHave.includes(skill)) niceToHave.push(skill);
      } else if (descLower.includes(skill.toLowerCase())) {
        if (!required.includes(skill)) required.push(skill);
      }
    }

    let level = 'Mid-Level';
    if (descLower.includes('senior') || descLower.includes('lead') || descLower.includes('principal')) {
      level = 'Senior';
    } else if (descLower.includes('junior') || descLower.includes('graduate') || descLower.includes('entry')) {
      level = 'Junior';
    }

    let degreeRequired = 'Not specified';
    if (descLower.includes('degree') || descLower.includes('bachelor') || descLower.includes('master')) {
      degreeRequired = 'Bachelor';
      if (descLower.includes('master')) degreeRequired = 'Master';
    }

    return {
      required: required.slice(0, 8),
      niceToHave: niceToHave.slice(0, 3),
      level,
      degreeRequired,
    };
  }

  private determineJobType(text: string): string {
    if (text.includes('permanent')) return 'Full-time';
    if (text.includes('contract')) return 'Contract';
    if (text.includes('temporary')) return 'Temporary';
    if (text.includes('part-time') || text.includes('part time')) return 'Part-time';
    if (text.includes('freelance')) return 'Freelance';
    return 'Full-time';
  }

  private filterJobs(jobs: Job[], filters: ScraperFilters): Job[] {
    return jobs.filter((job) => {
      const matchesCountry = filters.countries.length === 0 || filters.countries.includes(job.country);
      return matchesCountry;
    });
  }

  private getCachedJobs(allowStale = false): Job[] {
    try {
      const cacheFile = path.join(this.cacheDir, 'jobs_cache.json');
      if (!fs.existsSync(cacheFile)) return [];

      const cacheContent = fs.readFileSync(cacheFile, 'utf-8');
      const cacheData = JSON.parse(cacheContent);
      const isExpired = Date.now() - cacheData.timestamp > this.cacheDuration;

      if (isExpired && !allowStale) {
        console.log('Cache expired, will fetch fresh data');
        return [];
      }
      if (isExpired) {
        console.log('Cache is stale but will be used due to error');
      }
      return cacheData.jobs || [];
    } catch (error) {
      console.warn('Error reading cache:', error);
      return [];
    }
  }

  private cacheJobs(jobs: Job[]): void {
    try {
      const cacheFile = path.join(this.cacheDir, 'jobs_cache.json');
      const cacheData = { timestamp: Date.now(), jobs };
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), 'utf-8');
      console.log(`Cached ${jobs.length} jobs to ${cacheFile}`);
    } catch (error) {
      console.warn('Error writing cache:', error);
    }
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const createScraper = (): IndeedScraper => {
  return new IndeedScraper();
};
