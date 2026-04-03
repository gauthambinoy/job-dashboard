import { query } from '../config/database';
import { Job } from '../types/index';
import { createJobAggregator } from './jobAggregator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Job Initializer Service
 * Populates the database with jobs from multiple sources
 * Provides utilities to initialize and refresh the job database
 */

export class JobInitializer {
  private aggregator = createJobAggregator();

  /**
   * Initialize database with jobs from all sources
   */
  async initializeJobDatabase(): Promise<{
    success: boolean;
    message: string;
    inserted: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      success: false,
      message: '',
      inserted: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      console.log('Starting job database initialization...');

      // Aggregate jobs from all sources
      const aggregationResult = await this.aggregator.aggregateJobs();

      if (aggregationResult.jobs.length === 0) {
        results.message = 'No jobs found during aggregation';
        return results;
      }

      console.log(`Fetched ${aggregationResult.jobs.length} jobs, inserting into database...`);

      // Insert jobs into database
      for (const job of aggregationResult.jobs) {
        try {
          await this.insertJob(job);
          results.inserted++;
        } catch (error) {
          if (error instanceof Error && error.message.includes('already exists')) {
            results.skipped++;
          } else {
            results.errors.push(`Error inserting job "${job.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      results.success = true;
      results.message = `Successfully initialized database: ${results.inserted} new jobs inserted, ${results.skipped} duplicates skipped`;

      console.log(results.message);
      return results;
    } catch (error) {
      results.message = `Failed to initialize job database: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(results.message);
      console.error(results.message);
      return results;
    }
  }

  /**
   * Refresh existing jobs (update stale data)
   */
  async refreshJobs(): Promise<{
    success: boolean;
    message: string;
    updated: number;
    errors: string[];
  }> {
    const results = {
      success: false,
      message: '',
      updated: 0,
      errors: [] as string[],
    };

    try {
      console.log('Starting job refresh...');

      // Get latest jobs
      const aggregationResult = await this.aggregator.aggregateJobs();

      for (const job of aggregationResult.jobs) {
        try {
          await this.updateJobIfExists(job);
          results.updated++;
        } catch (error) {
          results.errors.push(`Error updating job "${job.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      results.success = true;
      results.message = `Updated ${results.updated} jobs`;

      console.log(results.message);
      return results;
    } catch (error) {
      results.message = `Failed to refresh jobs: ${error instanceof Error ? error.message : 'Unknown error'}`;
      results.errors.push(results.message);
      console.error(results.message);
      return results;
    }
  }

  /**
   * Get database job statistics
   */
  async getDatabaseStats(): Promise<{
    totalJobs: number;
    bySource: Record<string, number>;
    byCountry: Record<string, number>;
    byExperienceLevel: Record<string, number>;
    oldestJob: Date | null;
    newestJob: Date | null;
  }> {
    try {
      const result = await query('SELECT * FROM jobs');
      const jobs = result.rows;

      const stats = {
        totalJobs: jobs.length,
        bySource: {} as Record<string, number>,
        byCountry: {} as Record<string, number>,
        byExperienceLevel: {} as Record<string, number>,
        oldestJob: null as Date | null,
        newestJob: null as Date | null,
      };

      if (jobs.length === 0) return stats;

      for (const job of jobs) {
        // Count by source
        stats.bySource[job.source] = (stats.bySource[job.source] || 0) + 1;

        // Count by country
        stats.byCountry[job.country] = (stats.byCountry[job.country] || 0) + 1;

        // Count by experience level
        const level = job.experience_level || 'Unknown';
        stats.byExperienceLevel[level] = (stats.byExperienceLevel[level] || 0) + 1;

        // Track oldest and newest
        const postedDate = new Date(job.posted_date || job.created_at);
        if (!stats.oldestJob || postedDate < stats.oldestJob) {
          stats.oldestJob = postedDate;
        }
        if (!stats.newestJob || postedDate > stats.newestJob) {
          stats.newestJob = postedDate;
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Delete old jobs (older than specified days)
   */
  async deleteOldJobs(daysOld: number = 30): Promise<{
    success: boolean;
    deleted: number;
    message: string;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);

      const result = await query(
        'DELETE FROM jobs WHERE created_at < $1 RETURNING id',
        [cutoffDate]
      );

      return {
        success: true,
        deleted: result.rowCount || 0,
        message: `Deleted ${result.rowCount || 0} jobs older than ${daysOld} days`,
      };
    } catch (error) {
      console.error('Error deleting old jobs:', error);
      return {
        success: false,
        deleted: 0,
        message: `Failed to delete old jobs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Export jobs to JSON file
   */
  async exportJobsToJson(filename?: string): Promise<string> {
    try {
      const result = await query('SELECT * FROM jobs ORDER BY created_at DESC');
      const jobs = result.rows;

      const timestamp = new Date().toISOString().split('T')[0];
      const filePath = path.join(process.cwd(), filename || `jobs_export_${timestamp}.json`);

      const exportData = {
        exportedAt: new Date(),
        totalJobs: jobs.length,
        jobs,
      };

      fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

      console.log(`Exported ${jobs.length} jobs to ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('Error exporting jobs:', error);
      throw error;
    }
  }

  /**
   * Insert a single job into the database
   */
  private async insertJob(job: Job): Promise<void> {
    try {
      // Check if job already exists by URL
      if (job.original_url) {
        const existingResult = await query('SELECT id FROM jobs WHERE original_url = $1', [
          job.original_url,
        ]);

        if (existingResult.rows.length > 0) {
          throw new Error('Job URL already exists in database');
        }
      }

      await query(
        `INSERT INTO jobs (
          company, title, location, country, salary_min, salary_max, currency,
          jd_full_text, original_url, source, extracted_skills_required,
          extracted_skills_nice_to_have, experience_level, degree_required,
          soft_skills, job_type, posted_date, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())`,
        [
          job.company,
          job.title,
          job.location,
          job.country,
          job.salary_min || null,
          job.salary_max || null,
          job.currency || 'EUR',
          job.jd_full_text || '',
          job.original_url || '',
          job.source || 'Unknown',
          job.extracted_skills_required || [],
          job.extracted_skills_nice_to_have || [],
          job.experience_level || 'Mid-Level',
          job.degree_required || 'Not specified',
          job.soft_skills || [],
          job.job_type || 'Full-time',
          job.posted_date || new Date(),
        ]
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a job if it already exists
   */
  private async updateJobIfExists(job: Job): Promise<void> {
    try {
      if (!job.original_url) return;

      const existingResult = await query('SELECT id FROM jobs WHERE original_url = $1', [
        job.original_url,
      ]);

      if (existingResult.rows.length === 0) {
        // Job doesn't exist, insert it
        await this.insertJob(job);
        return;
      }

      // Update existing job
      await query(
        `UPDATE jobs SET
          company = $1, title = $2, location = $3, salary_min = $4, salary_max = $5,
          jd_full_text = $6, extracted_skills_required = $7, extracted_skills_nice_to_have = $8,
          experience_level = $9, degree_required = $10, soft_skills = $11, job_type = $12,
          posted_date = $13, updated_at = NOW()
          WHERE original_url = $14`,
        [
          job.company,
          job.title,
          job.location,
          job.salary_min || null,
          job.salary_max || null,
          job.jd_full_text || '',
          job.extracted_skills_required || [],
          job.extracted_skills_nice_to_have || [],
          job.experience_level || 'Mid-Level',
          job.degree_required || 'Not specified',
          job.soft_skills || [],
          job.job_type || 'Full-time',
          job.posted_date || new Date(),
          job.original_url,
        ]
      );
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Factory function
 */
export const createJobInitializer = (): JobInitializer => {
  return new JobInitializer();
};
