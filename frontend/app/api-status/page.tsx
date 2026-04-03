'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react';
import {
  runAllApiTests,
  getApiConfig,
  ApiTestResults,
  testProfileApi,
  testJobsApi,
} from '@/lib/api-test';

export default function ApiStatusPage() {
  const [testResults, setTestResults] = useState<ApiTestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const config = getApiConfig();

  useEffect(() => {
    const runTests = async () => {
      try {
        setLoading(true);
        const results = await runAllApiTests();
        setTestResults(results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setTestResults(null);
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const results = await runAllApiTests();
      setTestResults(results);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-50 to-light-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark-900 mb-2">API Connectivity Status</h1>
          <p className="text-neutral-600 text-lg">
            Verify connection to Railway backend deployment
          </p>
        </div>

        {/* Configuration Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-dark-900 mb-4">Configuration</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="font-medium text-neutral-600">API URL</span>
              <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono text-dark-900 break-all">
                {config.apiUrl}
              </code>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <span className="font-medium text-neutral-600">Environment</span>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                config.isProduction ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {config.isProduction ? 'Production' : 'Development'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-neutral-600">Last Test</span>
              <span className="text-neutral-600 text-sm">
                {testResults?.health.timestamp ? new Date(testResults.health.timestamp).toLocaleString() : 'Not tested'}
              </span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 shadow-sm flex flex-col items-center justify-center">
            <Loader className="w-12 h-12 text-primary-600 animate-spin mb-4" />
            <p className="text-neutral-600 font-medium">Running connectivity tests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex gap-4">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-2">Test Error</h3>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
                >
                  Retry Tests
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults && !loading && (
          <div className="space-y-6">
            {/* Health Status */}
            <div className={`rounded-lg border p-6 shadow-sm ${
              testResults.health.status === 'online'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-4">
                {testResults.health.status === 'online' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${
                    testResults.health.status === 'online' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    Backend API {testResults.health.status === 'online' ? 'Online' : 'Offline'}
                  </h3>
                  {testResults.health.error && (
                    <p className={`text-sm ${
                      testResults.health.status === 'online' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {testResults.health.error}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Individual Endpoint Tests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TestCard
                title="Profile API"
                status={testResults.profileApi}
                endpoint="/profile/{userId}"
              />
              <TestCard
                title="Jobs API"
                status={testResults.jobsApi}
                endpoint="/jobs/search"
              />
              <TestCard
                title="Matching API"
                status={testResults.matchingApi}
                endpoint="/matching/analyze-jd"
              />
              <TestCard
                title="Analytics API"
                status={testResults.analyticsApi}
                endpoint="/analytics/{userId}/stats"
              />
            </div>

            {/* Overall Status */}
            <div className={`rounded-lg border p-6 shadow-sm ${
              testResults.allTestsPassed
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-4">
                {testResults.allTestsPassed ? (
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h3 className={`text-lg font-bold ${
                    testResults.allTestsPassed ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {testResults.allTestsPassed
                      ? 'All Tests Passed'
                      : 'Some Tests Failed'
                    }
                  </h3>
                  <p className={`text-sm ${
                    testResults.allTestsPassed ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {testResults.allTestsPassed
                      ? 'Frontend successfully connected to Railway backend. All APIs are accessible.'
                      : 'Some API endpoints are not responding. Check the backend deployment.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Troubleshooting */}
            {!testResults.allTestsPassed && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Troubleshooting Steps</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>1. Verify the Railway backend is running and accessible</li>
                  <li>2. Check CORS settings on the backend API</li>
                  <li>3. Ensure NEXT_PUBLIC_API_URL environment variable is set correctly</li>
                  <li>4. Check backend logs for any error messages</li>
                  <li>5. Verify network connectivity to railway.app domain</li>
                  <li>6. Check if the backend requires authentication headers</li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Run Tests Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-6 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold rounded-lg transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TestCardProps {
  title: string;
  status: boolean;
  endpoint: string;
}

function TestCard({ title, status, endpoint }: TestCardProps) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${
      status
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start gap-3">
        {status ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className={`font-semibold ${status ? 'text-green-900' : 'text-red-900'}`}>
            {title}
          </h4>
          <code className="text-xs text-neutral-600 font-mono mt-1 block">
            {endpoint}
          </code>
          <p className={`text-xs mt-2 ${status ? 'text-green-700' : 'text-red-700'}`}>
            {status ? 'Accessible' : 'Not responding'}
          </p>
        </div>
      </div>
    </div>
  );
}
