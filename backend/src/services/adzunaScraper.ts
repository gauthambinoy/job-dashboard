import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface AdzunaScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  appId?: string;
  appKey?: string;
  countries?: string[];
  keywords?: string[];
}

interface AdzunaResult {
  id: string;
  title: string;
  description: string;
  redirect_url: string;
  created: string;
  company: { display_name: string };
  location: { display_name: string; area: string[] };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  category: { label: string; tag: string };
  contract_type?: string;
  contract_time?: string;
}

interface AdzunaResponse {
  results: AdzunaResult[];
  count: number;
  mean: number;
}

const COUNTRY_CURRENCY: Record<string, string> = {
  gb: 'GBP',
  us: 'USD',
  au: 'AUD',
  de: 'EUR',
  fr: 'EUR',
  in: 'INR',
  nz: 'NZD',
  ca: 'CAD',
  at: 'EUR',
  ie: 'EUR',
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  gb: 'GB',
  us: 'US',
  au: 'AU',
  de: 'DE',
  fr: 'FR',
  in: 'IN',
  nz: 'NZ',
  ca: 'CA',
  at: 'AT',
  ie: 'IE',
};

export class AdzunaScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly appId: string;
  private readonly appKey: string;
  private readonly countries: string[];
  private readonly keywords: string[];

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
    'Linux', 'Unix', 'Windows Server', 'Terraform', 'Ansible',
    'Spark', 'Hadoop', 'Kafka', 'Airflow', 'dbt', 'Snowflake',
    'Databricks', 'BigQuery', 'Redshift', 'ETL', 'Data Pipeline',
  ];

  private readonly softSkills: string[] = [
    'Communication', 'Leadership', 'Team Player', 'Problem Solving',
    'Analytical', 'Critical Thinking', 'Time Management', 'Organizational',
    'Adaptability', 'Creativity', 'Innovation', 'Decision Making',
    'Collaboration', 'Attention to Detail', 'Self-Motivated',
  ];

  constructor(config: AdzunaScraperConfig = {}) {
    this.appId = config.appId || process.env.ADZUNA_APP_ID || '';
    this.appKey = config.appKey || process.env.ADZUNA_APP_KEY || '';
    this.countries = config.countries || ['gb', 'us', 'au', 'de', 'fr', 'in', 'nz', 'ca', 'at', 'ie'];
    this.keywords = config.keywords || [
      'software developer',
      'data engineer',
      'devops engineer',
      'full stack developer',
    ];

    this.httpClient = axios.create({
      timeout: config.timeout || 15000,
      headers: {
        'Accept': 'application/json',
      },
    });

    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'adzuna');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours

    this.ensureCacheDir();
  }

  /**
   * Main method to scrape jobs from Adzuna API
   */
  async scrapeJobs(): Promise<Job[]> {
    try {
      console.log('Starting Adzuna API scraper...');

      // Check cache first
      const cachedJobs = this.getFromCache('adzuna_jobs');
      if (cachedJobs) {
        console.log(`Returning cached Adzuna jobs: ${cachedJobs.length} jobs`);
        return cachedJobs;
      }

      if (!this.appId || !this.appKey) {
        console.warn('ADZUNA_APP_ID or ADZUNA_APP_KEY not set. Skipping Adzuna scraper.');
        return [];
      }

      const allJobs: Job[] = [];

      for (const country of this.countries) {
        for (const keyword of this.keywords) {
          try {
            const jobs = await this.fetchJobs(country, keyword);
            allJobs.push(...jobs);
            // Rate limiting
            await this.delay(500);
          } catch (error) {
            console.warn(`Failed to fetch Adzuna jobs for "${keyword}" in ${country}:`, error);
          }
        }
      }

      // Deduplicate
      const uniqueJobs = this.deduplicateJobs(allJobs);
      console.log(`Adzuna: fetched ${uniqueJobs.length} unique jobs`);

      // Cache results
      this.saveToCache('adzuna_jobs', uniqueJobs);

      return uniqueJobs;
    } catch (error) {
      console.error('Error scraping Adzuna:', error);
      throw new Error(
        `Failed to scrape Adzuna: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Fetches jobs from Adzuna API for a given country and keyword
   */
  private async fetchJobs(country: string, keyword: string, page: number = 1): Promise<Job[]> {
    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`;
    const params = {
      app_id: this.appId,
      app_key: this.appKey,
      what: keyword,
      results_per_page: 50,
      content_type: 'application/json',
    };

    const response = await this.httpClient.get<AdzunaResponse>(url, { params });
    const results = response.data.results || [];

    return results.map((result, index) => this.transformResult(result, country, index));
  }

  /**
   * Transforms a single Adzuna result to a Job
   */
  private transformResult(result: AdzunaResult, country: string, index: number): Job {
    const description = result.description || '';
    const { requiredSkills, niceToHaveSkills } = this.extractSkills(description);
    const softSkills = this.extractSoftSkills(description);

    return {
      id: parseInt(result.id, 10) || index + 5000,
      company: result.company?.display_name || 'Unknown',
      title: result.title || 'Unknown',
      location: result.location?.display_name || '',
      country: COUNTRY_CODE_MAP[country] || country.toUpperCase(),
      salary_min: result.salary_min,
      salary_max: result.salary_max,
      currency: COUNTRY_CURRENCY[country] || 'USD',
      jd_full_text: description,
      original_url: result.redirect_url || '',
      source: 'Adzuna' as any,
      extracted_skills_required: requiredSkills,
      extracted_skills_nice_to_have: niceToHaveSkills,
      experience_level: this.extractExperienceLevel(description),
      degree_required: this.extractDegreeRequirement(description),
      soft_skills: softSkills,
      job_type: this.mapContractType(result.contract_type, result.contract_time),
      posted_date: result.created ? new Date(result.created) : new Date(),
    };
  }

  private mapContractType(contractType?: string, contractTime?: string): string {
    if (contractTime === 'part_time') return 'Part-time';
    if (contractType === 'contract') return 'Contract';
    if (contractType === 'permanent') return 'Full-time';
    return 'Full-time';
  }

  private extractSkills(
    description: string
  ): { requiredSkills: string[]; niceToHaveSkills: string[] } {
    const text = description.toLowerCase();
    const requiredSkills: string[] = [];
    const niceToHaveSkills: string[] = [];

    for (const skill of this.techSkills) {
      const skillLower = skill.toLowerCase();
      if (text.includes(skillLower)) {
        if (text.includes('preferred') || text.includes('nice to have') || text.includes('bonus')) {
          niceToHaveSkills.push(skill);
        } else {
          requiredSkills.push(skill);
        }
      }
    }

    return {
      requiredSkills: [...new Set(requiredSkills)],
      niceToHaveSkills: [...new Set(niceToHaveSkills)],
    };
  }

  private extractSoftSkills(description: string): string[] {
    const text = description.toLowerCase();
    return this.softSkills.filter((skill) => text.includes(skill.toLowerCase()));
  }

  private extractExperienceLevel(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('entry level') || lower.includes('graduate') || lower.includes('junior')) return 'Junior';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal')) return 'Senior';
    if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-Level';
    return 'Mid-Level';
  }

  private extractDegreeRequirement(description: string): string {
    const text = description.toLowerCase();
    if (text.includes('phd') || text.includes('doctorate')) return 'PhD';
    if (text.includes('master')) return 'Master';
    if (text.includes('bachelor') || text.includes('degree')) return 'Bachelor';
    return 'Bachelor';
  }

  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    const unique: Job[] = [];

    for (const job of jobs) {
      const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}|${job.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(job);
      }
    }

    return unique;
  }

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
      if (!fs.existsSync(filePath)) return null;

      const stats = fs.statSync(filePath);
      const age = Date.now() - stats.mtime.getTime();
      if (age > this.cacheTTL) {
        fs.unlinkSync(filePath);
        return null;
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.warn('Error reading Adzuna cache:', error);
      return null;
    }
  }

  private saveToCache(key: string, data: Job[]): void {
    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Adzuna cache saved: ${filePath}`);
    } catch (error) {
      console.warn('Error saving Adzuna cache:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create an Adzuna scraper instance
 */
export const createAdzunaScraper = (config?: AdzunaScraperConfig): AdzunaScraper => {
  return new AdzunaScraper(config);
};
