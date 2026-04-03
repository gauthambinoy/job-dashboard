const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000';
const TEST_USER = 'testuser123';
const TEST_JOB_ID = '1';
const RESULTS_FILE = 'API_TEST_RESULTS.md';

let testsPassed = 0;
let testsFailed = 0;
let resultsContent = '';

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testEndpoint(name, method, path, body, expectedStatusCode) {
  log(colors.blue, `Testing: ${name}`);

  try {
    const response = await makeRequest(method, path, body);
    const success = response.status.toString().startsWith('2');

    // Add to results
    resultsContent += `## ${name}\n\n`;
    resultsContent += `**Endpoint:** \`${method} ${path}\`\n\n`;

    if (body) {
      resultsContent += `**Request Body:**\n\`\`\`json\n${JSON.stringify(body, null, 2)}\n\`\`\`\n\n`;
    }

    resultsContent += `**HTTP Status:** ${response.status}\n\n`;
    resultsContent += `**Response:**\n\`\`\`json\n${response.body}\n\`\`\`\n\n`;

    if (success) {
      log(colors.green, `✓ PASSED (HTTP ${response.status})`);
      testsPassed++;
    } else {
      log(colors.red, `✗ FAILED (HTTP ${response.status})`);
      testsFailed++;
    }
  } catch (error) {
    log(colors.red, `✗ ERROR: ${error.message}`);
    testsFailed++;
    resultsContent += `## ${name}\n\n**ERROR:** ${error.message}\n\n`;
  }

  console.log('');
}

async function runTests() {
  log(colors.yellow, '=== Starting API Tests ===\n');

  const timestamp = new Date().toISOString();
  resultsContent = `# API Test Results\n\n${timestamp}\n\n`;

  // 1. Health Check
  await testEndpoint(
    'Health Check',
    'GET',
    '/health',
    null,
    200
  );

  // 2. Initialize Database
  await testEndpoint(
    'Initialize Database',
    'POST',
    '/api/init-db',
    {},
    200
  );

  // 3. Create User Profile
  const profileBody = {
    skills: ['Python', 'AWS'],
    experience_years: 2,
    education: 'BS CS',
    salary_min: 55000,
    salary_max: 80000,
    target_countries: ['Ireland'],
    availability: 'actively_looking',
  };

  await testEndpoint(
    'Create User Profile',
    'POST',
    `/api/profile/${TEST_USER}`,
    profileBody,
    200
  );

  // 4. Get User Profile
  await testEndpoint(
    'Get User Profile',
    'GET',
    `/api/profile/${TEST_USER}`,
    null,
    200
  );

  // 5. Search Jobs
  await testEndpoint(
    'Search Jobs',
    'GET',
    '/api/jobs/search?countries=Ireland&minSalary=50000',
    null,
    200
  );

  // 6. Get Job by ID
  await testEndpoint(
    'Get Job by ID',
    'GET',
    `/api/jobs/${TEST_JOB_ID}`,
    null,
    200
  );

  // 7. Save Job
  const saveJobBody = {
    userId: TEST_USER,
    status: 'interested',
  };

  await testEndpoint(
    'Save Job',
    'POST',
    `/api/jobs/${TEST_JOB_ID}/save`,
    saveJobBody,
    201
  );

  // 8. Get Saved Jobs
  await testEndpoint(
    'Get Saved Jobs',
    'GET',
    `/api/jobs/saved/${TEST_USER}`,
    null,
    200
  );

  // 9. Update Job Status
  const statusBody = {
    userId: TEST_USER,
    newStatus: 'applied',
    dateApplied: '2026-04-01',
  };

  await testEndpoint(
    'Update Job Status',
    'PUT',
    `/api/jobs/${TEST_JOB_ID}/status`,
    statusBody,
    200
  );

  // 10. Calculate Match Score
  await testEndpoint(
    'Calculate Match Score',
    'POST',
    `/api/matching/calculate/${TEST_USER}/${TEST_JOB_ID}`,
    null,
    200
  );

  // 11. Analytics - Stats
  await testEndpoint(
    'Get Analytics Stats',
    'GET',
    `/api/analytics/${TEST_USER}/stats`,
    null,
    200
  );

  // 12. Analytics - Match Distribution
  await testEndpoint(
    'Get Match Distribution',
    'GET',
    `/api/analytics/${TEST_USER}/match-distribution`,
    null,
    200
  );

  // 13. Analytics - Location Breakdown
  await testEndpoint(
    'Get Location Breakdown',
    'GET',
    `/api/analytics/${TEST_USER}/location-breakdown`,
    null,
    200
  );

  // 14. Analytics - Timeline
  await testEndpoint(
    'Get Application Timeline',
    'GET',
    `/api/analytics/${TEST_USER}/timeline`,
    null,
    200
  );

  // 15. Analytics - Cluster Stats
  await testEndpoint(
    'Get Cluster Stats',
    'GET',
    `/api/analytics/${TEST_USER}/cluster-stats`,
    null,
    200
  );

  // Summary
  log(colors.yellow, '=== Test Summary ===\n');
  log(colors.green, `Tests Passed: ${testsPassed}`);
  log(colors.red, `Tests Failed: ${testsFailed}`);
  console.log('');

  // Add summary to results
  resultsContent += `## Test Summary\n\n`;
  resultsContent += `**Timestamp:** ${timestamp}\n\n`;
  resultsContent += `**Tests Passed:** ${testsPassed}\n\n`;
  resultsContent += `**Tests Failed:** ${testsFailed}\n\n`;

  if (testsFailed === 0) {
    log(colors.green, 'All endpoints working ✓');
    resultsContent += '**Result:** All endpoints working ✓\n';
  } else {
    log(colors.red, 'Some tests failed');
    resultsContent += '**Result:** Some endpoints failed - see details above\n';
  }

  // Write results to file
  fs.writeFileSync(RESULTS_FILE, resultsContent);
  console.log(`\nResults saved to: ${RESULTS_FILE}`);
}

// Run tests
runTests().catch(error => {
  log(colors.red, `Fatal error: ${error.message}`);
  process.exit(1);
});
