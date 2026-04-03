#!/usr/bin/env ts-node
/**
 * Initialize Job Scrapers and Load Real Data
 * This script scrapes real job listings from all three sources and loads them into the database
 * Usage: ts-node src/scripts/initializeScrapers.ts
 */

import dotenv from 'dotenv';
import { query } from '../config/database';
import { IndeedScraper } from '../services/scraper';
import { BaytScraper } from '../services/baytScraper';
import { SeekScraper } from '../services/seekScraper';
import { clusterJobs, saveClustersToDb } from '../services/clusteringService';

dotenv.config();

async function main() {
  try {
    console.log('\n============================================');
    console.log('REAL JOB DATA INITIALIZATION');
    console.log('============================================\n');

    const allJobs: any[] = [];
    const scraperResults: any = {
      ireland: { count: 0, error: null },
      dubai: { count: 0, error: null },
      australia: { count: 0, error: null },
    };

    // 1. Scrape Ireland Jobs
    console.log('[1/3] SCRAPING IRELAND JOBS (IrishJobs.ie)...');
    try {
      const irishScraper = new IndeedScraper();
      const irishJobs = await irishScraper.scrapeJobs({
        countries: ['IE'],
        domains: [],
        minExp: 0,
        maxExp: 50,
      });
      console.log(`✓ Found ${irishJobs.length} Ireland jobs`);
      scraperResults.ireland.count = irishJobs.length;
      allJobs.push(...irishJobs);
    } catch (error) {
      console.error('✗ Error scraping Ireland jobs:', error instanceof Error ? error.message : error);
      scraperResults.ireland.error = error instanceof Error ? error.message : String(error);
    }

    // 2. Scrape Dubai Jobs
    console.log('\n[2/3] SCRAPING DUBAI JOBS (Bayt.com)...');
    try {
      const baytScraper = new BaytScraper();
      const dubaiJobs = await baytScraper.scrapeJobs();
      console.log(`✓ Found ${dubaiJobs.length} Dubai jobs`);
      scraperResults.dubai.count = dubaiJobs.length;
      allJobs.push(...dubaiJobs);
    } catch (error) {
      console.error('✗ Error scraping Dubai jobs:', error instanceof Error ? error.message : error);
      scraperResults.dubai.error = error instanceof Error ? error.message : String(error);
    }

    // 3. Scrape Australia Jobs
    console.log('\n[3/3] SCRAPING AUSTRALIA JOBS (Seek.com.au)...');
    try {
      const seekScraper = new SeekScraper();
      const australiaJobs = await seekScraper.scrapeJobs('developer', 'Australia');
      console.log(`✓ Found ${australiaJobs.length} Australia jobs`);
      scraperResults.australia.count = australiaJobs.length;
      allJobs.push(...australiaJobs);
    } catch (error) {
      console.error('✗ Error scraping Australia jobs:', error instanceof Error ? error.message : error);
      scraperResults.australia.error = error instanceof Error ? error.message : String(error);
    }

    // 4. Insert jobs into database
    console.log(`\n============================================`);
    console.log(`TOTAL JOBS TO INSERT: ${allJobs.length}`);
    console.log(`============================================\n`);

    if (allJobs.length === 0) {
      console.warn('WARNING: No jobs scraped. Check scraper errors above.');
      process.exit(1);
    }

    console.log('INSERTING JOBS INTO DATABASE...');
    let insertedCount = 0;
    const insertedJobIds: number[] = [];

    for (const job of allJobs) {
      try {
        const result = await query(
          `INSERT INTO jobs (
            company, title, location, country, salary_min, salary_max, currency,
            jd_full_text, original_url, source, extracted_skills_required,
            extracted_skills_nice_to_have, experience_level, degree_required,
            soft_skills, job_type, posted_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          ON CONFLICT (original_url) DO NOTHING
          RETURNING id`,
          [
            job.company || 'Unknown',
            job.title || 'Unknown Position',
            job.location || 'Unknown',
            job.country || 'UNKNOWN',
            job.salary_min || null,
            job.salary_max || null,
            job.currency || 'USD',
            job.jd_full_text || '',
            job.original_url || `${job.source}_${Date.now()}_${Math.random()}`,
            job.source || 'Unknown',
            job.extracted_skills_required || [],
            job.extracted_skills_nice_to_have || [],
            job.experience_level || 'Not specified',
            job.degree_required || 'Not specified',
            job.soft_skills || [],
            job.job_type || 'Full-time',
            job.posted_date || new Date(),
          ]
        );

        if (result.rows.length > 0) {
          insertedJobIds.push(result.rows[0].id);
          insertedCount++;
        }
      } catch (error) {
        console.warn(`Warning: Failed to insert job: ${job.title}`, error instanceof Error ? error.message : error);
      }
    }

    console.log(`✓ Successfully inserted ${insertedCount} jobs into database`);

    // 5. Run clustering algorithm
    if (insertedJobIds.length > 0) {
      console.log(`\nRUNNING JOB CLUSTERING ALGORITHM...`);
      try {
        const jobsForClustering = await query(
          `SELECT * FROM jobs WHERE id = ANY($1)`,
          [insertedJobIds]
        );

        const clustersMap = await clusterJobs(jobsForClustering.rows);
        console.log(`✓ Created ${clustersMap.size} job clusters`);

        // Save clusters to database
        await saveClustersToDb(clustersMap);
        console.log(`✓ Saved clusters to database`);

        // Update job cluster assignments
        for (const [clusterId, cluster] of clustersMap) {
          for (const jobId of cluster.job_ids) {
            await query(
              `UPDATE jobs SET cluster_id = $1, updated_at = NOW() WHERE id = $2`,
              [clusterId, jobId]
            );
          }
        }
        console.log(`✓ Updated job cluster assignments`);
      } catch (error) {
        console.error('Error during clustering:', error instanceof Error ? error.message : error);
      }
    }

    // 6. Generate statistics report
    console.log(`\n============================================`);
    console.log(`REAL JOB DATA LOADING COMPLETE`);
    console.log(`============================================\n`);

    const countByCountry = await query(
      `SELECT country, COUNT(*) as count FROM jobs GROUP BY country ORDER BY count DESC`
    );

    const topSkills = await query(
      `SELECT UNNEST(extracted_skills_required) as skill, COUNT(*) as count
       FROM jobs WHERE extracted_skills_required IS NOT NULL AND array_length(extracted_skills_required, 1) > 0
       GROUP BY skill ORDER BY count DESC LIMIT 15`
    );

    const salaryStats = await query(
      `SELECT country,
              ROUND(AVG(CAST(salary_min AS NUMERIC)), 0) as avg_min,
              ROUND(AVG(CAST(salary_max AS NUMERIC)), 0) as avg_max,
              MIN(salary_min) as min_min, MAX(salary_max) as max_max
       FROM jobs
       WHERE salary_min IS NOT NULL OR salary_max IS NOT NULL
       GROUP BY country
       ORDER BY country`
    );

    const clusterStats = await query(`SELECT COUNT(*) as total_clusters FROM job_clusters`);
    const totalJobsDb = await query(`SELECT COUNT(*) as total FROM jobs`);

    console.log('FINAL STATISTICS:');
    console.log(`  Total Real Jobs Loaded: ${totalJobsDb.rows[0].total}`);
    console.log(`  Total Clusters Created: ${clusterStats.rows[0].total_clusters}`);
    console.log(`\nJOBS BY COUNTRY:`);
    for (const row of countByCountry.rows) {
      console.log(`  ${row.country}: ${row.count} jobs`);
    }

    console.log(`\nTOP 15 MOST REQUIRED SKILLS:`);
    for (let i = 0; i < Math.min(15, topSkills.rows.length); i++) {
      const row = topSkills.rows[i];
      console.log(`  ${i + 1}. ${row.skill}: ${row.count} occurrences`);
    }

    console.log(`\nSALARY RANGES BY COUNTRY:`);
    for (const row of salaryStats.rows) {
      console.log(`  ${row.country}:`);
      console.log(`    Average: ${row.avg_min} - ${row.avg_max}`);
      console.log(`    Range: ${row.min_min} - ${row.max_max}`);
    }

    console.log(`\nSCRAPER SUMMARY:`);
    console.log(`  Ireland (IrishJobs.ie): ${scraperResults.ireland.count} jobs`);
    if (scraperResults.ireland.error) console.log(`    Error: ${scraperResults.ireland.error}`);
    console.log(`  Dubai (Bayt.com): ${scraperResults.dubai.count} jobs`);
    if (scraperResults.dubai.error) console.log(`    Error: ${scraperResults.dubai.error}`);
    console.log(`  Australia (Seek.com.au): ${scraperResults.australia.count} jobs`);
    if (scraperResults.australia.error) console.log(`    Error: ${scraperResults.australia.error}`);

    console.log(`\n============================================\n`);
    console.log('Initialization complete! All real job data has been loaded.');
    process.exit(0);
  } catch (error) {
    console.error('FATAL ERROR during initialization:', error);
    process.exit(1);
  }
}

main();
