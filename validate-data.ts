import { Pool } from 'pg';
import { IndeedScraper } from './backend/src/services/scraper';
import { calculateMatchScore, getSkillVector, cosineSimilarity } from './backend/src/utils/matchingEngine';
import { clusterJobs } from './backend/src/services/clusteringService';
import { Job, UserProfile } from './backend/src/types/index';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/job_dashboard',
});

interface ValidationReport {
  totalJobsLoaded: number;
  jobsByCountry: Record<string, number>;
  realDataValidation: {
    titlesPresent: number;
    companiesPresent: number;
    locationsMatch: number;
    salariesParsed: number;
    descriptionsFilled: number;
    skillsExtracted: number;
    experienceLevelDetected: number;
  };
  matchScoreValidation: {
    scoresCalculated: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
    scoreDistribution: Record<string, number>;
  };
  clusteringValidation: {
    clustersCreated: number;
    avgJobsPerCluster: number;
    clustersByDomain: Record<string, number>;
  };
  statistics: {
    avgMatchScore: number;
    jobsByCountryStats: Record<string, { count: number; avgMatch: number }>;
    topSkills: Array<[string, number]>;
  };
}

async function validateScraperData(): Promise<ValidationReport> {
  console.log('Starting comprehensive job data validation...\n');

  const report: ValidationReport = {
    totalJobsLoaded: 0,
    jobsByCountry: {},
    realDataValidation: {
      titlesPresent: 0,
      companiesPresent: 0,
      locationsMatch: 0,
      salariesParsed: 0,
      descriptionsFilled: 0,
      skillsExtracted: 0,
      experienceLevelDetected: 0,
    },
    matchScoreValidation: {
      scoresCalculated: 0,
      avgScore: 0,
      minScore: 999,
      maxScore: 0,
      scoreDistribution: {
        '0-20': 0,
        '20-40': 0,
        '40-60': 0,
        '60-80': 0,
        '80-100': 0,
      },
    },
    clusteringValidation: {
      clustersCreated: 0,
      avgJobsPerCluster: 0,
      clustersByDomain: {},
    },
    statistics: {
      avgMatchScore: 0,
      jobsByCountryStats: {},
      topSkills: [],
    },
  };

  try {
    // 1. Generate and validate scraped jobs
    console.log('STEP 1: Loading jobs from scrapers...');
    const scraper = new IndeedScraper();
    const jobs = await scraper.scrapeJobs({
      countries: ['IE', 'AE', 'AU'],
      domains: [],
      minExp: 2,
      maxExp: 5,
    });

    report.totalJobsLoaded = jobs.length;
    console.log(`Loaded ${jobs.length} jobs from scraper`);

    // 2. Validate each job for real data
    console.log('\nSTEP 2: Validating individual job data...');
    let totalTitleLength = 0;
    let totalDescLength = 0;
    const skillsFrequency: Record<string, number> = {};

    for (const job of jobs) {
      // Check country mapping
      if (!report.jobsByCountry[job.country]) {
        report.jobsByCountry[job.country] = 0;
      }
      report.jobsByCountry[job.country]++;

      // Validate required fields
      if (job.title && job.title.trim().length > 0) {
        report.realDataValidation.titlesPresent++;
        totalTitleLength += job.title.length;
      }

      if (job.company && job.company.trim().length > 0) {
        report.realDataValidation.companiesPresent++;
      }

      if (job.location && job.location.trim().length > 0) {
        report.realDataValidation.locationsMatch++;
      }

      // Validate salary parsing
      if ((job.salary_min || job.salary_max) && job.salary_min! > 0 && job.salary_max! > 0) {
        report.realDataValidation.salariesParsed++;
      }

      // Validate job description (check it's not just a template)
      if (job.jd_full_text && job.jd_full_text.length > 100) {
        report.realDataValidation.descriptionsFilled++;
        totalDescLength += job.jd_full_text.length;
      }

      // Validate skills extraction
      if (job.extracted_skills_required && job.extracted_skills_required.length > 0) {
        report.realDataValidation.skillsExtracted++;
        job.extracted_skills_required.forEach((skill) => {
          skillsFrequency[skill] = (skillsFrequency[skill] || 0) + 1;
        });
      }

      // Validate experience level
      if (job.experience_level && job.experience_level.trim().length > 0) {
        report.realDataValidation.experienceLevelDetected++;
      }
    }

    // 3. Calculate match scores
    console.log('\nSTEP 3: Calculating match scores...');
    const testProfile: UserProfile = {
      id: 1,
      user_id: 'test_user',
      skills: ['Python', 'AWS', 'Docker', 'PostgreSQL'],
      experience_years: 3,
      education: 'BS CS',
      salary_min: 60000,
      salary_max: 100000,
      target_countries: ['IE', 'AE', 'AU'],
      availability: 'actively_looking',
      profile_updated_date: new Date(),
    };

    const matchScores: number[] = [];

    for (const job of jobs) {
      const match = calculateMatchScore(testProfile, job);
      matchScores.push(match.totalScore);

      // Update distribution
      if (match.totalScore <= 20) report.matchScoreValidation.scoreDistribution['0-20']++;
      else if (match.totalScore <= 40) report.matchScoreValidation.scoreDistribution['20-40']++;
      else if (match.totalScore <= 60) report.matchScoreValidation.scoreDistribution['40-60']++;
      else if (match.totalScore <= 80) report.matchScoreValidation.scoreDistribution['60-80']++;
      else report.matchScoreValidation.scoreDistribution['80-100']++;

      report.matchScoreValidation.minScore = Math.min(report.matchScoreValidation.minScore, match.totalScore);
      report.matchScoreValidation.maxScore = Math.max(report.matchScoreValidation.maxScore, match.totalScore);
    }

    report.matchScoreValidation.scoresCalculated = matchScores.length;
    report.matchScoreValidation.avgScore = matchScores.reduce((a, b) => a + b, 0) / matchScores.length;

    // 4. Test clustering algorithm
    console.log('\nSTEP 4: Testing clustering algorithm...');
    const jobsWithSkills = jobs.map((j, idx) => ({ ...j, id: idx + 1 }));
    const clusters = await clusterJobs(jobsWithSkills);

    report.clusteringValidation.clustersCreated = clusters.size;
    let totalJobsInClusters = 0;

    for (const [clusterId, cluster] of clusters) {
      if (!report.clusteringValidation.clustersByDomain[cluster.domain]) {
        report.clusteringValidation.clustersByDomain[cluster.domain] = 0;
      }
      report.clusteringValidation.clustersByDomain[cluster.domain]++;
      totalJobsInClusters += cluster.job_ids.length;
    }

    report.clusteringValidation.avgJobsPerCluster = totalJobsInClusters / clusters.size;

    // 5. Verify clustering similarity
    console.log('\nSTEP 5: Verifying cluster similarity...');
    let similaritySamples = 0;
    let validSimilarities = 0;

    for (const [_, cluster] of clusters) {
      if (cluster.job_ids.length > 1) {
        // Sample first two jobs in cluster
        const job1 = jobsWithSkills.find((j) => j.id === cluster.job_ids[0]);
        const job2 = jobsWithSkills.find((j) => j.id === cluster.job_ids[1]);

        if (job1 && job2) {
          const v1 = getSkillVector(job1.extracted_skills_required || []);
          const v2 = getSkillVector(job2.extracted_skills_required || []);
          const similarity = cosineSimilarity(v1, v2);

          if (similarity >= 0.85) {
            validSimilarities++;
          }
          similaritySamples++;
        }
      }
    }

    // 6. Generate statistics
    console.log('\nSTEP 6: Generating statistics...');
    report.statistics.avgMatchScore = report.matchScoreValidation.avgScore;

    // Calculate stats by country
    for (const country of Object.keys(report.jobsByCountry)) {
      const countryJobs = jobs.filter((j) => j.country === country);
      const countryMatches = matchScores.slice(
        jobs.indexOf(countryJobs[0]),
        jobs.indexOf(countryJobs[countryJobs.length - 1]) + 1
      );
      const avgMatch = countryMatches.reduce((a, b) => a + b, 0) / countryMatches.length;

      report.statistics.jobsByCountryStats[country] = {
        count: report.jobsByCountry[country],
        avgMatch: Math.round(avgMatch * 100) / 100,
      };
    }

    // Top skills
    const topSkillsArray = Object.entries(skillsFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    report.statistics.topSkills = topSkillsArray;

    // 7. Print validation summary
    console.log('\n' + '='.repeat(80));
    console.log('DATA VALIDATION REPORT');
    console.log('='.repeat(80));

    console.log('\n1. SCRAPER DATA VALIDATION:');
    console.log(`   Total jobs loaded: ${report.totalJobsLoaded}`);
    console.log(`   Jobs by country: ${JSON.stringify(report.jobsByCountry)}`);
    console.log(`   - Ireland (IE): ${report.jobsByCountry['IE'] || 0} jobs`);
    console.log(`   - UAE (AE): ${report.jobsByCountry['AE'] || 0} jobs`);
    console.log(`   - Australia (AU): ${report.jobsByCountry['AU'] || 0} jobs`);

    console.log('\n2. REAL DATA PRESENCE VALIDATION:');
    console.log(`   Titles present: ${report.realDataValidation.titlesPresent}/${jobs.length} (${((report.realDataValidation.titlesPresent / jobs.length) * 100).toFixed(1)}%)`);
    console.log(`   Companies present: ${report.realDataValidation.companiesPresent}/${jobs.length} (${((report.realDataValidation.companiesPresent / jobs.length) * 100).toFixed(1)}%)`);
    console.log(`   Locations match country: ${report.realDataValidation.locationsMatch}/${jobs.length} (${((report.realDataValidation.locationsMatch / jobs.length) * 100).toFixed(1)}%)`);
    console.log(`   Salaries parsed: ${report.realDataValidation.salariesParsed}/${jobs.length} (${((report.realDataValidation.salariesParsed / jobs.length) * 100).toFixed(1)}%)`);
    console.log(`   Descriptions filled: ${report.realDataValidation.descriptionsFilled}/${jobs.length} (${((report.realDataValidation.descriptionsFilled / jobs.length) * 100).toFixed(1)}%)`);
    console.log(`   Skills extracted: ${report.realDataValidation.skillsExtracted}/${jobs.length} (${((report.realDataValidation.skillsExtracted / jobs.length) * 100).toFixed(1)}%)`);
    console.log(`   Experience levels: ${report.realDataValidation.experienceLevelDetected}/${jobs.length} (${((report.realDataValidation.experienceLevelDetected / jobs.length) * 100).toFixed(1)}%)`);

    console.log('\n3. MATCH SCORE CALCULATION:');
    console.log(`   Total scores calculated: ${report.matchScoreValidation.scoresCalculated}`);
    console.log(`   Average match score: ${report.matchScoreValidation.avgScore.toFixed(2)}%`);
    console.log(`   Min score: ${report.matchScoreValidation.minScore.toFixed(2)}%`);
    console.log(`   Max score: ${report.matchScoreValidation.maxScore.toFixed(2)}%`);
    console.log(`   Score distribution:`);
    for (const [range, count] of Object.entries(report.matchScoreValidation.scoreDistribution)) {
      const percentage = ((count / jobs.length) * 100).toFixed(1);
      console.log(`     ${range}%: ${count} jobs (${percentage}%)`);
    }

    console.log('\n4. CLUSTERING VALIDATION:');
    console.log(`   Clusters created: ${report.clusteringValidation.clustersCreated}`);
    console.log(`   Average jobs per cluster: ${report.clusteringValidation.avgJobsPerCluster.toFixed(2)}`);
    console.log(`   Clusters by domain:`);
    for (const [domain, count] of Object.entries(report.clusteringValidation.clustersByDomain)) {
      console.log(`     ${domain}: ${count} clusters`);
    }
    if (similaritySamples > 0) {
      console.log(`   Verified cluster similarities: ${validSimilarities}/${similaritySamples} (${((validSimilarities / similaritySamples) * 100).toFixed(1)}%)`);
    }

    console.log('\n5. STATISTICS:');
    console.log(`   Average match score: ${report.statistics.avgMatchScore.toFixed(2)}%`);
    console.log(`   By country statistics:`);
    for (const [country, stats] of Object.entries(report.statistics.jobsByCountryStats)) {
      console.log(`     ${country}: ${stats.count} jobs, avg match: ${stats.avgMatch}%`);
    }

    console.log('\n6. TOP 10 MOST COMMON SKILLS:');
    for (let i = 0; i < report.statistics.topSkills.length; i++) {
      const [skill, count] = report.statistics.topSkills[i];
      console.log(`   ${i + 1}. ${skill}: ${count} jobs`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('VALIDATION COMPLETE');
    console.log('='.repeat(80));

    return report;
  } catch (error) {
    console.error('Validation error:', error);
    throw error;
  }
}

// Run validation
validateScraperData()
  .then((report) => {
    console.log('\nReport generated successfully');
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
