import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface GlassdoorScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  userAgent?: string;
  maxRetries?: number;
  keywords?: string[];
  location?: string;
}

interface RawGlassdoorJob {
  title: string;
  company: string;
  location: string;
  rating?: string;
  salary?: string;
  description: string;
  url: string;
  jobType: string;
  experience?: string;
  requirements?: string[];
  postedDate?: string;
}

interface CacheInfo {
  cacheKey: string;
  cacheDir: string;
  cacheTTLMs: number;
  cacheFilePath: string;
  isCached: boolean;
  cacheAgeMs: number | null;
}

interface SalaryResult {
  min: number | undefined;
  max: number | undefined;
  currency: string | undefined;
}

interface JobDetails {
  description: string;
  salary?: string;
  experience?: string;
  requirements?: string[];
}

export class GlassdoorScraper {
  private readonly baseUrl: string = 'https://www.glassdoor.com';
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;
  private readonly maxRetries: number;
  private keywords: string[];
  private location: string;

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
    'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'Terraform', 'Ansible', 'Kafka', 'RabbitMQ', 'gRPC',
  ];

  private readonly softSkills: string[] = [
    'Communication', 'Leadership', 'Team Player', 'Problem Solving',
    'Analytical', 'Critical Thinking', 'Time Management', 'Organizational',
    'Adaptability', 'Creativity', 'Innovation', 'Decision Making',
    'Collaboration', 'Attention to Detail', 'Self-Motivated',
    'Interpersonal', 'Presentation', 'Mentoring', 'Project Management',
  ];

  // Map common location strings to ISO 3166-1 alpha-2 country codes
  readonly locationCountryMap: Record<string, string> = {
    'united states': 'US',
    'usa': 'US',
    'us': 'US',
    'new york': 'US',
    'san francisco': 'US',
    'seattle': 'US',
    'austin': 'US',
    'chicago': 'US',
    'boston': 'US',
    'los angeles': 'US',
    'united kingdom': 'GB',
    'uk': 'GB',
    'london': 'GB',
    'manchester': 'GB',
    'edinburgh': 'GB',
    'canada': 'CA',
    'toronto': 'CA',
    'vancouver': 'CA',
    'montreal': 'CA',
    'australia': 'AU',
    'sydney': 'AU',
    'melbourne': 'AU',
    'brisbane': 'AU',
    'ireland': 'IE',
    'dublin': 'IE',
    'germany': 'DE',
    'berlin': 'DE',
    'munich': 'DE',
    'france': 'FR',
    'paris': 'FR',
    'netherlands': 'NL',
    'amsterdam': 'NL',
    'india': 'IN',
    'bangalore': 'IN',
    'mumbai': 'IN',
    'hyderabad': 'IN',
    'singapore': 'SG',
    'uae': 'AE',
    'dubai': 'AE',
    'remote': 'US',
  };

  constructor(config: GlassdoorScraperConfig = {}) {
    const defaultUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    this.httpClient = axios.create({
      timeout: config.timeout || 20000,
      headers: {
        'User-Agent': config.userAgent || defaultUserAgent,
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.glassdoor.com/',
      },
      maxRedirects: 5,
    });

    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'glassdoor');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours
    this.maxRetries = config.maxRetries || 3;
    this.keywords = config.keywords || ['Software Engineer', 'Developer', 'Full Stack'];
    this.location = config.location || '';

    this.ensureCacheDir();
  }

  /**
   * Main method to scrape jobs from Glassdoor.
   *
   * Optional per-call overrides for `keywords` and `location` allow the same
   * scraper instance to be reused across different searches without rebuilding
   * the class (e.g. from route handlers or the job aggregator).
   */
  async scrapeJobs(keywordsOverride?: string, locationOverride?: string): Promise<Job[]> {
    // Apply per-call overrides when supplied
    if (keywordsOverride) {
      this.keywords = keywordsOverride
        .split(/[,;|]+/)
        .map((k: string) => k.trim())
        .filter(Boolean);
    }
    if (locationOverride !== undefined) {
      this.location = locationOverride;
    }

    try {
      console.log('Starting Glassdoor scraper...');
      const cacheKey = this.buildCacheKey();
      const cachedJobs = this.getFromCache(cacheKey);
      if (cachedJobs) {
        console.log('Returning cached Glassdoor jobs');
        return cachedJobs;
      }

      const rawJobs = await this.fetchGlassdoorJobs();
      console.log(`Fetched ${rawJobs.length} raw jobs from Glassdoor`);

      const jobs = this.transformJobs(rawJobs);
      this.saveToCache(cacheKey, jobs);
      return jobs;
    } catch (error) {
      console.error('Error scraping Glassdoor:', error);
      throw new Error(
        `Failed to scrape Glassdoor: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Returns cache status information for the current keyword/location combo.
   * Used by route handlers to surface cache status to API consumers.
   */
  getCacheInfo(): CacheInfo {
    const cacheKey = this.buildCacheKey();
    const cacheFilePath = this.getCacheFilePath(cacheKey);
    let isCached = false;
    let cacheAgeMs: number | null = null;

    try {
      if (fs.existsSync(cacheFilePath)) {
        const stats = fs.statSync(cacheFilePath);
        cacheAgeMs = Date.now() - stats.mtime.getTime();
        isCached = cacheAgeMs <= this.cacheTTL;
      }
    } catch {
      // ignore stat errors
    }

    return {
      cacheKey,
      cacheDir: this.cacheDir,
      cacheTTLMs: this.cacheTTL,
      cacheFilePath,
      isCached,
      cacheAgeMs,
    };
  }

  /**
   * Builds a filesystem-safe cache key from the current keyword/location state
   */
  buildCacheKey(): string {
    const keywordSlug = this.keywords
      .join('_')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .slice(0, 40);
    const locationSlug =
      this.location.toLowerCase().replace(/\s+/g, '-').slice(0, 20) || 'global';
    return `glassdoor_${keywordSlug}_${locationSlug}`;
  }

  /**
   * Fetches jobs from Glassdoor with retry logic across all active keywords
   */
  async fetchGlassdoorJobs(retries: number = 0): Promise<RawGlassdoorJob[]> {
    try {
      const jobs: RawGlassdoorJob[] = [];

      for (const keyword of this.keywords) {
        try {
          const pageJobs = await this.searchJobs(keyword, this.location);
          jobs.push(...pageJobs);

          // Rate limiting -- be respectful to the server
          await this.delay(2500);
        } catch (error) {
          console.warn(
            `Failed to search Glassdoor for "${keyword}" in "${this.location}":`,
            error,
          );
          continue;
        }
      }

      return this.deduplicateJobs(jobs);
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`Retry ${retries + 1}/${this.maxRetries}...`);
        await this.delay(3000);
        return this.fetchGlassdoorJobs(retries + 1);
      }
      throw error;
    }
  }

  /**
   * Searches Glassdoor jobs using their public /Job/ listing pages.
   *
   * Glassdoor URL pattern (slug-based, no login required):
   *   https://www.glassdoor.com/Job/<location>-<keyword>-jobs-SRCH_KO0,N.htm
   *
   * The scraper tries multiple card selectors to stay resilient across layout
   * changes, and falls back to JSON-LD structured data embedded in the page.
   */
  async searchJobs(keywords: string, location: string): Promise<RawGlassdoorJob[]> {
    const jobs: RawGlassdoorJob[] = [];

    try {
      const locSlug = location
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const kwSlug = keywords
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const searchUrl = locSlug
        ? `${this.baseUrl}/Job/${locSlug}-${kwSlug}-jobs-SRCH_KO0,${keywords.length}.htm`
        : `${this.baseUrl}/Job/${kwSlug}-jobs-SRCH_KO0,${keywords.length}.htm`;

      console.log(`Fetching Glassdoor jobs from: ${searchUrl}`);

      const response = await this.httpClient.get(searchUrl);
      const $ = cheerio.load(response.data);

      // Try multiple card selectors to handle Glassdoor layout variations
      const cardSelectors = [
        'li[data-test="jobListing"]',
        'li.react-job-listing',
        'article[data-test="jobListing"]',
        '[id^="job-listing-"]',
        '.jobContainer',
        '.jl',
      ];

      let jobElements: cheerio.Cheerio<AnyNode> = $();
      for (const selector of cardSelectors) {
        const found = $(selector);
        if (found.length > 0) {
          jobElements = found;
          break;
        }
      }

      // Fallback: extract jobs from JSON-LD structured data
      if (jobElements.length === 0) {
        const jsonLdJobs = this.extractJsonLdJobs($, location || 'Remote');
        jobs.push(...jsonLdJobs);
      }

      jobElements.each((_index: number, element: AnyNode) => {
        try {
          const job = this.parseJobElement($, element, location || 'Remote');
          if (job && job.title && job.company) {
            jobs.push(job);
          }
        } catch (parseError) {
          console.warn('Error parsing Glassdoor job element:', parseError);
        }
      });

      console.log(`Found ${jobs.length} jobs from Glassdoor search for "${keywords}"`);
    } catch (error) {
      console.error('Error searching Glassdoor jobs:', error);
    }

    return jobs;
  }

  /**
   * Extracts jobs from JSON-LD (application/ld+json) blocks embedded in the page,
   * which Glassdoor sometimes includes for structured job posting data.
   */
  extractJsonLdJobs($: cheerio.CheerioAPI, locationHint: string): RawGlassdoorJob[] {
    const jobs: RawGlassdoorJob[] = [];

    $('script[type="application/ld+json"]').each((_i: number, el: AnyNode) => {
      try {
        const raw = $(el).html() || '';
        const data = JSON.parse(raw);
        const items: unknown[] = Array.isArray(data['@graph']) ? data['@graph'] : [data];

        for (const item of items) {
          if (
            typeof item !== 'object' ||
            item === null ||
            (item as Record<string, unknown>)['@type'] !== 'JobPosting'
          ) {
            continue;
          }

          const jp = item as Record<string, unknown>;
          const title = String(jp['title'] || '').trim();

          const org = jp['hiringOrganization'] as Record<string, unknown> | undefined;
          const company = String(org?.['name'] || '').trim();

          const locObj = jp['jobLocation'] as Record<string, unknown> | undefined;
          const addrObj = locObj?.['address'] as Record<string, unknown> | undefined;
          const city = String(addrObj?.['addressLocality'] || '').trim();
          const region = String(addrObj?.['addressRegion'] || '').trim();
          const country = String(addrObj?.['addressCountry'] || '').trim();
          const locationStr =
            [city, region, country].filter(Boolean).join(', ') || locationHint;

          const description = String(jp['description'] || '').trim();
          const url = String(jp['url'] || jp['sameAs'] || '').trim();
          const datePosted = String(jp['datePosted'] || '').trim();
          const employmentType = String(jp['employmentType'] || 'FULL_TIME').trim();

          const baseSalary = jp['baseSalary'] as Record<string, unknown> | undefined;
          const salaryValue = baseSalary?.['value'] as Record<string, unknown> | undefined;
          const salaryMin = salaryValue?.['minValue'];
          const salaryMax = salaryValue?.['maxValue'];
          const salaryStr =
            salaryMin && salaryMax ? `${salaryMin} - ${salaryMax}` : '';

          const experienceReqs = jp['experienceRequirements'] as string | undefined || '';

          if (title && company) {
            jobs.push({
              title,
              company,
              location: locationStr,
              description,
              url,
              salary: salaryStr || undefined,
              jobType: this.normaliseEmploymentType(employmentType),
              experience: experienceReqs || undefined,
              postedDate: datePosted || undefined,
            });
          }
        }
      } catch {
        // Malformed JSON-LD -- skip silently
      }
    });

    return jobs;
  }

  /**
   * Parses a single job card element from the Glassdoor listing page.
   */
  parseJobElement(
    $: cheerio.CheerioAPI,
    element: AnyNode,
    locationFallback: string,
  ): RawGlassdoorJob | null {
    try {
      const $el = $(element);

      // ---- Title ----
      const titleSelectors = [
        '[data-test="job-title"]',
        'a[data-test="job-link"]',
        '.jobLink',
        '.job-title',
        'a.jobInfoItem',
        'h2 a',
        'h3 a',
      ];
      let title = '';
      for (const sel of titleSelectors) {
        title =
          $el.find(sel).first().text().trim() ||
          $el.find(sel).first().attr('title')?.trim() ||
          '';
        if (title) break;
      }

      // ---- Company ----
      const companySelectors = [
        '[data-test="employer-name"]',
        '.employerName',
        '.jobEmpolyerName',
        '.company-name',
        'span.css-16nw49e',
      ];
      let company = '';
      for (const sel of companySelectors) {
        company = $el.find(sel).first().text().trim();
        if (company) break;
      }

      // ---- Rating ----
      const ratingSelectors = [
        '[data-test="employer-rating"]',
        '.ratingNumber',
        '.companyRating',
        'span.css-ey2fjf',
      ];
      let rating = '';
      for (const sel of ratingSelectors) {
        rating = $el.find(sel).first().text().trim();
        if (rating) break;
      }

      // ---- Location ----
      const locationSelectors = [
        '[data-test="emp-location"]',
        '.loc',
        '.jobLocation',
        '.location',
        'span.css-56kyx5',
      ];
      let location = '';
      for (const sel of locationSelectors) {
        location = $el.find(sel).first().text().trim();
        if (location) break;
      }
      if (!location) location = locationFallback;

      // ---- Salary ----
      const salarySelectors = [
        '[data-test="detailSalary"]',
        '.salary-estimate',
        '.salaryEstimate',
        '.css-1bluz6i',
        'span[data-test*="salary"]',
      ];
      let salary = '';
      for (const sel of salarySelectors) {
        salary = $el.find(sel).first().text().trim();
        if (salary) break;
      }

      // ---- Job Type ----
      const jobTypeSelectors = [
        '[data-test="jobType"]',
        '.jobType',
        '.job-type',
        '.css-1fxu99',
      ];
      let jobType = 'Full-time';
      for (const sel of jobTypeSelectors) {
        const raw = $el.find(sel).first().text().trim();
        if (raw) {
          jobType = raw;
          break;
        }
      }

      // ---- Description snippet ----
      const descSelectors = [
        '[data-test="descSnippet"]',
        '.jobDescriptionSnippet',
        '.desc',
        '.description',
        'p.jobDesc',
      ];
      let description = '';
      for (const sel of descSelectors) {
        description = $el.find(sel).first().text().trim();
        if (description) break;
      }

      // ---- URL ----
      const urlSelectors = [
        'a[data-test="job-link"]',
        'a[href*="/job-listing/"]',
        'a[href*="glassdoor.com/job"]',
        'a.jobLink',
        'h2 a',
        'h3 a',
      ];
      let url = '';
      for (const sel of urlSelectors) {
        const href = $el.find(sel).first().attr('href');
        if (href) {
          url = href.startsWith('http') ? href : this.baseUrl + href;
          break;
        }
      }

      // ---- Posted date ----
      const dateSelectors = [
        '[data-test="job-age"]',
        '.listing-age',
        '.posted-date',
        'span[data-test*="age"]',
      ];
      let postedDate = '';
      for (const sel of dateSelectors) {
        postedDate = $el.find(sel).first().text().trim();
        if (postedDate) break;
      }

      if (!title || !company) {
        return null;
      }

      return {
        title,
        company,
        location,
        rating: rating || undefined,
        salary: salary || undefined,
        description,
        url,
        jobType,
        postedDate: postedDate || undefined,
      };
    } catch (error) {
      console.warn('Error parsing Glassdoor job element:', error);
      return null;
    }
  }

  /**
   * Fetches detailed job information from an individual Glassdoor job page
   */
  async fetchJobDetails(jobUrl: string): Promise<JobDetails | null> {
    try {
      if (!jobUrl) return null;

      const response = await this.httpClient.get(jobUrl);
      const $ = cheerio.load(response.data);

      // Try JSON-LD first for clean structured data
      const jsonLdJobs = this.extractJsonLdJobs($, '');
      if (jsonLdJobs.length > 0) {
        return {
          description: jsonLdJobs[0].description,
          salary: jsonLdJobs[0].salary,
          experience: jsonLdJobs[0].experience,
        };
      }

      // Fall back to DOM scraping
      const requirements: string[] = [];
      const reqSelectors = [
        '[data-test="jobDescriptionText"] ul li',
        '.jobDescriptionContent ul li',
        '.desc ul li',
        '.jobDesc ul li',
      ];

      for (const sel of reqSelectors) {
        $(sel).each((_i: number, el: AnyNode) => {
          const text = $(el).text().trim();
          if (text && !requirements.includes(text)) {
            requirements.push(text);
          }
        });
        if (requirements.length > 0) break;
      }

      const descSelectors = [
        '[data-test="jobDescriptionText"]',
        '.jobDescriptionContent',
        '.desc',
        'article.jobDesc',
      ];
      let fullDescription = '';
      for (const sel of descSelectors) {
        fullDescription = $(sel).first().text().trim();
        if (fullDescription) break;
      }

      return {
        description: fullDescription || '',
        requirements,
      };
    } catch (error) {
      console.warn('Error fetching Glassdoor job details:', error);
      return null;
    }
  }

  /**
   * Transforms raw Glassdoor job data into the canonical Job interface
   */
  transformJobs(rawJobs: RawGlassdoorJob[]): Job[] {
    return rawJobs.map((raw: RawGlassdoorJob, index: number): Job => {
      const id = index + 3000; // Start from 3000 to avoid conflicts with other sources

      const { requiredSkills, niceToHaveSkills } = this.extractSkills(
        raw.description,
        raw.requirements?.join(' ') || '',
      );
      const experienceLevel = this.extractExperienceLevel(raw.experience || raw.description);
      const { min, max, currency } = this.parseSalary(raw.salary || '');
      const softSkills = this.extractSoftSkills(raw.description);
      const countryCode = this.deriveCountryCode(raw.location);

      const job: Job = {
        id,
        company: raw.company.trim(),
        title: raw.title.trim(),
        location: raw.location || 'Remote',
        country: countryCode,
        salary_min: min,
        salary_max: max,
        currency: currency || 'USD',
        jd_full_text: this.generateJobDescription(raw),
        original_url: raw.url || `${this.baseUrl}/Job/`,
        source: 'Glassdoor',
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
   * Derives an ISO 3166-1 alpha-2 country code from a location string
   */
  deriveCountryCode(location: string): string {
    const lower = location.toLowerCase();
    for (const [key, code] of Object.entries(this.locationCountryMap)) {
      if (lower.includes(key)) {
        return code;
      }
    }
    return 'US'; // Default fallback
  }

  /**
   * Extracts technical skills from job description / requirements text
   */
  extractSkills(
    description: string,
    requirements: string,
  ): { requiredSkills: string[]; niceToHaveSkills: string[] } {
    const text = (description + ' ' + requirements).toLowerCase();
    const requiredSkills: string[] = [];
    const niceToHaveSkills: string[] = [];

    for (const skill of this.techSkills) {
      const skillLower = skill.toLowerCase();
      if (!text.includes(skillLower)) continue;

      const preferredIdx = Math.max(
        text.indexOf('preferred'),
        text.indexOf('nice to have'),
        text.indexOf('bonus'),
      );
      const skillIdx = text.indexOf(skillLower);

      // If the skill appears shortly after a "preferred / nice-to-have" marker,
      // treat it as non-required; otherwise it is required.
      if (preferredIdx !== -1 && skillIdx > preferredIdx && skillIdx - preferredIdx < 150) {
        niceToHaveSkills.push(skill);
      } else {
        requiredSkills.push(skill);
      }
    }

    return {
      requiredSkills: [...new Set(requiredSkills)],
      niceToHaveSkills: [...new Set(niceToHaveSkills)],
    };
  }

  /**
   * Extracts soft skills mentioned in description
   */
  extractSoftSkills(description: string): string[] {
    const text = description.toLowerCase();
    return this.softSkills.filter((skill: string) => text.includes(skill.toLowerCase()));
  }

  /**
   * Derives experience level from job text
   */
  extractExperienceLevel(text: string): string {
    const lower = text.toLowerCase();

    if (
      lower.includes('entry level') ||
      lower.includes('entry-level') ||
      lower.includes('0-2 years') ||
      lower.includes('fresh graduate') ||
      lower.includes('new grad')
    ) {
      return 'Entry-Level';
    }

    if (
      lower.includes('junior') ||
      lower.includes('0-1 years') ||
      lower.includes('1-2 years')
    ) {
      return 'Junior';
    }

    if (
      lower.includes('senior') ||
      lower.includes('sr.') ||
      lower.includes('10+ years') ||
      lower.includes('8+ years') ||
      lower.includes('lead') ||
      lower.includes('principal') ||
      lower.includes('staff engineer')
    ) {
      return 'Senior';
    }

    if (
      lower.includes('manager') ||
      lower.includes('director') ||
      lower.includes('head of') ||
      lower.includes('vp of')
    ) {
      return 'Management';
    }

    if (
      lower.includes('3-5 years') ||
      lower.includes('mid-level') ||
      lower.includes('intermediate') ||
      lower.includes('associate')
    ) {
      return 'Mid-Level';
    }

    return 'Mid-Level'; // Default
  }

  /**
   * Extracts degree requirement from description text
   */
  extractDegreeRequirement(description: string): string {
    const text = description.toLowerCase();

    if (text.includes('phd') || text.includes('doctorate')) return 'PhD';
    if (
      text.includes("master's") ||
      text.includes('master of') ||
      text.includes('msc') ||
      text.includes('mba')
    )
      return 'Master';
    if (
      text.includes("bachelor's") ||
      text.includes('bachelor of') ||
      text.includes('b.s.') ||
      text.includes('b.e.') ||
      text.includes('degree in')
    )
      return 'Bachelor';
    if (text.includes('high school') || text.includes('diploma')) return 'High School';

    return 'Bachelor'; // Default for tech roles
  }

  /**
   * Parses salary range from a Glassdoor salary estimate string.
   * Glassdoor typically shows strings like "$120K - $180K (Glassdoor est.)"
   * or "£50,000 - £70,000 a year".
   */
  parseSalary(salaryStr: string): SalaryResult {
    if (!salaryStr) return { min: undefined, max: undefined, currency: undefined };

    // Detect currency symbol
    let currency: string | undefined;
    if (salaryStr.includes('$')) currency = 'USD';
    else if (salaryStr.includes('£')) currency = 'GBP';
    else if (salaryStr.includes('€')) currency = 'EUR';
    else if (salaryStr.includes('A$') || /aud/i.test(salaryStr)) currency = 'AUD';
    else if (salaryStr.includes('C$') || /cad/i.test(salaryStr)) currency = 'CAD';

    // Remove currency symbols and narrative text, then resolve K notation
    const cleaned = salaryStr
      .replace(/\$|£|€|A\$|C\$/g, '')
      .replace(/glassdoor est\.|per year|a year|\/yr|\/year|\/mo|per month/gi, '');
    const withK = cleaned.replace(
      /([\d,]+)K/gi,
      (_m: string, n: string) => String(parseInt(n.replace(/,/g, ''), 10) * 1000),
    );

    const numbers = withK.match(/[\d,]+/g);
    if (!numbers || numbers.length === 0) return { min: undefined, max: undefined, currency };

    const values = numbers.map((n: string) => parseInt(n.replace(/,/g, ''), 10));

    if (values.length >= 2) {
      return { min: values[0], max: values[1], currency };
    }

    // Single value -- estimate a +/-15% range
    const base = values[0];
    return {
      min: Math.round(base * 0.85),
      max: Math.round(base * 1.15),
      currency,
    };
  }

  /**
   * Converts Glassdoor / JSON-LD employment type strings to readable labels
   */
  normaliseEmploymentType(raw: string): string {
    const map: Record<string, string> = {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACTOR: 'Contract',
      TEMPORARY: 'Temporary',
      INTERN: 'Internship',
      VOLUNTEER: 'Volunteer',
      PER_DIEM: 'Per Diem',
      OTHER: 'Other',
    };
    return map[raw.toUpperCase()] || raw;
  }

  /**
   * Parses a posted-date string into a Date object.
   * Glassdoor uses relative strings like "30d", "1d", "Just posted".
   */
  parsePostedDate(dateStr?: string): Date {
    if (!dateStr) return new Date();

    const now = new Date();

    // Relative patterns: "30d", "2d"
    const daysMatch = dateStr.match(/(\d+)\s*d/i);
    if (daysMatch) {
      now.setDate(now.getDate() - parseInt(daysMatch[1], 10));
      return now;
    }

    // "Just posted" or "Today"
    if (/just posted|today/i.test(dateStr)) return now;

    // Try ISO / natural date parse
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;
    } catch {
      // fall through
    }

    return now;
  }

  /**
   * Generates a formatted job description string for the jd_full_text field
   */
  generateJobDescription(job: RawGlassdoorJob): string {
    const parts: string[] = [
      `Job Title: ${job.title}`,
      `Company: ${job.company}`,
      `Location: ${job.location}`,
      `Job Type: ${job.jobType || 'Full-time'}`,
    ];

    if (job.rating) parts.push(`Company Rating: ${job.rating}/5`);
    if (job.salary) parts.push(`Salary: ${job.salary}`);

    parts.push('');
    parts.push('Description:');
    parts.push(job.description || 'No description available');

    if (job.requirements && job.requirements.length > 0) {
      parts.push('');
      parts.push('Requirements:');
      parts.push(...job.requirements.map((r: string) => `- ${r}`));
    }

    parts.push('');
    parts.push('Source: Glassdoor');
    if (job.url) parts.push(`URL: ${job.url}`);

    return parts.join('\n').trim();
  }

  /**
   * Deduplicates jobs by (title, company) pair and caps output at 50 listings
   */
  private deduplicateJobs(jobs: RawGlassdoorJob[]): RawGlassdoorJob[] {
    const seen = new Set<string>();
    const unique: RawGlassdoorJob[] = [];

    for (const job of jobs) {
      const key = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(job);
      }
    }

    return unique.slice(0, 50);
  }

  // ------------------------------------------------------------------ //
  //  Cache management
  // ------------------------------------------------------------------ //

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
      return JSON.parse(data) as Job[];
    } catch (error) {
      console.warn('Error reading Glassdoor cache:', error);
      return null;
    }
  }

  private saveToCache(key: string, data: Job[]): void {
    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`Glassdoor cache saved: ${filePath}`);
    } catch (error) {
      console.warn('Error saving Glassdoor cache:', error);
    }
  }

  // ------------------------------------------------------------------ //
  //  Utility
  // ------------------------------------------------------------------ //

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create a GlassdoorScraper instance
 */
export const createGlassdoorScraper = (config?: GlassdoorScraperConfig): GlassdoorScraper => {
  return new GlassdoorScraper(config);
};
