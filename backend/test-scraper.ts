import { createScraper } from './src/services/scraper';

async function testScraper() {
  try {
    console.log('='.repeat(80));
    console.log('Testing IrishJobs.ie Web Scraper');
    console.log('='.repeat(80));

    const scraper = createScraper();

    // Test with Ireland filter
    const filters = {
      countries: ['IE'],
      domains: [],
      minExp: 0,
      maxExp: 10,
    };

    console.log('\nStarting real web scrape from IrishJobs.ie...');
    console.log('This may take a minute as it respects rate limiting...\n');

    const jobs = await scraper.scrapeJobs(filters);

    console.log('\n' + '='.repeat(80));
    console.log(`Successfully scraped ${jobs.length} real job listings!`);
    console.log('='.repeat(80) + '\n');

    if (jobs.length > 0) {
      console.log('Sample of scraped jobs:\n');

      // Show first 3 jobs as examples
      jobs.slice(0, 3).forEach((job, index) => {
        console.log(`\nJob ${index + 1}:`);
        console.log('---');
        console.log(`Title: ${job.title}`);
        console.log(`Company: ${job.company}`);
        console.log(`Location: ${job.location}`);
        console.log(`Country: ${job.country}`);
        if (job.salary_min && job.salary_max) {
          console.log(`Salary: €${job.salary_min.toLocaleString()} - €${job.salary_max.toLocaleString()}`);
        }
        console.log(`Job Type: ${job.job_type}`);
        console.log(`Experience Level: ${job.experience_level}`);
        console.log(`Source: ${job.source}`);
        console.log(`URL: ${job.original_url}`);
        if (job.extracted_skills_required && job.extracted_skills_required.length > 0) {
          console.log(`Required Skills: ${job.extracted_skills_required.join(', ')}`);
        }
        if (job.extracted_skills_nice_to_have && job.extracted_skills_nice_to_have.length > 0) {
          console.log(`Nice-to-Have Skills: ${job.extracted_skills_nice_to_have.join(', ')}`);
        }
        console.log(`Description (first 200 chars): ${job.jd_full_text?.substring(0, 200)}...`);
      });

      console.log('\n' + '='.repeat(80));
      console.log('Test Summary:');
      console.log('---');
      console.log(`Total jobs scraped: ${jobs.length}`);
      console.log(`Average salary range: €${Math.round(
        jobs.reduce((sum, j) => sum + (j.salary_min || 0), 0) / jobs.length
      ).toLocaleString()} - €${Math.round(
        jobs.reduce((sum, j) => sum + (j.salary_max || 0), 0) / jobs.length
      ).toLocaleString()}`);

      const skillFrequency: Record<string, number> = {};
      jobs.forEach((job) => {
        job.extracted_skills_required?.forEach((skill) => {
          skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
        });
      });

      console.log('\nTop 10 Most Required Skills:');
      Object.entries(skillFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([skill, count]) => {
          console.log(`  ${skill}: ${count} jobs`);
        });

      const experienceLevels: Record<string, number> = {};
      jobs.forEach((job) => {
        const level = job.experience_level || 'Unknown';
        experienceLevels[level] = (experienceLevels[level] || 0) + 1;
      });

      console.log('\nExperience Levels Distribution:');
      Object.entries(experienceLevels).forEach(([level, count]) => {
        console.log(`  ${level}: ${count} jobs`);
      });

      console.log('='.repeat(80));
      console.log('SUCCESS: Web scraper is working with REAL data from IrishJobs.ie!');
      console.log('='.repeat(80) + '\n');
    } else {
      console.log('No jobs were scraped. This could indicate:');
      console.log('1. Network connectivity issues');
      console.log('2. Website structure changes');
      console.log('3. Rate limiting or blocking');
      console.log('\nCheck the console logs above for error details.');
    }
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

testScraper().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
