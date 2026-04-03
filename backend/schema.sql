-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience_years INT NOT NULL,
  education VARCHAR(255),
  salary_min INT,
  salary_max INT,
  target_countries TEXT[] NOT NULL DEFAULT '{}',
  availability VARCHAR(50) NOT NULL DEFAULT 'actively_looking',
  profile_updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs Table (stores full JD and extracted info)
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  salary_min INT,
  salary_max INT,
  currency VARCHAR(10) DEFAULT 'EUR',
  jd_full_text TEXT,
  original_url TEXT UNIQUE,
  source VARCHAR(50) NOT NULL,
  extracted_skills_required TEXT[],
  extracted_skills_nice_to_have TEXT[],
  experience_level VARCHAR(100),
  degree_required VARCHAR(255),
  soft_skills TEXT[],
  job_type VARCHAR(50),
  posted_date TIMESTAMP,
  cluster_id VARCHAR(100),
  match_score FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_country  ON jobs(country);
CREATE INDEX IF NOT EXISTS idx_jobs_source   ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_cluster  ON jobs(cluster_id);

-- Job Clusters Table (groups similar jobs)
CREATE TABLE IF NOT EXISTS job_clusters (
  id VARCHAR(100) PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  job_ids INT[] NOT NULL DEFAULT '{}',
  avg_match_score FLOAT,
  skill_vector JSONB,
  cv_suggestion TEXT,
  required_skills_consolidated TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Jobs (application tracking)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  job_id INT NOT NULL REFERENCES jobs(id),
  cluster_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'interested',
  cv_variant_used TEXT,
  notes TEXT,
  date_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_applied TIMESTAMP,
  interview_date TIMESTAMP,
  result_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_user_status ON saved_jobs(user_id, status);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_country_match ON jobs(country, match_score DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_cluster ON saved_jobs(cluster_id);
