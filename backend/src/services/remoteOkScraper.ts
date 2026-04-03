import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { Job } from '../types/index';

export interface RemoteOkScraperConfig {
  cacheDir?: string;
  cacheTTL?: number;
  timeout?: number;
}

interface RemoteOkJob {
  id: string;
  epoch: number;
  date: string;
  company: string;
  company_logo: string;
  position: string;
  tags: string[];
  description: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  url: string;
  apply_url?: string;
}

export class RemoteOkScraper {
  private readonly httpClient: AxiosInstance;
  private readonly cacheDir: string;
  private readonly cacheTTL: number;

  private readonly techSkills: string[] = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', '.NET',
    'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django',
    'Flask', 'Spring', 'ASP.NET', 'Laravel',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
    'Git', 'GitHub', 'GitLab', 'REST API', 'GraphQL',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'Microservices', 'Cloud', 'DevOps', 'CI/CD', 'Agile', 'Scrum',
    'HTML', 'CSS', 'Webpack',
    'Jest', 'Selenium', 'Linux',
    'Terraform', 'Ansible', 'Spark', 'Kafka', 'Airflow',
    'Snowflake', 'Databricks', 'BigQuery', 'ETL',
  ];

  private readonly softSkills: string[] = [
    'Communication', 'Leadership', 'Team Player', 'Problem Solving',
    'Analytical', 'Critical Thinking', 'Time Management',
    'Adaptability', 'Creativity', 'Collaboration', 'Attention to Detail',
  ];

  constructor(config: RemoteOkScraperConfig = {}) {
    this.httpClient = axios.create({
      timeout: config.timeout || 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'job-dashboard-scraper/1.0',
      },
    });

    this.cacheDir = config.cacheDir || path.join(process.cwd(), '.cache', 'remoteok');
    this.cacheTTL = config.cacheTTL || 24 * 60 * 60 * 1000; // 24 hours

    this.ensureCacheDir();
  }

  /**
   * Main method to scrape jobs from RemoteOK API
   */
  async scrapeJobs(): Promise<Job[]> {
    try {
      console.log('Starting RemoteOK API scraper...');

      // Check cache first
      const cachedJobs = this.getFromCache('remoteok_jobs');
      if (cachedJobs) {
        console.log(`Returning cached RemoteOK jobs: ${cachedJobs.length} jobs`);
        return cachedJobs;
      }

      const response = await this.httpClient.get<RemoteOkJob[]>('https://remoteok.com/api');

      // The first element is a legal notice / metadata object, skip it
      const rawJobs = Array.isArray(response.data) ? response.data.slice(1) : [];
      console.log(`RemoteOK: fetched ${rawJobs.length} raw jobs`);

      const jobs = rawJobs
        .filter((job: RemoteOkJob) => job.position && job.company)
        .map((job: RemoteOkJob, index: number) => this.transformJob(job, index));

      console.log(`RemoteOK: transformed ${jobs.length} jobs`);

      // Cache results
      this.saveToCache('remoteok_jobs', jobs);

      return jobs;
    } catch (error) {
      console.error('Error scraping RemoteOK:', error);
      throw new Error(
        `Failed to scrape RemoteOK: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Transforms a single RemoteOK job to the Job interface
   */
  private transformJob(raw: RemoteOkJob, index: number): Job {
    const description = this.stripHtml(raw.description || '');
    const tagsText = (raw.tags || []).join(' ');
    const combinedText = description + ' ' + tagsText;

    const { requiredSkills, niceToHaveSkills } = this.extractSkills(combinedText, raw.tags || []);
    const softSkills = this.extractSoftSkills(combinedText);

    return {
      id: parseInt(raw.id, 10) || index + 10000,
      company: raw.company || 'Unknown',
      title: raw.position || 'Unknown',
      location: raw.location || 'Remote',
      country: 'Remote',
      salary_min: raw.salary_min || undefined,
      salary_max: raw.salary_max || undefined,
      currency: 'USD',
      jd_full_text: description,
      original_url: raw.url ? `https://remoteok.com${raw.url}` : (raw.apply_url || ''),
      source: 'RemoteOK' as any,
      extracted_skills_required: requiredSkills,
      extracted_skills_nice_to_have: niceToHaveSkills,
      experience_level: this.extractExperienceLevel(combinedText),
      degree_required: this.extractDegreeRequirement(combinedText),
      soft_skills: softSkills,
      job_type: 'Remote',
      posted_date: raw.date ? new Date(raw.date) : (raw.epoch ? new Date(raw.epoch * 1000) : new Date()),
    };
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

  private extractSkills(
    text: string,
    tags: string[]
  ): { requiredSkills: string[]; niceToHaveSkills: string[] } {
    const lowerText = text.toLowerCase();
    const lowerTags = tags.map((t) => t.toLowerCase());
    const requiredSkills: string[] = [];
    const niceToHaveSkills: string[] = [];

    for (const skill of this.techSkills) {
      const skillLower = skill.toLowerCase();
      const inTags = lowerTags.some((tag) => tag === skillLower || tag.includes(skillLower));
      const inText = lowerText.includes(skillLower);

      if (inTags) {
        // Skills in tags are treated as required
        requiredSkills.push(skill);
      } else if (inText) {
        if (lowerText.includes('nice to have') || lowerText.includes('preferred') || lowerText.includes('bonus')) {
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

  private extractSoftSkills(text: string): string[] {
    const lower = text.toLowerCase();
    return this.softSkills.filter((skill) => lower.includes(skill.toLowerCase()));
  }

  private extractExperienceLevel(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('entry level') || lower.includes('junior') || lower.includes('graduate')) return 'Junior';
    if (lower.includes('senior') || lower.includes('lead') || lower.includes('principal') || lower.includes('staff')) return 'Senior';
    if (lower.includes('mid') || lower.includes('intermediate')) return 'Mid-Level';
    return 'Mid-Level';
  }

  private extractDegreeRequirement(text: string): string {
    const lower = text.toLowerCase();
    if (lower.includes('phd') || lower.includes('doctorate')) return 'PhD';
    if (lower.includes('master')) return 'Master';
    if (lower.includes('bachelor') || lower.includes('degree')) return 'Bachelor';
    return 'Bachelor';
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
      console.warn('Error reading RemoteOK cache:', error);
      return null;
    }
  }

  private saveToCache(key: string, data: Job[]): void {
    try {
      const filePath = this.getCacheFilePath(key);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`RemoteOK cache saved: ${filePath}`);
    } catch (error) {
      console.warn('Error saving RemoteOK cache:', error);
    }
  }
}

/**
 * Factory function to create a RemoteOK scraper instance
 */
export const createRemoteOkScraper = (config?: RemoteOkScraperConfig): RemoteOkScraper => {
  return new RemoteOkScraper(config);
};
