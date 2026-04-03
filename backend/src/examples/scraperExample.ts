/**
 * Scraper Usage Examples
 * This file demonstrates how to use the job scraper system
 */

import { createBaytScraper } from '../services/baytScraper';
import { createJobAggregator } from '../services/jobAggregator';
import { createJobInitializer } from '../services/jobInitializer';
import { IndeedScraper, ScraperFilters } from '../services/scraper';

/**
 * Example 1: Scrape from Bayt.com only
 */
async function example1_BaytScraperOnly() {
  console.log('\n=== Example 1: Bayt.com Scraper ===');

  const baytScraper = createBaytScraper({
    cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
    timeout: 15000,
  });

  try {
    const jobs = await baytScraper.scrapeJobs();
    console.log(`Found ${jobs.length} jobs from Bayt.com`);

    // Show first job
    if (jobs.length > 0) {
      const firstJob = jobs[0];
      console.log('\nFirst job:');
      console.log(`  Title: ${firstJob.title}`);
      console.log(`  Company: ${firstJob.company}`);
      console.log(`  Location: ${firstJob.location}`);
      console.log(`  Salary: ${firstJob.salary_min} - ${firstJob.salary_max} ${firstJob.currency}`);
      console.log(`  Skills: ${firstJob.extracted_skills_required?.join(', ')}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 2: Scrape from IrishJobs only
 */
async function example2_IrishJobsOnly() {
  console.log('\n=== Example 2: IrishJobs Scraper ===');

  const irishJobsScraper = new IndeedScraper();
  const filters: ScraperFilters = {
    countries: ['IE'],
    domains: [],
    minExp: 0,
    maxExp: 20,
  };

  try {
    const jobs = await irishJobsScraper.scrapeJobs(filters);
    console.log(`Found ${jobs.length} jobs from IrishJobs`);

    // Count by experience level
    const byLevel: Record<string, number> = {};
    for (const job of jobs) {
      const level = job.experience_level || 'Unknown';
      byLevel[level] = (byLevel[level] || 0) + 1;
    }
    console.log('By experience level:', byLevel);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 3: Aggregate jobs from all sources
 */
async function example3_AggregateAllSources() {
  console.log('\n=== Example 3: Job Aggregation ===');

  const aggregator = createJobAggregator();

  try {
    const result = await aggregator.aggregateJobs();

    console.log(`\nTotal jobs: ${result.totalJobs}`);
    console.log('By source:');
    for (const [source, count] of Object.entries(result.bySource)) {
      console.log(`  ${source}: ${count}`);
    }

    // Show distribution
    console.log(`\nShowing first 5 jobs:`);
    result.jobs.slice(0, 5).forEach((job, i) => {
      console.log(`\n${i + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Source: ${job.source}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 4: Filter jobs by country
 */
async function example4_FilterByCountry() {
  console.log('\n=== Example 4: Filter by Country ===');

  const aggregator = createJobAggregator();

  try {
    // Get UAE jobs
    const uaeJobs = await aggregator.getJobsByCountry('AE');
    console.log(`Found ${uaeJobs.length} jobs in UAE`);

    // Get Ireland jobs
    const ieJobs = await aggregator.getJobsByCountry('IE');
    console.log(`Found ${ieJobs.length} jobs in Ireland`);

    // Show salary ranges by country
    const countries = ['AE', 'IE'];
    for (const country of countries) {
      const jobs = await aggregator.getJobsByCountry(country);
      if (jobs.length > 0) {
        const withSalary = jobs.filter((j) => j.salary_min && j.salary_max);
        if (withSalary.length > 0) {
          const avgMin = withSalary.reduce((sum, j) => sum + (j.salary_min || 0), 0) / withSalary.length;
          const avgMax = withSalary.reduce((sum, j) => sum + (j.salary_max || 0), 0) / withSalary.length;
          console.log(`\n${country} average salary: ${Math.round(avgMin)} - ${Math.round(avgMax)}`);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 5: Filter jobs by skill
 */
async function example5_FilterBySkill() {
  console.log('\n=== Example 5: Filter by Skill ===');

  const aggregator = createJobAggregator();
  const skillsToSearch = ['React', 'Python', 'Node.js', 'TypeScript'];

  try {
    for (const skill of skillsToSearch) {
      const jobs = await aggregator.getJobsBySkill(skill);
      console.log(`\n${skill}: ${jobs.length} jobs`);

      // Show a few job titles
      if (jobs.length > 0) {
        console.log('  Examples:');
        jobs.slice(0, 3).forEach((job) => {
          console.log(`    - ${job.title} (${job.company})`);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 6: Filter by experience level
 */
async function example6_FilterByExperience() {
  console.log('\n=== Example 6: Filter by Experience Level ===');

  const aggregator = createJobAggregator();

  try {
    const levels: Array<'Junior' | 'Mid-Level' | 'Senior'> = ['Junior', 'Mid-Level', 'Senior'];

    for (const level of levels) {
      const jobs = await aggregator.getJobsByExperienceLevel(level);
      console.log(`\n${level}: ${jobs.length} jobs`);

      // Show salary range
      const withSalary = jobs.filter((j) => j.salary_min && j.salary_max);
      if (withSalary.length > 0) {
        const avgMin = withSalary.reduce((sum, j) => sum + (j.salary_min || 0), 0) / withSalary.length;
        const avgMax = withSalary.reduce((sum, j) => sum + (j.salary_max || 0), 0) / withSalary.length;
        console.log(`  Average salary: ${Math.round(avgMin)} - ${Math.round(avgMax)}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 7: Get job market statistics
 */
async function example7_MarketStatistics() {
  console.log('\n=== Example 7: Job Market Statistics ===');

  const aggregator = createJobAggregator();

  try {
    const stats = await aggregator.getJobStatistics();

    console.log(`\nTotal jobs: ${stats.totalJobs}`);

    console.log('\nBy source:');
    for (const [source, count] of Object.entries(stats.bySource)) {
      console.log(`  ${source}: ${count}`);
    }

    console.log('\nBy country:');
    for (const [country, count] of Object.entries(stats.byCountry)) {
      console.log(`  ${country}: ${count}`);
    }

    console.log('\nBy experience level:');
    for (const [level, count] of Object.entries(stats.byExperienceLevel)) {
      console.log(`  ${level}: ${count}`);
    }

    console.log('\nBy job type:');
    for (const [type, count] of Object.entries(stats.byJobType)) {
      console.log(`  ${type}: ${count}`);
    }

    console.log('\nAverage salary by country:');
    for (const [country, salary] of Object.entries(stats.averageSalaryByCountry)) {
      console.log(`  ${country}: ${Math.round(salary.min)} - ${Math.round(salary.max)}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 8: Initialize database
 */
async function example8_InitializeDatabase() {
  console.log('\n=== Example 8: Initialize Database ===');

  const initializer = createJobInitializer();

  try {
    console.log('Initializing database with jobs from all sources...');
    const result = await initializer.initializeJobDatabase();

    console.log(`\nResult: ${result.message}`);
    console.log(`  Inserted: ${result.inserted}`);
    console.log(`  Skipped: ${result.skipped}`);

    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`);
      result.errors.slice(0, 3).forEach((err) => console.log(`    - ${err}`));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Example 9: Get database statistics
 */
async function example9_DatabaseStatistics() {
  console.log('\n=== Example 9: Database Statistics ===');

  const initializer = createJobInitializer();

  try {
    const stats = await initializer.getDatabaseStats();

    console.log(`\nTotal jobs in database: ${stats.totalJobs}`);

    console.log('\nBy source:');
    for (const [source, count] of Object.entries(stats.bySource)) {
      console.log(`  ${source}: ${count}`);
    }

    console.log('\nDate range:');
    console.log(`  Oldest: ${stats.oldestJob || 'N/A'}`);
    console.log(`  Newest: ${stats.newestJob || 'N/A'}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Main function to run all examples
 */
async function runExamples() {
  console.log('========================================');
  console.log('Job Scraper System Examples');
  console.log('========================================');

  const examples = [
    { name: 'Bayt.com Scraper', fn: example1_BaytScraperOnly },
    { name: 'IrishJobs Scraper', fn: example2_IrishJobsOnly },
    { name: 'Job Aggregation', fn: example3_AggregateAllSources },
    { name: 'Filter by Country', fn: example4_FilterByCountry },
    { name: 'Filter by Skill', fn: example5_FilterBySkill },
    { name: 'Filter by Experience', fn: example6_FilterByExperience },
    { name: 'Market Statistics', fn: example7_MarketStatistics },
    { name: 'Initialize Database', fn: example8_InitializeDatabase },
    { name: 'Database Statistics', fn: example9_DatabaseStatistics },
  ];

  // Run examples - comment/uncomment as needed
  for (const example of examples) {
    try {
      await example.fn();
    } catch (error) {
      console.error(`Error in ${example.name}:`, error);
    }
  }

  console.log('\n========================================');
  console.log('Examples completed');
  console.log('========================================');
}

// Export for use as module
export { example1_BaytScraperOnly, example3_AggregateAllSources, example7_MarketStatistics };

// Run if executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}
