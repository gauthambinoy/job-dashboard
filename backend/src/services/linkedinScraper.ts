import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';
import type { AnyNode } from 'domhandler';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

/** Configuration options for the LinkedIn scraper. */
export interface LinkedInScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
  userAgent?: string;
  maxRetries?: number;
  keywords?: string[];
  location?: string;
}

/** Shape of a job as scraped from LinkedIn before transformation. */
interface RawLinkedInJob {
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
  listingId?: string;
}

/** Enriched details fetched from a job detail page. */
interface JobDetails {
  description: string;
  salary: string;
  experience: string;
  jobType: string;
  requirements: string[];
}

/** Cache metadata returned by {@link LinkedInScraper.getCacheInfo}. */
interface CacheInfo {
  cacheKey: string;
  cacheDir: string;
  cacheTTLMs: number;
  cacheFilePath: string;
  isCached: boolean;
  cacheAgeMs: number | null;
}

export class LinkedInScraper {
  private readonly baseUrl = 'https://www.linkedin.com';
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
    'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP',
    'Terraform', 'Ansible', 'Helm', 'Prometheus', 'Grafana',
  ];

  private readonly softSkills: string[] = [
    'Communication', 'Leadership', 'Team Player', 'Problem Solving',
    'Analytical', 'Critical Thinking', 'Time Management', 'Organizational',
    'Adaptability', 'Creativity', 'Innovation', 'Decision Making',
    'Collaboration', 'Attention to Detail', 'Self-Motivated',
    'Mentoring', 'Cross-functional', 'Stakeholder Management',
  ];

  constructor(config: LinkedInScraperConfig = {}) {
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
        'Referer': 'https://www.linkedin.com/',
      },
    });

    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'linkedin');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours
    this.maxRetries = config.maxRetries || 3;
    this.keywords = config.keywords || ['Software Engineer', 'Developer', 'Full Stack'];
    this.location = config.location || '';

    // Ensure cache directory exists
    this.ensureCacheDir();
  }

  /**
   * Main method to scrape jobs from LinkedIn.
   *
   * Optional per-call overrides for `keywords` and `location` allow the same
   * scraper instance to be reused across different searches (e.g. from route
   * handlers or the job aggregator) without re-constructing the class.
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

    const cacheKey = this.buildCacheKey();

    try {
      console.log('Starting LinkedIn scraper...');

      // Check cache first
      const cachedJobs = this.getFromCache(cacheKey);
      if (cachedJobs) {
        console.log(`Returning ${cachedJobs.length} cached LinkedIn jobs`);
        return cachedJobs;
      }

      // Fetch jobs from LinkedIn
      const rawJobs = await this.fetchLinkedInJobs();
      console.log(`Fetched ${rawJobs.length} raw jobs from LinkedIn`);

      // Transform to Job interface
      const jobs = this.transformJobs(rawJobs);

      // Cache the results
      this.saveToCache(cacheKey, jobs);

      return jobs;
    } catch (error) {
      console.error('Error scraping LinkedIn:', error);

      // Attempt to return stale cache on error rather than failing completely
      const staleJobs = this.getFromCache(cacheKey, /* ignoreExpiry */ true);
      if (staleJobs) {
        console.warn('Returning stale cached LinkedIn jobs due to scrape error');
        return staleJobs;
      }

      throw new Error(
        `Failed to scrape LinkedIn: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Returns metadata about the current cache entry for the active
   * keyword/location combination. Used by route handlers to surface cache
   * status to API consumers.
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
   * Fetches jobs from LinkedIn with retry logic
   */
  async fetchLinkedInJobs(retries: number = 0): Promise<RawLinkedInJob[]> {
    try {
      const jobs: RawLinkedInJob[] = [];

      for (const keyword of this.keywords) {
        try {
          const pageJobs = await this.searchJobs(keyword, this.location);
          jobs.push(...pageJobs);

          // Rate limiting - respect LinkedIn's servers
          await this.delay(3000 + Math.random() * 2000);
        } catch (error) {
          console.warn(`Failed to search LinkedIn for "${keyword}" in "${this.location}":`, error);
          continue;
        }
      }

      return this.deduplicateJobs(jobs);
    } catch (error) {
      if (retries < this.maxRetries) {
        console.log(`LinkedIn retry ${retries + 1}/${this.maxRetries}...`);
        await this.delay(5000);
        return this.fetchLinkedInJobs(retries + 1);
      }
      throw error;
    }
  }

  /**
   * Searches LinkedIn jobs using the public job search page
   */
  async searchJobs(keywords: string, location: string): Promise<RawLinkedInJob[]> {
    const jobs: RawLinkedInJob[] = [];

    try {
      // LinkedIn public job search URL - no auth required
      const params = new URLSearchParams({
        keywords,
        ...(location ? { location } : {}),
        trk: 'public_jobs_jobs-search-bar_search-submit',
        position: '1',
        pageNum: '0',
      });

      const searchUrl = `${this.baseUrl}/jobs/search/?${params.toString()}`;
      console.log(`Fetching LinkedIn jobs from: ${searchUrl}`);

      const response = await this.httpClient.get(searchUrl);
      const $ = cheerio.load(response.data);

      // LinkedIn public job cards are rendered server-side under various selectors
      const cardSelectors = [
        'div.base-card',
        'li.jobs-search__results-list > div',
        '.job-search-card',
        '[data-entity-urn]',
      ];

      let jobElements: cheerio.Cheerio<AnyNode> = $() as cheerio.Cheerio<AnyNode>;
      for (const sel of cardSelectors) {
        const found = $(sel);
        if (found.length > 0) {
          jobElements = found as cheerio.Cheerio<AnyNode>;
          console.log(`LinkedIn: matched ${found.length} job cards with selector "${sel}"`);
          break;
        }
      }

      jobElements.each((_: number, element: AnyNode) => {
        try {
          const job = this.parseJobCard($, element);
          if (job && job.title && job.company) {
            jobs.push(job);
          }
        } catch (parseError) {
          console.warn('Error parsing LinkedIn job card:', parseError);
        }
      });

      console.log(`LinkedIn: extracted ${jobs.length} jobs for keyword "${keywords}"`);
    } catch (error) {
      console.error('Error searching LinkedIn jobs:', error);
    }

    return jobs;
  }

  /**
   * Parses a single job card element from the LinkedIn search results page
   */
  parseJobCard($: cheerio.CheerioAPI, element: AnyNode): RawLinkedInJob | null {
    try {
      const $el = $(element);

      // Title
      const titleSelectors = [
        'h3.base-search-card__title',
        '.job-search-card__title',
        'h3[class*="title"]',
        'a[class*="title"]',
        'h3',
        'h2',
      ];
      let title = '';
      for (const sel of titleSelectors) {
        title = $el.find(sel).first().text().trim();
        if (title) break;
      }

      // Company
      const companySelectors = [
        'h4.base-search-card__subtitle',
        '.job-search-card__company-name',
        'a[data-tracking-control-name*="company"]',
        'h4[class*="subtitle"]',
        '.company-name',
        'h4',
      ];
      let company = '';
      for (const sel of companySelectors) {
        company = $el.find(sel).first().text().trim();
        if (company) break;
      }

      // Location
      const locationSelectors = [
        'span.job-search-card__location',
        '.base-search-card__metadata span',
        '[class*="location"]',
        'span[class*="location"]',
      ];
      let location = '';
      for (const sel of locationSelectors) {
        location = $el.find(sel).first().text().trim();
        if (location) break;
      }

      // URL
      let url = '';
      const linkSelectors = [
        'a.base-card__full-link',
        'a[data-tracking-control-name*="jobs"]',
        'a[href*="/jobs/view/"]',
        'a[href*="linkedin.com/jobs"]',
        'a',
      ];
      for (const sel of linkSelectors) {
        const href = $el.find(sel).first().attr('href');
        if (href) {
          url = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
          // Strip tracking query params but keep the path
          try {
            const parsed = new URL(url);
            url = `${parsed.origin}${parsed.pathname}`;
          } catch {
            // keep as-is
          }
          break;
        }
      }

      // Listing ID from data attribute (useful for dedup)
      const listingId: string | undefined =
        $el.attr('data-entity-urn') ||
        $el.find('[data-entity-urn]').first().attr('data-entity-urn') ||
        undefined;

      // Posted date
      const postedDate: string | undefined =
        $el.find('time').attr('datetime') ||
        $el.find('[class*="date"]').first().text().trim() ||
        undefined;

      // Job type / badge (e.g. "Full-time", "Remote")
      const badgeSelectors = [
        '.job-search-card__benefits-item',
        '[class*="benefit"]',
        '.base-search-card__metadata > span:last-child',
      ];
      let jobType = '';
      for (const sel of badgeSelectors) {
        jobType = $el.find(sel).first().text().trim();
        if (jobType) break;
      }

      // Description snippet (not always present on search result cards)
      const descriptionSelectors = [
        '.job-search-card__snippet',
        '[class*="description"]',
        'p',
      ];
      let description = '';
      for (const sel of descriptionSelectors) {
        description = $el.find(sel).first().text().trim();
        if (description) break;
      }

      if (!title || !company) {
        return null;
      }

      return {
        title,
        company,
        location: location || this.location || 'Remote',
        salary: '',
        description,
        url,
        jobType: jobType || 'Full-time',
        experience: '',
        requirements: [],
        postedDate,
        listingId,
      };
    } catch (error) {
      console.warn('Error parsing LinkedIn job card:', error);
      return null;
    }
  }

  /**
   * Fetches the full job detail page to enrich description, salary, experience, and skills
   */
  async fetchJobDetails(jobUrl: string): Promise<JobDetails | null> {
    try {
      if (!jobUrl) return null;

      await this.delay(2000 + Math.random() * 1500);
      const response = await this.httpClient.get(jobUrl);
      const $ = cheerio.load(response.data);

      // Full description
      const descriptionSelectors = [
        '.show-more-less-html__markup',
        '.description__text',
        '[class*="description-content"]',
        'section.description div',
        '.jobs-description__content',
      ];
      let fullDescription = '';
      for (const sel of descriptionSelectors) {
        fullDescription = $(sel).first().text().trim();
        if (fullDescription) break;
      }

      // Salary
      const salarySelectors = [
        '.compensation__salary',
        '[class*="salary"]',
        '.job-details-jobs-unified-top-card__job-insight span',
      ];
      let salary = '';
      for (const sel of salarySelectors) {
        salary = $(sel).first().text().trim();
        if (salary) break;
      }

      // Experience level / job criteria
      const criteriaMap: Record<string, string> = {};
      $('li.description__job-criteria-item').each((_: number, el: AnyNode) => {
        const header = $(el).find('h3').text().trim().toLowerCase();
        const value = $(el).find('span').text().trim();
        if (header && value) criteriaMap[header] = value;
      });

      const experience: string =
        criteriaMap['seniority level'] ||
        criteriaMap['experience level'] ||
        '';

      const jobType: string =
        criteriaMap['employment type'] ||
        criteriaMap['job type'] ||
        '';

      // Requirements list items
      const requirements: string[] = [];
      $(
        '.show-more-less-html__markup ul li, .description__text ul li, section.description ul li',
      ).each((_: number, el: AnyNode) => {
        const text = $(el).text().trim();
        if (text) requirements.push(text);
      });

      return {
        description: fullDescription,
        salary,
        experience,
        jobType,
        requirements,
      };
    } catch (error) {
      console.warn(`Error fetching LinkedIn job details for ${jobUrl}:`, error);
      return null;
    }
  }

  /**
   * Transforms raw LinkedIn job data into the canonical Job interface
   */
  transformJobs(rawJobs: RawLinkedInJob[]): Job[] {
    return rawJobs.map((raw, index) => {
      const id = index + 5000; // 5000-range to avoid collisions with other scrapers

      const fullText = [raw.description, ...(raw.requirements || [])].join(' ');
      const { requiredSkills, niceToHaveSkills } = this.extractSkills(fullText);
      const softSkills = this.extractSoftSkills(fullText);
      const experienceLevel = this.extractExperienceLevel(raw.experience || fullText);
      const degreeRequired = this.extractDegreeRequirement(fullText);
      const { min, max } = this.parseSalary(raw.salary || '');
      const country = this.deriveCountry(raw.location);
      const currency = this.deriveCurrency(country);

      const job: Job = {
        id,
        company: raw.company.trim(),
        title: raw.title.trim(),
        location: raw.location || 'Remote',
        country,
        salary_min: min,
        salary_max: max,
        currency,
        jd_full_text: this.buildJobDescription(raw),
        original_url: raw.url || `${this.baseUrl}/jobs/search/`,
        source: 'LinkedIn',
        extracted_skills_required: requiredSkills,
        extracted_skills_nice_to_have: niceToHaveSkills,
        experience_level: experienceLevel,
        degree_required: degreeRequired,
        soft_skills: softSkills,
        job_type: this.normaliseJobType(raw.jobType),
        posted_date: this.parsePostedDate(raw.postedDate),
      };

      return job;
    });
  }

  // ---------------------------------------------------------------------------
  // Skill / text extraction helpers
  // ---------------------------------------------------------------------------

  private extractSkills(text: string): { requiredSkills: string[]; niceToHaveSkills: string[] } {
    const lowerText = text.toLowerCase();
    const requiredSkills: string[] = [];
    const niceToHaveSkills: string[] = [];

    for (const skill of this.techSkills) {
      if (!lowerText.includes(skill.toLowerCase())) continue;

      const idx = lowerText.indexOf(skill.toLowerCase());
      const surroundingText = lowerText.slice(Math.max(0, idx - 120), idx + 120);

      if (
        surroundingText.includes('preferred') ||
        surroundingText.includes('nice to have') ||
        surroundingText.includes('bonus') ||
        surroundingText.includes('a plus')
      ) {
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

  private extractSoftSkills(text: string): string[] {
    const lower = text.toLowerCase();
    return this.softSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  }

  private extractExperienceLevel(text: string): string {
    const lower = text.toLowerCase();

    if (
      lower.includes('entry level') ||
      lower.includes('entry-level') ||
      lower.includes('0-2 years') ||
      lower.includes('0-1 year') ||
      lower.includes('fresh graduate') ||
      lower.includes('new grad')
    ) {
      return 'Entry-Level';
    }

    if (
      lower.includes('senior') ||
      lower.includes('staff') ||
      lower.includes('principal') ||
      lower.includes('lead') ||
      lower.includes('10+ years') ||
      lower.includes('8+ years')
    ) {
      return 'Senior';
    }

    if (
      lower.includes('junior') ||
      lower.includes('associate') ||
      lower.includes('0-3 years') ||
      lower.includes('1-2 years')
    ) {
      return 'Junior';
    }

    if (
      lower.includes('mid-level') ||
      lower.includes('mid level') ||
      lower.includes('intermediate') ||
      lower.includes('3-5 years') ||
      lower.includes('4-6 years')
    ) {
      return 'Mid-Level';
    }

    if (lower.includes('director') || lower.includes('vp') || lower.includes('head of')) {
      return 'Executive';
    }

    return 'Mid-Level'; // safe default
  }

  private extractDegreeRequirement(text: string): string {
    const lower = text.toLowerCase();

    if (lower.includes('phd') || lower.includes('doctorate') || lower.includes('ph.d'))
      return 'PhD';

    if (
      lower.includes("master's") ||
      lower.includes('masters') ||
      lower.includes('msc') ||
      lower.includes('m.s.')
    )
      return 'Master';

    if (
      lower.includes("bachelor's") ||
      lower.includes('bachelors') ||
      lower.includes('bsc') ||
      lower.includes('b.s.') ||
      lower.includes('degree in') ||
      lower.includes('undergraduate')
    ) {
      return 'Bachelor';
    }

    if (lower.includes('high school') || lower.includes('diploma') || lower.includes('ged'))
      return 'High School';

    return 'Bachelor'; // common default for tech roles
  }

  private parseSalary(salaryStr: string): { min: number | undefined; max: number | undefined } {
    if (!salaryStr) return { min: undefined, max: undefined };

    // Handle ranges like "$80,000 - $120,000" or "£50k - £70k"
    const normalised = salaryStr.replace(/[£$€]/g, '').replace(/k/gi, '000');
    const numbers = normalised.match(/\d[\d,]*/g);
    if (!numbers || numbers.length === 0) return { min: undefined, max: undefined };

    const values = numbers
      .map((n) => parseInt(n.replace(/,/g, ''), 10))
      .filter((n) => !isNaN(n) && n > 0);

    if (values.length >= 2) {
      return { min: Math.min(...values), max: Math.max(...values) };
    }
    if (values.length === 1) {
      return { min: values[0], max: Math.round(values[0] * 1.25) };
    }

    return { min: undefined, max: undefined };
  }

  private normaliseJobType(raw: string): string {
    if (!raw) return 'Full-time';
    const lower = raw.toLowerCase();
    if (lower.includes('part')) return 'Part-time';
    if (lower.includes('contract') || lower.includes('freelance')) return 'Contract';
    if (lower.includes('intern')) return 'Internship';
    if (lower.includes('temporary') || lower.includes('temp')) return 'Temporary';
    if (lower.includes('volunteer')) return 'Volunteer';
    return 'Full-time';
  }

  /**
   * Derives a two-letter ISO country code from a location string
   */
  private deriveCountry(location: string): string {
    const lower = location.toLowerCase();

    if (
      lower.includes('united states') ||
      lower.includes(', us') ||
      lower.match(
        /,\s*(ca|ny|tx|fl|wa|ma|il|ga|co|nc|va|az|nv|or|mn|oh|mi|pa|nj|md|ut|tn|mo|wi|in|sc)\b/,
      )
    )
      return 'US';

    if (
      lower.includes('united kingdom') ||
      lower.includes(' uk') ||
      lower.includes('england') ||
      lower.includes('scotland') ||
      lower.includes('london') ||
      lower.includes('manchester') ||
      lower.includes('edinburgh')
    )
      return 'GB';

    if (
      lower.includes('canada') ||
      lower.includes('toronto') ||
      lower.includes('vancouver') ||
      lower.includes('montreal')
    )
      return 'CA';

    if (
      lower.includes('australia') ||
      lower.includes('sydney') ||
      lower.includes('melbourne') ||
      lower.includes('brisbane')
    )
      return 'AU';

    if (lower.includes('ireland') || lower.includes('dublin') || lower.includes('cork'))
      return 'IE';

    if (
      lower.includes('germany') ||
      lower.includes('berlin') ||
      lower.includes('munich') ||
      lower.includes('hamburg')
    )
      return 'DE';

    if (
      lower.includes('india') ||
      lower.includes('bangalore') ||
      lower.includes('mumbai') ||
      lower.includes('delhi') ||
      lower.includes('hyderabad')
    )
      return 'IN';

    if (lower.includes('singapore')) return 'SG';

    if (lower.includes('uae') || lower.includes('dubai') || lower.includes('abu dhabi'))
      return 'AE';

    if (lower.includes('netherlands') || lower.includes('amsterdam')) return 'NL';

    if (lower.includes('france') || lower.includes('paris')) return 'FR';

    if (lower.includes('remote') || lower.includes('worldwide') || lower.includes('anywhere'))
      return 'REMOTE';

    return 'US'; // sensible default for LinkedIn
  }

  private deriveCurrency(country: string): string {
    const map: Record<string, string> = {
      US: 'USD',
      GB: 'GBP',
      CA: 'CAD',
      AU: 'AUD',
      IE: 'EUR',
      DE: 'EUR',
      NL: 'EUR',
      FR: 'EUR',
      IN: 'INR',
      SG: 'SGD',
      AE: 'AED',
      REMOTE: 'USD',
    };
    return map[country] || 'USD';
  }

  private parsePostedDate(dateStr?: string): Date {
    if (!dateStr) return new Date();

    try {
      // ISO datetime string from <time datetime="...">
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) return parsed;

      // Relative strings like "2 days ago"
      const relative = dateStr.toLowerCase();
      const now = new Date();
      const match = relative.match(/(\d+)\s*(hour|day|week|month)/);
      if (match) {
        const num = parseInt(match[1], 10);
        const unit = match[2];
        if (unit === 'hour') now.setHours(now.getHours() - num);
        else if (unit === 'day') now.setDate(now.getDate() - num);
        else if (unit === 'week') now.setDate(now.getDate() - num * 7);
        else if (unit === 'month') now.setMonth(now.getMonth() - num);
        return now;
      }
    } catch {
      // fall through
    }

    return new Date();
  }

  private buildJobDescription(job: RawLinkedInJob): string {
    return `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Job Type: ${job.jobType || 'Full-time'}
${job.salary ? `Salary: ${job.salary}` : ''}
${job.experience ? `Experience: ${job.experience}` : ''}

Description:
${job.description || 'No description available'}

${job.requirements && job.requirements.length > 0 ? `Requirements:\n${job.requirements.map((r) => `- ${r}`).join('\n')}` : ''}

Source: LinkedIn
URL: ${job.url}
    `.trim();
  }

  // ---------------------------------------------------------------------------
  // Deduplication
  // ---------------------------------------------------------------------------

  private deduplicateJobs(jobs: RawLinkedInJob[]): RawLinkedInJob[] {
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const unique: RawLinkedInJob[] = [];

    for (const job of jobs) {
      // Prefer dedup by LinkedIn listing ID when available
      if (job.listingId) {
        if (seenIds.has(job.listingId)) continue;
        seenIds.add(job.listingId);
      }

      const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      unique.push(job);
    }

    return unique.slice(0, 50);
  }

  // ---------------------------------------------------------------------------
  // Cache helpers
  // ---------------------------------------------------------------------------

  private buildCacheKey(): string {
    const keywordSlug = this.keywords
      .join('_')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .slice(0, 40);
    const locationSlug =
      this.location
        .toLowerCase()
        .replace(/\s+/g, '-')
        .slice(0, 20) || 'global';
    return `linkedin_${keywordSlug}_${locationSlug}`;
  }

  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  private getFromCache(key: string, ignoreExpiry: boolean = false): Job[] | null {
    try {
      const filePath = this.getCacheFilePath(key);
      if (!fs.existsSync(filePath)) return null;

      if (!ignoreExpiry) {
        const stats = fs.statSync(filePath);
        const age = Date.now() - stats.mtime.getTime();
        if (age > this.cacheTTL) {
          fs.unlinkSync(filePath);
          return null;
        }
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as Job[];
    } catch (error) {
      console.warn('Error reading LinkedIn cache:', error);
      return null;
    }
  }

  private saveToCache(key: string, data: Job[]): void {
    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`LinkedIn cache saved: ${filePath}`);
    } catch (error) {
      console.warn('Error saving LinkedIn cache:', error);
    }
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create a LinkedIn scraper instance
 */
export const createLinkedInScraper = (config?: LinkedInScraperConfig): LinkedInScraper => {
  return new LinkedInScraper(config);
};
