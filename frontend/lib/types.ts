export interface UserProfile {
  id?: number;
  user_id: string;
  skills: string[];
  experience_years: number;
  education?: string;
  salary_min?: number;
  salary_max?: number;
  target_countries: string[];
  availability: 'actively_looking' | 'passive' | 'relocate';
}

export interface Job {
  id: number;
  company: string;
  title: string;
  location: string;
  country: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  jd_full_text: string;
  original_url: string;
  source: string;
  extracted_skills_required?: string[];
  extracted_skills_nice_to_have?: string[];
  experience_level?: string;
  degree_required?: string;
  soft_skills?: string[];
  job_type?: string;
  posted_date?: string;
  cluster_id?: string;
  match_score?: number;
}

export interface SavedJob {
  id?: number;
  user_id: string;
  job_id: number;
  cluster_id?: string;
  status: 'interested' | 'applied' | 'interviewing' | 'rejected' | 'offered';
  cv_variant_used?: string;
  notes?: string;
  date_saved?: string;
  date_applied?: string;
  interview_date?: string;
  result_notes?: string;
}

export interface MatchResult {
  skillsMatch: number;
  experienceMatch: number;
  salaryMatch: number;
  locationMatch: number;
  educationMatch: number;
  totalScore: number;
}

export interface JobCluster {
  id: string;
  domain: string;
  job_ids: number[];
  avg_match_score?: number;
  required_skills_consolidated?: string[];
  cv_suggestion?: string;
}

export interface SearchFilters {
  domain?: string[];
  countries?: string[];
  minExp?: number;
  maxExp?: number;
  minSalary?: number;
  maxSalary?: number;
  availability?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsData {
  totalSaved: number;
  applied: number;
  pendingResponse: number;
  interviewing: number;
  rejected: number;
  offered: number;
  matchDistribution: Record<string, number>;
  locationBreakdown: Record<string, number>;
  clusterStats: JobCluster[];
}
