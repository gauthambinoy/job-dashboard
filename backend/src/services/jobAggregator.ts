import { Job } from '../types/index';
import { IndeedScraper, ScraperFilters } from './scraper';
import { BaytScraper } from './baytScraper';
import { SeekScraper } from './seekScraper';
import { LinkedInScraper } from './linkedinScraper';
import { GlassdoorScraper } from './glassdoorScraper';
import { AdzunaScraper } from './adzunaScraper';
import { RemoteOkScraper } from './remoteOkScraper';
import { ArbeitnowScraper } from './arbeitnowScraper';
import { JobicyScraper } from './jobicyScraper';
import { TheMuseScraper } from './theMuseScraper';
import { GradIrelandScraper } from './gradIrelandScraper';
import { JobsIeScraper } from './jobsIeScraper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Job Aggregator Service
 * Combines job listings from multiple sources (IrishJobs, Bayt.com)
 * Provides comprehensive coverage across regions and job markets
 */

interface AggregatorConfig {
  cacheDir?: string;
  cacheTTL?: number; // in milliseconds
  includeIrishJobs?: boolean;
  includeBayt?: boolean;
  includeSeek?: boolean;
  includeLinkedIn?: boolean;
  includeGlassdoor?: boolean;
  includeAdzuna?: boolean;
  includeRemoteOk?: boolean;
  includeArbeitnow?: boolean;
  includeJobicy?: boolean;
  includeTheMuse?: boolean;
  includeGradIreland?: boolean;
  includeJobsIe?: boolean;
}

interface AggregationResult {
  totalJobs: number;
  bySource: Record<string, number>;
  jobs: Job[];
  aggregatedAt: Date;
}

export class JobAggregator {
  private irishJobsScraper: IndeedScraper;
  private baytScraper: BaytScraper;
  private seekScraper: SeekScraper;
  private linkedInScraper: LinkedInScraper;
  private glassdoorScraper: GlassdoorScraper;
  private adzunaScraper: AdzunaScraper;
  private remoteOkScraper: RemoteOkScraper;
  private arbeitnowScraper: ArbeitnowScraper;
  private jobicyScraper: JobicyScraper;
  private theMuseScraper: TheMuseScraper;
  private gradIrelandScraper: GradIrelandScraper;
  private jobsIeScraper: JobsIeScraper;
  private cacheDir: string;
  private cacheTTL: number;
  private includeIrishJobs: boolean;
  private includeBayt: boolean;
  private includeSeek: boolean;
  private includeLinkedIn: boolean;
  private includeGlassdoor: boolean;
  private includeAdzuna: boolean;
  private includeRemoteOk: boolean;
  private includeArbeitnow: boolean;
  private includeJobicy: boolean;
  private includeTheMuse: boolean;
  private includeGradIreland: boolean;
  private includeJobsIe: boolean;

