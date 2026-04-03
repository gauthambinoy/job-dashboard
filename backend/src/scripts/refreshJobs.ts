import { JobAggregator } from '../services/jobAggregator';
import { query } from '../config/database';
import { Job } from '../types/index';

/**
 * Refresh Jobs Script
 *
 * Scrapes all enabled sources via the JobAggregator,
 * then upserts every job into the `jobs` table.
 *
 * Usage:  ts-node src/scripts/refreshJobs.ts
 *    or:  npm run refresh-jobs
 */

async function upsertJob(job: Job): Promise<'inserted' | 'updated' | 'skipped'> {
  const sql = `
    INSERT INTO jobs (
      company, title, location, country,
      salary_min, salary_max, currency,
      jd_full_text, original_url, source,
      extracted_skills_required, extracted_skills_nice_to_have,
      experience_level, degree_required, soft_skills,
      job_type, posted_date
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7,
      $8, $9, $10,
      $11, $12,
      $13, $14, $15,
      $16, $17
    )
    ON CONFLICT (original_url) DO UPDATE SET
      company   = EXCLUDED.company,
      title     = EXCLUDED.title,
      location  = EXCLUDED.location,
      country   = EXCLUDED.country,
      salary_min = EXCLUDED.salary_min,
      salary_max = EXCLUDED.salary_max,
      currency  = EXCLUDED.currency,
      jd_full_text = EXCLUDED.jd_full_text,
      source    = EXCLUDED.source,
      extracted_skills_required = EXCLUDED.extracted_skills_required,
      extracted_skills_nice_to_have = EXCLUDED.extracted_skills_nice_to_have,
      experience_level = EXCLUDED.experience_level,
      degree_required  = EXCLUDED.degree_required,
      soft_skills      = EXCLUDED.soft_skills,
      job_type    = EXCLUDED.job_type,
      posted_date = EXCLUDED.posted_date
    RETURNING (xmax = 0) AS is_insert;
  `;

  const params = [
    job.company,
    job.title,
    job.location,
    job.country,
    job.salary_min ?? null,
    job.salary_max ?? null,
    job.currency ?? null,
    job.jd_full_text,
    job.original_url,
    job.source,
    job.extracted_skills_required ?? [],
    job.extracted_skills_nice_to_have ?? [],
    job.experience_level ?? null,
    job.degree_required ?? null,
    job.soft_skills ?? [],
    job.job_type ?? null,
    job.posted_date ?? new Date(),
  ];

  try {
    const res = await query(sql, params);
    if (res.rows.length === 0) return 'skipped';
    return res.rows[0].is_insert ? 'inserted' : 'updated';
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Skip duplicate / constraint errors silently
    if (msg.includes('duplicate') || msg.includes('unique')) return 'skipped';
    console.error(`[refreshJobs] Error upserting "${job.title}": ${msg}`);
    return 'skipped';
  }
}

async function main() {
  console.log('=== Job Refresh Script ===');
  console.log(`Started at ${new Date().toISOString()}\n`);

  const aggregator = new JobAggregator();

  console.log('Aggregating jobs from all sources...\n');
  const result = await aggregator.aggregateJobs();

  console.log(`\nTotal jobs fetched: ${result.totalJobs}`);
  console.log('By source:', result.bySource);
  console.log('\nUpserting jobs into database...\n');

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const job of result.jobs) {
    try {
      const outcome = await upsertJob(job);
      if (outcome === 'inserted') inserted++;
      else if (outcome === 'updated') updated++;
      else skipped++;
    } catch {
      errors++;
    }
  }

  console.log('\n=== Refresh Complete ===');
  console.log(`Total processed: ${result.jobs.length}`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated:  ${updated}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Errors:   ${errors}`);
  console.log(`Finished at ${new Date().toISOString()}`);

  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in refreshJobs:', err);
  process.exit(1);
});
