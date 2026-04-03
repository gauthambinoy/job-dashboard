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
  profile_updated_date?: Date;
}

export interface Job {
  id?: number;
  company: string;
  title: string;
  location: string;
  country: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  jd_full_text: string;
  original_url: string;
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor' | 'Bayt' | 'Seek' | 'IrishJobs' | 'Adzuna' | 'RemoteOK' | 'Arbeitnow' | 'Jobicy' | 'TheMuse' | 'GradIreland' | 'JobsIe';
  extracted_skills_required?: string[];
  extracted_skills_nice_to_have?: string[];
  experience_level?: string;
  degree_required?: string;
  soft_skills?: string[];
  job_type?: string;
  posted_date?: Date;
  cluster_id?: string;
  match_score?: number;
}

export interface JobCluster {
  id: string;
  domain: string;
  job_ids: number[];
  avg_match_score?: number;
  skill_vector?: Record<string, number>;
  cv_suggestion?: string;
  required_skills_consolidated?: string[];
}

export interface SavedJob {
  id?: number;
  user_id: string;
  job_id: number;
  cluster_id?: string;
  status: 'interested' | 'applied' | 'interviewing' | 'rejected' | 'offered';
  cv_variant_used?: string;
  notes?: string;
  date_saved?: Date;
  date_applied?: Date;
  interview_date?: Date;
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
