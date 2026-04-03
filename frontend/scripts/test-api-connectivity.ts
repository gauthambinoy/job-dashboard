/**
 * API Connectivity Test Script
 * Run with: npx ts-node scripts/test-api-connectivity.ts
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<void> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    const success = response.ok || response.status === 404 || response.status === 400;

    results.push({
      name,
      endpoint,
      method,
      success,
      statusCode: response.status,
      duration,
    });

    console.log(
      `${success ? 'PASS' : 'FAIL'} - ${name} (${response.status}) [${duration}ms]`
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    results.push({
      name,
      endpoint,
      method,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    });

    console.log(
      `FAIL - ${name} (${error instanceof Error ? error.message : 'Unknown error'}) [${duration}ms]`
    );
  }
}

async function runTests(): Promise<void> {
  console.log('='.repeat(60));
  console.log('API Connectivity Test Suite');
  console.log('='.repeat(60));
  console.log(`API URL: ${API_URL}\n`);

  // Health Check
  await testEndpoint('Health Check', '/health', 'GET');

  // Profile APIs
  await testEndpoint('Get Profile', '/profile/test-user', 'GET');
  await testEndpoint(
    'Save Profile',
    '/profile/test-user',
    'POST',
    {
      skills: ['React', 'Node.js'],
      experienceYears: '5',
      education: 'bachelor',
      salaryMin: '50000',
      salaryMax: '120000',
      targetCountries: ['Ireland'],
      availability: 'Actively Looking',
    }
  );

  // Job APIs
  await testEndpoint('Search Jobs', '/jobs/search?limit=10', 'GET');
  await testEndpoint('Get Job', '/jobs/1', 'GET');

  // Matching APIs
  await testEndpoint(
    'Analyze JD',
    '/matching/analyze-jd',
    'POST',
    {
      jdText: 'We are looking for a Senior Backend Engineer with 5+ years of experience in Node.js and PostgreSQL.',
    }
  );
  await testEndpoint(
    'Calculate Match',
    '/matching/calculate/test-user/1',
    'POST'
  );

  // Analytics APIs
  await testEndpoint('Get Analytics Stats', '/analytics/test-user/stats', 'GET');
  await testEndpoint('Get Match Distribution', '/analytics/test-user/match-distribution', 'GET');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.error || `HTTP ${r.statusCode}`}`);
      });
  }

  console.log(`\nAverage Response Time: ${(results.reduce((sum, r) => sum + (r.duration || 0), 0) / results.length).toFixed(0)}ms`);

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
