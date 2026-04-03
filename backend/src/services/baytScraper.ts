import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface BaytScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  userAgent?: string;
  maxRetries?: number;
}

interface RawJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  url: string;
  jobType: string;
  experience: string;
  requirements?: string[];
  postedDate?: string;
}

export class BaytScraper {
  private readonly baseUrl: string = 'https://www.bayt.com';
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly maxRetries: number;

  // Common tech skills to extract from descriptions
  private readonly techSkills: string[] = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', '.NET',
    'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django',
    'Flask', 'Spring', 'Hibernate', 'ASP.NET', 'Laravel', 'Symfony',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'REST API', 'GraphQL',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'Microservices', 'Cloud', 'DevOps', 'CI/CD', 'Agile', 'Scrum',
    'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Babel',
    'Jest', 'Mocha', 'Chai', 'Selenium', 'JUnit', 'TestNG',
    'Linux', 'Unix', 'Windows Server', 'MacOS',
  ];

  private readonly softSkills: string[] = [
    'Communication', 'Leadership', 'Team Player', 'Problem Solving',
    'Analytical', 'Critical Thinking', 'Time Management', 'Organizational',
    'Adaptability', 'Creativity', 'Innovation', 'Decision Making',
    'Collaboration', 'Attention to Detail', 'Self-Motivated',
  ];

  constructor(config: BaytScraperConfig = {}) {
    const defaultUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

    this.httpClient = axios.create({
      timeout: config.timeout || 15000,
      headers: {
        'User-Agent': config.userAgent || defaultUserAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': this.baseUrl,
      },
    });

    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'bayt');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours
    this.maxRetries = config.maxRetries || 3;

    // Ensure cache directory exists
    this.ensureCacheDir();
  }

  /**
   * Main method to scrape jobs from Bayt.com
   * Retrieves 30-50 real job listings for Dubai/UAE region
   */
  async scrapeJobs(): Promise<Job[]> {
    try {
      console.log('Starting Bayt.com scraper...');

      // Check cache first
      const cachedJobs = this.getFromCache('bayt_jobs');
      if (cachedJobs) {
        console.log('Returning cached Bayt.com jobs');
        return cachedJobs;
      }

      // Fetch jobs from Bayt.com
      const rawJobs = await this.fetchBaytJobs();
      console.log(`Fetched ${rawJobs.length} raw jobs from Bayt.com`);

      // Transform to Job interface
      const jobs = this.transformJobs(rawJobs);

      // Cache the results
      this.saveToCache('bayt_jobs', jobs);

      return jobs;
    } catch (error) {
      console.error('Error scraping Bayt.com:', error);
      throw new Error(
        `Failed to scrape Bayt.com: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetches jobs from Bayt.com with retry logic
   */
  private async fetchBaytJobs(retries: number = 0): Promise<RawJob[]> {
    try {
      const jobs: RawJob[] = [];

      // Search for jobs in Dubai/UAE across multiple domains
      const searchParams = [
        { keywords: 'Software', location: 'Dubai' },
        { keywords: 'Developer', location: 'Abu Dhabi' },
        { keywords: 'Engineer', location: 'UAE' },
      ];

      for (const params of searchParams) {
        try {
          const pageJobs = await this.searchJobs(params.keywords, params.location);
          jobs.push(...pageJobs);

          // Rate limiting - be respectful to the server
          await this.delay(2000);
        } catch (error) {
          console.warn(`Failed to search for ${params.keywords} in ${params.location}:`, error);
          continue;
        }
      }

      // Ensure we have a good mix and remove duplicates
      return this.deduplicateJobs(jobs);
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`Retry ${retries + 1}/${this.maxRetries}...`);
        await this.delay(3000);
        return this.fetchBaytJobs(retries + 1);
      }
      throw error;
    }
  }

  /**
   * Searches jobs on Bayt.com with given keywords and location
   */
  private async searchJobs(keywords: string, location: string): Promise<RawJob[]> {
    const jobs: RawJob[] = [];

    try {
      // Bayt.com search URL format
      const searchUrl = `${this.baseUrl}/en/Pages/SearchResults.aspx?q=${encodeURIComponent(keywords)}&l=${encodeURIComponent(location)}`;
      console.log(`Fetching jobs from: ${searchUrl}`);

      const response = await this.httpClient.get(searchUrl);
      const $ = cheerio.load(response.data);

      // Parse job listings - using common Bayt.com selectors
      const jobElements = $('.jobs-listing').find('.job-item, .job-card, [data-job-id]');

      jobElements.each((index: number, element: Element) => {
        try {
          const job = this.parseJobElement($, element);
          if (job && job.title && job.company) {
            jobs.push(job);
          }
        } catch (parseError) {
          console.warn('Error parsing job element:', parseError);
        }
      });

      console.log(`Found ${jobs.length} jobs from search`);
    } catch (error) {
      console.error('Error searching jobs:', error);
    }

    return jobs;
  }

  /**
   * Parses a single job element from the page
   */
  private parseJobElement($: cheerio.CheerioAPI, element: Element): RawJob | null {
    try {
      const $el = $(element);

      // Extract basic information
      const titleSelector = ['.job-title h2', '.job-title', '.job-link h2', 'h2.job-title', 'a.job-title'];
      let title = '';
      for (const selector of titleSelector) {
        title = $el.find(selector).text().trim() || $el.find(selector).attr('title')?.trim() || '';
        if (title) break;
      }

      const companySelector = ['.company-name', '.company', '.employer-name', '[itemprop="hiringOrganization"]'];
      let company = '';
      for (const selector of companySelector) {
        company = $el.find(selector).text().trim();
        if (company) break;
      }

      const locationSelector = ['.location', '.job-location', '[itemprop="jobLocation"]', '.place'];
      let location = '';
      for (const selector of locationSelector) {
        location = $el.find(selector).text().trim();
        if (location) break;
      }

      const descriptionSelector = ['.job-description', '.job-summary', '.description', 'p.job-details'];
      let description = '';
      for (const selector of descriptionSelector) {
        description = $el.find(selector).text().trim();
        if (description) break;
      }

      const salarySelector = ['.salary', '.job-salary', '[itemprop="baseSalary"]'];
      let salary = '';
      for (const selector of salarySelector) {
        salary = $el.find(selector).text().trim();
        if (salary) break;
      }

      const urlSelector = ['a.job-link', 'a.job-title', 'a[href*="/en/Viewjob"]'];
      let url = '';
      for (const selector of urlSelector) {
        const href = $el.find(selector).attr('href');
        if (href) {
          url = href.startsWith('http') ? href : this.baseUrl + href;
          break;
        }
      }

      // Extract job type if available
      const jobTypeSelector = ['.job-type', '.employment-type'];
      let jobType = 'Full-time';
      for (const selector of jobTypeSelector) {
        const type = $el.find(selector).text().trim();
        if (type) {
          jobType = type;
          break;
        }
      }

      // Extract experience level
      const expSelector = ['.experience', '.years-of-experience', '[itemprop="experienceRequirements"]'];
      let experience = '';
      for (const selector of expSelector) {
        experience = $el.find(selector).text().trim();
        if (experience) break;
      }

      if (!title || !company) {
        return null;
      }

      return {
        title,
        company,
        location: location || 'Dubai, UAE',
        salary: salary || '',
        description,
        url: url || '',
        jobType,
        experience,
      };
    } catch (error) {
      console.warn('Error parsing job element:', error);
      return null;
    }
  }

  /**
   * Fetches detailed job information from the job page
   */
  async fetchJobDetails(jobUrl: string): Promise<{ description: string; requirements: string[] } | null> {
    try {
      if (!jobUrl) return null;

      const response = await this.httpClient.get(jobUrl);
      const $ = cheerio.load(response.data);

      // Extract detailed requirements and description
      const requirements: string[] = [];
      const reqSelectors = ['.job-requirements', '.requirements ul li', '.qualifications li', '[class*="requirement"]'];

      for (const selector of reqSelectors) {
        $(selector).each((_: number, el: Element) => {
          const text = $(el).text().trim();
          if (text && !requirements.includes(text)) {
            requirements.push(text);
          }
        });
      }

      const fullDescription = $('.job-description-container, .job-details, article').text().trim();

      return {
        description: fullDescription || '',
        requirements,
      };
    } catch (error) {
      console.warn('Error fetching job details:', error);
      return null;
    }
  }

  /**
   * Transforms raw job data to Job interface
   */
  private transformJobs(rawJobs: RawJob[]): Job[] {
    return rawJobs.map((raw, index) => {
      const id = index + 1000; // Start from 1000 to avoid conflicts with other sources

      // Extract skills from description and requirements
      const { requiredSkills, niceToHaveSkills } = this.extractSkills(
        raw.description,
        raw.requirements?.join(' ') || ''
      );

      // Extract experience level
      const experienceLevel = this.extractExperienceLevel(raw.experience || raw.description);

      // Parse salary
      const { min, max } = this.parseSalary(raw.salary || '');

      // Extract soft skills mentioned in description
      const softSkills = this.extractSoftSkills(raw.description);

      const job: Job = {
        id,
        company: raw.company.trim(),
        title: raw.title.trim(),
        location: raw.location || 'Dubai, UAE',
        country: 'AE',
        salary_min: min,
        salary_max: max,
        currency: 'AED',
        jd_full_text: this.generateJobDescription(raw),
        original_url: raw.url || `${this.baseUrl}`,
        source: 'Bayt',
        extracted_skills_required: requiredSkills,
        extracted_skills_nice_to_have: niceToHaveSkills,
        experience_level: experienceLevel,
        degree_required: this.extractDegreeRequirement(raw.description),
        soft_skills: softSkills,
        job_type: raw.jobType || 'Full-time',
        posted_date: this.parsePostedDate(raw.postedDate),
      };

      return job;
    });
  }

  /**
   * Extracts technical skills from description
   */
  private extractSkills(
    description: string,
    requirements: string
  ): { requiredSkills: string[]; niceToHaveSkills: string[] } {
    const text = (description + ' ' + requirements).toLowerCase();
    const requiredSkills: string[] = [];
    const niceToHaveSkills: string[] = [];

    for (const skill of this.techSkills) {
      const skillLower = skill.toLowerCase();
      if (text.includes(skillLower)) {
        // Check if it's mentioned as a requirement
        if (text.includes(`required`) && text.indexOf(skillLower) < text.lastIndexOf(`required`) + 100) {
          requiredSkills.push(skill);
        } else if (text.includes(`preferred`) || text.includes(`nice to have`)) {
          niceToHaveSkills.push(skill);
        } else {
          requiredSkills.push(skill);
        }
      }
    }

    // Remove duplicates
    return {
      requiredSkills: [...new Set(requiredSkills)],
      niceToHaveSkills: [...new Set(niceToHaveSkills)],
    };
  }

  /**
   * Extracts soft skills from description
   */
  private extractSoftSkills(description: string): string[] {
    const text = description.toLowerCase();
    return this.softSkills.filter((skill) => text.includes(skill.toLowerCase()));
  }

  /**
   * Extracts experience level from job details
   */
  private extractExperienceLevel(text: string): string {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('entry level') || lowerText.includes('0-2 years') || lowerText.includes('fresh')) {
      return 'Entry-Level';
    }
    if (lowerText.includes('senior') || lowerText.includes('10+') || lowerText.includes('lead')) {
      return 'Senior';
    }
    if (lowerText.includes('junior') || lowerText.includes('0-1 years') || lowerText.includes('graduate')) {
      return 'Junior';
    }
    if (lowerText.includes('3-5') || lowerText.includes('mid-level') || lowerText.includes('intermediate')) {
      return 'Mid-Level';
    }
    return 'Mid-Level'; // Default
  }

  /**
   * Extracts degree requirement from description
   */
  private extractDegreeRequirement(description: string): string {
    const text = description.toLowerCase();
    if (text.includes('phd') || text.includes('doctorate')) return 'PhD';
    if (text.includes('master')) return 'Master';
    if (text.includes('bachelor') || text.includes("bachelor's") || text.includes('degree')) return 'Bachelor';
    if (text.includes('high school') || text.includes('diploma')) return 'High School';
    return 'Bachelor'; // Default for tech roles
  }

  /**
   * Parses salary from string
   */
  private parseSalary(salaryStr: string): { min: number | undefined; max: number | undefined } {
    if (!salaryStr) return { min: undefined, max: undefined };

    const numbers = salaryStr.match(/\d+,?\d*/g);
    if (!numbers || numbers.length === 0) return { min: undefined, max: undefined };

    const values = numbers.map((n) => parseInt(n.replace(/,/g, ''), 10));

    // Assume first is min, second is max if two values
    if (values.length >= 2) {
      return { min: values[0], max: values[1] };
    }

    // Single value - estimate range
    return { min: values[0], max: Math.round(values[0] * 1.3) };
  }

  /**
   * Parses posted date
   */
  private parsePostedDate(dateStr?: string): Date {
    if (!dateStr) return new Date();

    try {
      return new Date(dateStr);
    } catch {
      return new Date();
    }
  }

  /**
   * Generates formatted job description
   */
  private generateJobDescription(job: RawJob): string {
    return `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Job Type: ${job.jobType || 'Full-time'}

Description:
${job.description || 'No description available'}

${job.requirements ? `Requirements:\n${job.requirements.map((r) => `- ${r}`).join('\n')}` : ''}

Source: Bayt.com
URL: ${job.url}
    `.trim();
  }

  /**
   * Deduplicates jobs by title and company
   */
  private deduplicateJobs(jobs: RawJob[]): RawJob[] {
    const seen = new Set<string>();
    const unique: RawJob[] = [];

    for (const job of jobs) {
      const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(job);
      }
    }

    // Return 30-50 jobs
    return unique.slice(0, 50);
  }

  /**
   * Cache management methods
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  private getFromCache(key: string): Job[] | null {
    try {
      const filePath = this.getCacheFilePath(key);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtime.getTime();

      if (age > this.cacheTTL) {
        fs.unlinkSync(filePath);
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Error reading cache:', error);
      return null;
    }
  }

  private saveToCache(key: string, data: Job[]): void {
    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Cache saved: ${filePath}`);
    } catch (error) {
      console.warn('Error saving cache:', error);
    }
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create a Bayt scraper instance
 */
export const createBaytScraper = (config?: BaytScraperConfig): BaytScraper => {
  return new BaytScraper(config);
};
