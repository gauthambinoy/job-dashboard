import { query } from '../config/database';
import { JobAggregator } from './jobAggregator';
import { Job } from '../types/index';

export interface PipelineStats {
  totalJobsInDb: number;
  newJobsAdded: number;
  duplicatesSkipped: number;
  errors: string[];
  bySource: Record<string, number>;
  ranAt: Date;
}

/**
 * Job Pipeline Service
 * Handles fetching, deduplicating, and persisting jobs from all live sources.
 */
export class JobPipeline {
  private aggregator: JobAggregator;

  constructor() {
    this.aggregator = new JobAggregator();
  }

  /**
   * Run a full pipeline cycle: fetch jobs from all scrapers and persist new ones.
   */
  async runFull(): Promise<PipelineStats> {
    const stats: PipelineStats = {
      totalJobsInDb: 0,
      newJobsAdded: 0,
      duplicatesSkipped: 0,
      errors: [],
      bySource: {},
      ranAt: new Date(),
    };

    try {
      console.log('[JobPipeline] Starting full pipeline run...');

      // Fetch jobs from all sources via the aggregator
      const result = await this.aggregator.aggregateJobs();
      stats.bySource = result.bySource;

      console.log(`[JobPipeline] Aggregator returned ${result.totalJobs} jobs`);

      // Persist each job to the database
      for (const job of result.jobs) {
        try {
          const inserted = await this.upsertJob(job);
          if (inserted) {
            stats.newJobsAdded++;
          } else {
            stats.duplicatesSkipped++;
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          stats.errors.push(`Failed to insert job "${job.title}" at ${job.company}: ${msg}`);
        }
      }

      // Count current jobs in DB
      const countResult = await query('SELECT COUNT(*) as count FROM jobs', []);
      stats.totalJobsInDb = parseInt(countResult.rows[0]?.count ?? '0', 10);

      console.log(
        `[JobPipeline] Pipeline run complete. Added ${stats.newJobsAdded} new jobs, ` +
        `skipped ${stats.duplicatesSkipped} duplicates. DB has ${stats.totalJobsInDb} jobs total.`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[JobPipeline] Error during pipeline run:', msg);
      stats.errors.push(msg);
    }

    return stats;
  }

  /**
   * Inserts a job into the database if it doesn't already exist (by original_url).
   * Returns true if inserted, false if it was a duplicate.
   */
  private async upsertJob(job: Job): Promise<boolean> {
    const existing = await query('SELECT id FROM jobs WHERE original_url = $1', [job.original_url]);
    if (existing.rows.length > 0) {
      return false;
    }

    await query(
      `INSERT INTO jobs (
        company, title, location, country, salary_min, salary_max, currency,
        jd_full_text, original_url, source, extracted_skills_required,
        extracted_skills_nice_to_have, experience_level, degree_required,
        soft_skills, job_type, posted_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        job.company,
        job.title,
        job.location,
        job.country,
        job.salary_min ?? null,
        job.salary_max ?? null,
        job.currency ?? 'USD',
        job.jd_full_text,
        job.original_url,
        job.source,
        job.extracted_skills_required ?? [],
        job.extracted_skills_nice_to_have ?? [],
        job.experience_level ?? null,
        job.degree_required ?? null,
        job.soft_skills ?? [],
        job.job_type ?? 'Full-time',
        job.posted_date ?? new Date(),
      ],
    );

    return true;
  }
}

export function createJobPipeline(): JobPipeline {
  return new JobPipeline();
}
