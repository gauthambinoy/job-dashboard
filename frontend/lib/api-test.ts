/**
 * API Connectivity Testing Utility
 * Used to verify the frontend can communicate with the Railway backend
 */

export interface ApiHealthResponse {
  status: 'online' | 'offline';
  apiUrl: string;
  timestamp: string;
  error?: string;
}

export interface ApiTestResults {
  health: ApiHealthResponse;
  profileApi: boolean;
  jobsApi: boolean;
  matchingApi: boolean;
  analyticsApi: boolean;
  allTestsPassed: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Test if the backend API is reachable
 */
export async function testApiHealth(): Promise<ApiHealthResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        status: 'online',
        apiUrl: API_URL,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      status: 'offline',
      apiUrl: API_URL,
      timestamp: new Date().toISOString(),
      error: `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    return {
      status: 'offline',
      apiUrl: API_URL,
      timestamp: new Date().toISOString(),
      error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Test Profile API endpoints
 */
export async function testProfileApi(): Promise<boolean> {
  try {
    // Try to fetch a sample profile
    const response = await fetch(`${API_URL}/profile/test-user-123`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    // 404 is acceptable - means the endpoint exists but user doesn't have data yet
    return response.ok || response.status === 404;
  } catch (error) {
    console.error('Profile API test failed:', error);
    return false;
  }
}

/**
 * Test Job Search API endpoints
 */
export async function testJobsApi(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/jobs/search?limit=1`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.ok || response.status === 400;
  } catch (error) {
    console.error('Jobs API test failed:', error);
    return false;
  }
}

/**
 * Test Matching API endpoints
 */
export async function testMatchingApi(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/matching/analyze-jd`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText: 'Test job description' }),
      }
    );

    return response.ok || response.status === 400;
  } catch (error) {
    console.error('Matching API test failed:', error);
    return false;
  }
}

/**
 * Test Analytics API endpoints
 */
export async function testAnalyticsApi(): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/analytics/test-user-123/stats`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.ok || response.status === 404;
  } catch (error) {
    console.error('Analytics API test failed:', error);
    return false;
  }
}

/**
 * Run all API connectivity tests
 */
export async function runAllApiTests(): Promise<ApiTestResults> {
  console.log('Starting API connectivity tests...');
  console.log(`Testing API URL: ${API_URL}`);

  const [health, profileOk, jobsOk, matchingOk, analyticsOk] = await Promise.all([
    testApiHealth(),
    testProfileApi(),
    testJobsApi(),
    testMatchingApi(),
    testAnalyticsApi(),
  ]);

  const allTestsPassed = profileOk && jobsOk && matchingOk && analyticsOk;

  const results: ApiTestResults = {
    health,
    profileApi: profileOk,
    jobsApi: jobsOk,
    matchingApi: matchingOk,
    analyticsApi: analyticsOk,
    allTestsPassed,
  };

  console.log('API Connectivity Test Results:', results);

  return results;
}

/**
 * Get current API configuration
 */
export function getApiConfig() {
  return {
    apiUrl: API_URL,
    isDevelopment: API_URL.includes('localhost'),
    isProduction: API_URL.includes('railway') || API_URL.includes('https'),
  };
}
