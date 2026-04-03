#!/usr/bin/env ts-node
/**
 * Verify Job Data
 * Checks that real job data has been properly loaded and clustered
 */

import dotenv from 'dotenv';
import { query } from '../config/database';

dotenv.config();

async function verifyData() {
  try {
    console.log('\n============================================');
    console.log('VERIFYING REAL JOB DATA');
    console.log('============================================\n');

    // 1. Check total jobs
    const totalResult = await query('SELECT COUNT(*) as total FROM jobs');
    const totalJobs = totalResult.rows[0].total;
    console.log(`Total Jobs in Database: ${totalJobs}`);

    if (totalJobs === 0) {
      console.log('\n⚠️  WARNING: No jobs found in database!');
      console.log('Please run: npm run init-scrapers');
      process.exit(1);
    }

    // 2. Check jobs by country
    const countryResult = await query(
      `SELECT country, COUNT(*) as count, source, AVG(CAST(salary_min AS NUMERIC)) as avg_salary
       FROM jobs
       GROUP BY country, source
       ORDER BY country, count DESC`
    );

    console.log('\nJobs by Country and Source:');
    for (const row of countryResult.rows) {
      console.log(`  ${row.country} - ${row.source}: ${row.count} jobs (avg salary: ${row.avg_salary ? Math.round(row.avg_salary).toLocaleString() : 'N/A'})`);
    }

    // 3. Check clustering
    const clusterResult = await query(
      `SELECT COUNT(*) as total_clusters, AVG(array_length(job_ids, 1)) as avg_jobs_per_cluster
       FROM job_clusters`
    );
    const clusterStats = clusterResult.rows[0];
    console.log(`\nClustering Statistics:`);
    console.log(`  Total Clusters: ${clusterStats.total_clusters}`);
    console.log(`  Avg Jobs per Cluster: ${clusterStats.avg_jobs_per_cluster ? clusterStats.avg_jobs_per_cluster.toFixed(1) : 0}`);

    // 4. Check job clusters assigned
    const clusterAssignedResult = await query(
      `SELECT COUNT(*) as clustered, COUNT(CASE WHEN cluster_id IS NULL THEN 1 END) as unclusteredFROM jobs`
    );
    const { clustered } = clusterAssignedResult.rows[0];
    console.log(`  Jobs Assigned to Clusters: ${clustered}`);

    // 5. Check skills coverage
    const skillsResult = await query(
      `SELECT
        COUNT(CASE WHEN array_length(extracted_skills_required, 1) > 0 THEN 1 END) as with_skills,
        COUNT(CASE WHEN array_length(extracted_skills_required, 1) IS NULL THEN 1 END) as no_skills
       FROM jobs`
    );
    const skillStats = skillsResult.rows[0];
    console.log(`\nSkills Coverage:`);
    console.log(`  Jobs with Skills: ${skillStats.with_skills}`);
    console.log(`  Jobs without Skills: ${skillStats.no_skills}`);
    console.log(`  Coverage: ${((skillStats.with_skills / totalJobs) * 100).toFixed(1)}%`);

    // 6. Check top skills
    const topSkillsResult = await query(
      `SELECT UNNEST(extracted_skills_required) as skill, COUNT(*) as count
       FROM jobs
       WHERE extracted_skills_required IS NOT NULL
       GROUP BY skill
       ORDER BY count DESC
       LIMIT 10`
    );

    console.log(`\nTop 10 Required Skills:`);
    for (let i = 0; i < topSkillsResult.rows.length; i++) {
      const { skill, count } = topSkillsResult.rows[i];
      console.log(`  ${i + 1}. ${skill}: ${count} jobs`);
    }

    // 7. Check salary coverage
    const salaryResult = await query(
      `SELECT
        COUNT(CASE WHEN salary_min IS NOT NULL THEN 1 END) as with_salary,
        COUNT(CASE WHEN salary_min IS NULL THEN 1 END) as no_salary,
        MIN(salary_min) as min_salary,
        MAX(salary_max) as max_salary,
        ROUND(AVG(CAST(salary_min AS NUMERIC)), 0) as avg_min_salary,
        ROUND(AVG(CAST(salary_max AS NUMERIC)), 0) as avg_max_salary
       FROM jobs`
    );
    const salaryStats = salaryResult.rows[0];
    console.log(`\nSalary Coverage:`);
    console.log(`  Jobs with Salary Info: ${salaryStats.with_salary}`);
    console.log(`  Jobs without Salary Info: ${salaryStats.no_salary}`);
    console.log(`  Coverage: ${((salaryStats.with_salary / totalJobs) * 100).toFixed(1)}%`);
    console.log(`  Range: ${salaryStats.min_salary?.toLocaleString()} - ${salaryStats.max_salary?.toLocaleString()}`);
    console.log(`  Average: ${salaryStats.avg_min_salary?.toLocaleString()} - ${salaryStats.avg_max_salary?.toLocaleString()}`);

    // 8. Check job types
    const jobTypesResult = await query(
      `SELECT job_type, COUNT(*) as count
       FROM jobs
       GROUP BY job_type
       ORDER BY count DESC`
    );

    console.log(`\nJob Types Distribution:`);
    for (const { job_type, count } of jobTypesResult.rows) {
      console.log(`  ${job_type}: ${count} jobs`);
    }

    // 9. Check experience levels
    const expResult = await query(
      `SELECT experience_level, COUNT(*) as count
       FROM jobs
       GROUP BY experience_level
       ORDER BY count DESC`
    );

    console.log(`\nExperience Level Distribution:`);
    for (const { experience_level, count } of expResult.rows) {
      console.log(`  ${experience_level}: ${count} jobs`);
    }

    // 10. Data quality score
    let qualityScore = 100;
    if (totalJobs < 100) qualityScore -= 20;
    if (skillStats.with_skills / totalJobs < 0.7) qualityScore -= 15;
    if (salaryStats.with_salary / totalJobs < 0.6) qualityScore -= 10;
    if (clusterStats.total_clusters < 10) qualityScore -= 10;
    if (clustered < totalJobs * 0.8) qualityScore -= 5;

    console.log(`\nData Quality Score: ${qualityScore}/100`);

    if (qualityScore >= 80) {
      console.log('✓ Data quality is EXCELLENT');
    } else if (qualityScore >= 60) {
      console.log('⚠️  Data quality is GOOD but could be improved');
    } else {
      console.log('✗ Data quality needs improvement');
    }

    // 11. Sample jobs
    const sampleResult = await query(
      `SELECT id, title, company, country, source, salary_min, salary_max, extracted_skills_required
       FROM jobs
       ORDER BY created_at DESC
       LIMIT 5`
    );

    console.log(`\nRecent Sample Jobs:`);
    for (const job of sampleResult.rows) {
      console.log(`  [${job.country}] ${job.title} @ ${job.company}`);
      console.log(`    Source: ${job.source} | Salary: ${job.salary_min ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : 'N/A'}`);
      console.log(`    Skills: ${(job.extracted_skills_required || []).slice(0, 3).join(', ')}`);
    }

    console.log(`\n============================================`);
    console.log('VERIFICATION COMPLETE');
    console.log('============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('ERROR during verification:', error);
    process.exit(1);
  }
}

verifyData();
