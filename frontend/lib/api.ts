import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Profile APIs
export const getProfile = (userId: string) => api.get(`/profile/${userId}`);
export const saveProfile = (userId: string, profile: any) =>
  api.post(`/profile/${userId}`, profile);

// Job APIs
export const searchJobs = (filters: any) => api.get('/jobs/search', { params: filters });
export const getJob = (jobId: number) => api.get(`/jobs/${jobId}`);
export const getClusterJobs = (clusterId: string) => api.get(`/jobs/cluster/${clusterId}`);

// Matching APIs
export const calculateMatch = (userId: string, jobId: number) =>
  api.post(`/matching/calculate/${userId}/${jobId}`);
export const analyzeJD = (jdText: string) =>
  api.post('/matching/analyze-jd', { jdText });
export const batchCalculateMatches = (userId: string, filters: any) =>
  api.post(`/matching/batch/${userId}`, filters);

// Saved Jobs APIs
export const saveJob = (jobId: number, data: any) =>
  api.post(`/jobs/${jobId}/save`, data);
export const updateJobStatus = (jobId: number, status: string) =>
  api.put(`/jobs/${jobId}/status`, { status });
export const getSavedJobs = (userId: string) =>
  api.get(`/jobs/saved/${userId}`);
export const deleteJob = (jobId: number) =>
  api.delete(`/jobs/${jobId}`);

// Analytics APIs
export const getAnalyticsStats = (userId: string) =>
  api.get(`/analytics/${userId}/stats`);
export const getMatchDistribution = (userId: string) =>
  api.get(`/analytics/${userId}/match-distribution`);
export const getClusterStats = (userId: string) =>
  api.get(`/analytics/${userId}/cluster-stats`);
export const getLocationBreakdown = (userId: string) =>
  api.get(`/analytics/${userId}/location-breakdown`);

export default api;