  constructor(config: AggregatorConfig = {}) {
    this.irishJobsScraper = new IndeedScraper();
    this.baytScraper = new BaytScraper({
      cacheDir: config.cacheDir,
      cacheTTL: config.cacheTTL,
    });
    this.seekScraper = new SeekScraper({
      cacheDir: config.cacheDir,
      cacheTTL: config.cacheTTL,
    });
    this.linkedInScraper = new LinkedInScraper();
    this.glassdoorScraper = new GlassdoorScraper();
    this.adzunaScraper = new AdzunaScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });
    this.remoteOkScraper = new RemoteOkScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });
    this.arbeitnowScraper = new ArbeitnowScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });
    this.jobicyScraper = new JobicyScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });
    this.theMuseScraper = new TheMuseScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });
    this.gradIrelandScraper = new GradIrelandScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });
    this.jobsIeScraper = new JobsIeScraper({ cacheDir: config.cacheDir, cacheTTL: config.cacheTTL });

    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'jobs');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours
    // HTML-scraped sources — disabled by default (403/timeout in production)
    this.includeIrishJobs = config.includeIrishJobs ?? false;
    this.includeBayt = config.includeBayt ?? false;
    this.includeSeek = config.includeSeek ?? false;
    this.includeGlassdoor = config.includeGlassdoor ?? false;
    // LinkedIn HTML scraping still works — enabled by default
    this.includeLinkedIn = config.includeLinkedIn !== false;
    // Free API sources — always reliable
    this.includeAdzuna = config.includeAdzuna !== false;
    this.includeRemoteOk = config.includeRemoteOk !== false;
    this.includeArbeitnow = config.includeArbeitnow !== false;
    this.includeJobicy = config.includeJobicy !== false;
    this.includeTheMuse = config.includeTheMuse !== false;
    this.includeGradIreland = config.includeGradIreland !== false;
    this.includeJobsIe = config.includeJobsIe !== false;

    this.ensureCacheDir();
  }

  /**
   * Fetches and aggregates jobs from all enabled sources
   */
  async aggregateJobs(filters?: ScraperFilters): Promise<AggregationResult> {
    try {
      console.log('Starting job aggregation from all sources...');

      // Check cache first
      const cachedResult = this.getFromCache('aggregated_jobs');
      if (cachedResult) {
        console.log(`Returning cached aggregated jobs: ${cachedResult.totalJobs} jobs`);
        return cachedResult;
      }

      const allJobs: Job[] = [];
      const sourceStats: Record<string, number> = {};

      // Fetch from IrishJobs
      if (this.includeIrishJobs) {
        try {
          console.log('Fetching jobs from IrishJobs...');
          const irishJobsData = filters || {
            countries: ['IE'],
            domains: [],
            minExp: 0,
            maxExp: 20,
          };

          const irishJobs = await this.irishJobsScraper.scrapeJobs(irishJobsData);
          allJobs.push(...irishJobs);
          sourceStats['IrishJobs'] = irishJobs.length;
          console.log(`Fetched ${irishJobs.length} jobs from IrishJobs`);
        } catch (error) {
          console.error('Error fetching from IrishJobs:', error);
          sourceStats['IrishJobs'] = 0;
        }
      }

      // Fetch from Bayt
      if (this.includeBayt) {
        try {
          console.log('Fetching jobs from Bayt.com...');
          const baytJobs = await this.baytScraper.scrapeJobs();
          allJobs.push(...baytJobs);
          sourceStats['Bayt'] = baytJobs.length;
          console.log(`Fetched ${baytJobs.length} jobs from Bayt.com`);
        } catch (error) {
          console.error('Error fetching from Bayt.com:', error);
          sourceStats['Bayt'] = 0;
        }
      }

      // Fetch from Seek (Australia)
      if (this.includeSeek) {
        try {
          console.log('Fetching jobs from Seek.com.au...');
          const seekJobs = await this.seekScraper.scrapeJobs(
            filters?.domains?.join(' ') || '',
            'Australia',
          );
          allJobs.push(...seekJobs);
          sourceStats['Seek'] = seekJobs.length;
          console.log(`Fetched ${seekJobs.length} jobs from Seek.com.au`);
        } catch (error) {
          console.error('Error fetching from Seek.com.au:', error);
          sourceStats['Seek'] = 0;
        }
      }

      // Fetch from LinkedIn
      if (this.includeLinkedIn) {
        try {
          console.log('Fetching jobs from LinkedIn...');
          const linkedInJobs = await this.linkedInScraper.scrapeJobs(
            filters?.domains?.join(' ') || '',
          );
          allJobs.push(...linkedInJobs);
          sourceStats['LinkedIn'] = linkedInJobs.length;
          console.log(`Fetched ${linkedInJobs.length} jobs from LinkedIn`);
        } catch (error) {
          console.error('Error fetching from LinkedIn:', error);
          sourceStats['LinkedIn'] = 0;
        }
      }

      // Fetch from Glassdoor
      if (this.includeGlassdoor) {
        try {
          console.log('Fetching jobs from Glassdoor...');
          const glassdoorJobs = await this.glassdoorScraper.scrapeJobs(
            filters?.domains?.join(' ') || '',
          );
          allJobs.push(...glassdoorJobs);
          sourceStats['Glassdoor'] = glassdoorJobs.length;
          console.log(`Fetched ${glassdoorJobs.length} jobs from Glassdoor`);
        } catch (error) {
          console.error('Error fetching from Glassdoor:', error);
          sourceStats['Glassdoor'] = 0;
        }
      }

      // ── Reliable API sources (high data quality) ──────────────────────────

      // Adzuna — free official API, covers IE, GB, AU, US, DE, and more
      if (this.includeAdzuna) {
        try {
          console.log('Fetching jobs from Adzuna API...');
          const adzunaJobs = await this.adzunaScraper.scrapeJobs();
          allJobs.push(...adzunaJobs);
          sourceStats['Adzuna'] = adzunaJobs.length;
          console.log(`Fetched ${adzunaJobs.length} jobs from Adzuna`);
        } catch (error) {
          console.error('Error fetching from Adzuna:', error);
          sourceStats['Adzuna'] = 0;
        }
      }

      // RemoteOK — free JSON API, remote-first global jobs
      if (this.includeRemoteOk) {
        try {
          console.log('Fetching jobs from RemoteOK API...');
          const remoteOkJobs = await this.remoteOkScraper.scrapeJobs();
          allJobs.push(...remoteOkJobs);
          sourceStats['RemoteOK'] = remoteOkJobs.length;
          console.log(`Fetched ${remoteOkJobs.length} jobs from RemoteOK`);
        } catch (error) {
          console.error('Error fetching from RemoteOK:', error);
          sourceStats['RemoteOK'] = 0;
        }
      }

      // Arbeitnow — free JSON API, Europe-focused tech jobs
      if (this.includeArbeitnow) {
        try {
          console.log('Fetching jobs from Arbeitnow API...');
          const arbeitnowJobs = await this.arbeitnowScraper.scrapeJobs();
          allJobs.push(...arbeitnowJobs);
          sourceStats['Arbeitnow'] = arbeitnowJobs.length;
          console.log(`Fetched ${arbeitnowJobs.length} jobs from Arbeitnow`);
        } catch (error) {
          console.error('Error fetching from Arbeitnow:', error);
          sourceStats['Arbeitnow'] = 0;
        }
      }

      // Jobicy — free JSON API, remote-first global jobs
      if (this.includeJobicy) {
        try {
          console.log('Fetching jobs from Jobicy API...');
          const jobicyJobs = await this.jobicyScraper.scrapeJobs();
          allJobs.push(...jobicyJobs);
          sourceStats['Jobicy'] = jobicyJobs.length;
          console.log(`Fetched ${jobicyJobs.length} jobs from Jobicy`);
        } catch (error) {
          console.error('Error fetching from Jobicy:', error);
          sourceStats['Jobicy'] = 0;
        }
      }

      // The Muse — free JSON API, global tech & startup jobs
      if (this.includeTheMuse) {
        try {
          console.log('Fetching jobs from The Muse API...');
          const theMuseJobs = await this.theMuseScraper.scrapeJobs();
          allJobs.push(...theMuseJobs);
          sourceStats['TheMuse'] = theMuseJobs.length;
          console.log(`Fetched ${theMuseJobs.length} jobs from The Muse`);
        } catch (error) {
          console.error('Error fetching from The Muse:', error);
          sourceStats['TheMuse'] = 0;
        }
      }

      // GradIreland — Ireland's #1 graduate job portal
      if (this.includeGradIreland) {
        try {
          console.log('Fetching jobs from GradIreland...');
          const gradIrelandJobs = await this.gradIrelandScraper.scrapeJobs();
          allJobs.push(...gradIrelandJobs);
          sourceStats['GradIreland'] = gradIrelandJobs.length;
          console.log(`Fetched ${gradIrelandJobs.length} jobs from GradIreland`);
        } catch (error) {
          console.error('Error fetching from GradIreland:', error);
          sourceStats['GradIreland'] = 0;
        }
      }

      // Jobs.ie — Irish job board, graduate/entry-level listings
      if (this.includeJobsIe) {
        try {
          console.log('Fetching jobs from Jobs.ie...');
          const jobsIeJobs = await this.jobsIeScraper.scrapeJobs();
          allJobs.push(...jobsIeJobs);
          sourceStats['JobsIe'] = jobsIeJobs.length;
          console.log(`Fetched ${jobsIeJobs.length} jobs from Jobs.ie`);
        } catch (error) {
          console.error('Error fetching from Jobs.ie:', error);
          sourceStats['JobsIe'] = 0;
        }
      }

      // Deduplicate and sort
      const uniqueJobs = this.deduplicateJobs(allJobs);
      const sortedJobs = this.sortJobsByRelevance(uniqueJobs);

      const result: AggregationResult = {
        totalJobs: sortedJobs.length,
        bySource: sourceStats,
        jobs: sortedJobs,
        aggregatedAt: new Date(),
      };

      // Cache the result
      this.saveToCache('aggregated_jobs', result);

      console.log(`Aggregation complete: ${result.totalJobs} unique jobs from sources:`, sourceStats);
      return result;
    } catch (error) {
      console.error('Error during job aggregation:', error);
      throw new Error(`Failed to aggregate jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetches jobs filtered by specific criteria
   */
  async getJobsByCountry(country: string): Promise<Job[]> {
    const result = await this.aggregateJobs();
    return result.jobs.filter((job) => job.country === country);
  }

  /**
   * Fetches jobs filtered by skill requirements
   */
  async getJobsBySkill(skill: string): Promise<Job[]> {
    const result = await this.aggregateJobs();
    const skillLower = skill.toLowerCase();

    return result.jobs.filter((job) => {
      const requiredSkills = (job.extracted_skills_required || []).map((s) => s.toLowerCase());
      const niceToHaveSkills = (job.extracted_skills_nice_to_have || []).map((s) => s.toLowerCase());
      return requiredSkills.includes(skillLower) || niceToHaveSkills.includes(skillLower);
    });
  }

  /**
   * Gets jobs by experience level
   */
  async getJobsByExperienceLevel(level: 'Junior' | 'Mid-Level' | 'Senior'): Promise<Job[]> {
    const result = await this.aggregateJobs();
    return result.jobs.filter((job) => job.experience_level === level);
  }

  /**
   * Gets jobs within a salary range (in the currency of the job)
   */
  async getJobsBySalaryRange(minSalary: number, maxSalary: number): Promise<Job[]> {
    const result = await this.aggregateJobs();

    return result.jobs.filter((job) => {
      if (!job.salary_min || !job.salary_max) return false;
      // Check overlap with requested range
      return job.salary_min <= maxSalary && job.salary_max >= minSalary;
    });
  }

  /**
   * Gets job statistics
   */
  async getJobStatistics(): Promise<{
    totalJobs: number;
    bySource: Record<string, number>;
    byCountry: Record<string, number>;
    byExperienceLevel: Record<string, number>;
    byJobType: Record<string, number>;
    averageSalaryByCountry: Record<string, { min: number; max: number }>;
  }> {
    const result = await this.aggregateJobs();

    const stats = {
      totalJobs: result.totalJobs,
      bySource: result.bySource,
      byCountry: {} as Record<string, number>,
      byExperienceLevel: {} as Record<string, number>,
      byJobType: {} as Record<string, number>,
      averageSalaryByCountry: {} as Record<string, { min: number; max: number }>,
    };

    for (const job of result.jobs) {
      // Count by country
      stats.byCountry[job.country] = (stats.byCountry[job.country] || 0) + 1;

      // Count by experience level
      const expLevel = job.experience_level || 'Unknown';
      stats.byExperienceLevel[expLevel] = (stats.byExperienceLevel[expLevel] || 0) + 1;

      // Count by job type
      const jobType = job.job_type || 'Unknown';
      stats.byJobType[jobType] = (stats.byJobType[jobType] || 0) + 1;

      // Calculate average salary by country
      if (job.salary_min && job.salary_max) {
        if (!stats.averageSalaryByCountry[job.country]) {
          stats.averageSalaryByCountry[job.country] = {
            min: 0,
            max: 0,
          };
        }
        const countryStats = stats.averageSalaryByCountry[job.country];
        countryStats.min = (countryStats.min + job.salary_min) / 2;
        countryStats.max = (countryStats.max + job.salary_max) / 2;
      }
    }

    return stats;
  }

  /**
   * Clears all caches
   */
  clearCache(): void {
    try {
      const cacheFile = this.getCacheFilePath('aggregated_jobs');
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile);
        console.log('Cache cleared');
      }
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  }

  /**
   * Deduplicates jobs by title and company
   */
  private deduplicateJobs(jobs: Job[]): Job[] {
    const seen = new Map<string, Job>();

    for (const job of jobs) {
      const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}|${job.country}`;
      if (!seen.has(key)) {
        seen.set(key, job);
      } else {
        // Keep the one with more complete information
        const existing = seen.get(key)!;
        if (
          (job.extracted_skills_required?.length || 0) > (existing.extracted_skills_required?.length || 0)
        ) {
          seen.set(key, job);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Sorts jobs by relevance (more info = more relevant)
   */
  private sortJobsByRelevance(jobs: Job[]): Job[] {
    return jobs.sort((a, b) => {
      // Priority 1: Jobs with salary info
      const aSalary = (a.salary_min && a.salary_max) ? 1 : 0;
      const bSalary = (b.salary_min && b.salary_max) ? 1 : 0;
      if (aSalary !== bSalary) return bSalary - aSalary;

      // Priority 2: Jobs with more extracted skills
      const aSkills = (a.extracted_skills_required?.length || 0) + (a.extracted_skills_nice_to_have?.length || 0);
      const bSkills = (b.extracted_skills_required?.length || 0) + (b.extracted_skills_nice_to_have?.length || 0);
      if (aSkills !== bSkills) return bSkills - aSkills;

      // Priority 3: Newer postings first
      const aDate = a.posted_date ? new Date(a.posted_date).getTime() : 0;
      const bDate = b.posted_date ? new Date(b.posted_date).getTime() : 0;
      return bDate - aDate;
    });
  }

  /**
   * Cache management
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  private getFromCache(key: string): AggregationResult | null {
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

  private saveToCache(key: string, data: AggregationResult): void {
    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Aggregated jobs cached: ${filePath}`);
    } catch (error) {
      console.warn('Error saving cache:', error);
    }
  }
}

/**
 * Factory function to create aggregator
 */
export const createJobAggregator = (config?: AggregatorConfig): JobAggregator => {
  return new JobAggregator(config);
};
