# Database Setup Verification Checklist

Use this checklist to verify your PostgreSQL setup is complete and working correctly.

## Pre-Setup Verification

- [ ] PostgreSQL installed (`psql --version` returns a version)
- [ ] PostgreSQL service running (`sudo systemctl status postgresql` or `docker ps`)
- [ ] Schema file exists at `/home/gautham/lazyscaper/backend/schema.sql` (80 lines)
- [ ] Backend `.env` file created at `/home/gautham/lazyscaper/backend/.env`

## Database Creation

- [ ] Database `job_dashboard` created
- [ ] Database is accessible with connection string: `postgresql://postgres:password@localhost:5432/job_dashboard`

## Schema Verification

### Tables Created (4 required)

Run:
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\dt"
```

Verify output shows these 4 tables:
- [ ] `public | user_profiles    | table | postgres`
- [ ] `public | jobs             | table | postgres`
- [ ] `public | job_clusters     | table | postgres`
- [ ] `public | saved_jobs       | table | postgres`

### Table Structures

Check each table structure:

**user_profiles table:**
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\d user_profiles"
```
Expected columns:
- [ ] id (SERIAL PRIMARY KEY)
- [ ] user_id (VARCHAR UNIQUE)
- [ ] skills (TEXT ARRAY)
- [ ] experience_years (INT)
- [ ] education (VARCHAR)
- [ ] salary_min (INT)
- [ ] salary_max (INT)
- [ ] target_countries (TEXT ARRAY)
- [ ] availability (VARCHAR)
- [ ] profile_updated_date (TIMESTAMP)
- [ ] created_at (TIMESTAMP)

**jobs table:**
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\d jobs"
```
Expected columns:
- [ ] id (SERIAL PRIMARY KEY)
- [ ] company (VARCHAR)
- [ ] title (VARCHAR)
- [ ] location (VARCHAR)
- [ ] country (VARCHAR)
- [ ] salary_min (INT)
- [ ] salary_max (INT)
- [ ] currency (VARCHAR DEFAULT 'EUR')
- [ ] jd_full_text (TEXT)
- [ ] original_url (TEXT UNIQUE)
- [ ] source (VARCHAR)
- [ ] extracted_skills_required (TEXT ARRAY)
- [ ] extracted_skills_nice_to_have (TEXT ARRAY)
- [ ] experience_level (VARCHAR)
- [ ] degree_required (VARCHAR)
- [ ] soft_skills (TEXT ARRAY)
- [ ] job_type (VARCHAR)
- [ ] posted_date (TIMESTAMP)
- [ ] cluster_id (VARCHAR)
- [ ] match_score (FLOAT)
- [ ] created_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- [ ] updated_at (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**job_clusters table:**
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\d job_clusters"
```
Expected columns:
- [ ] id (VARCHAR PRIMARY KEY)
- [ ] domain (VARCHAR)
- [ ] job_ids (INT ARRAY)
- [ ] avg_match_score (FLOAT)
- [ ] skill_vector (JSONB)
- [ ] cv_suggestion (TEXT)
- [ ] required_skills_consolidated (TEXT ARRAY)
- [ ] created_at (TIMESTAMP)

**saved_jobs table:**
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\d saved_jobs"
```
Expected columns:
- [ ] id (SERIAL PRIMARY KEY)
- [ ] user_id (VARCHAR)
- [ ] job_id (INT with FOREIGN KEY to jobs.id)
- [ ] cluster_id (VARCHAR)
- [ ] status (VARCHAR DEFAULT 'interested')
- [ ] cv_variant_used (TEXT)
- [ ] notes (TEXT)
- [ ] date_saved (TIMESTAMP)
- [ ] date_applied (TIMESTAMP)
- [ ] interview_date (TIMESTAMP)
- [ ] result_notes (TEXT)
- [ ] created_at (TIMESTAMP)
- [ ] updated_at (TIMESTAMP)

### Indexes Verification

Run:
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\di"
```

Verify these 8+ indexes exist:
- [ ] idx_jobs_title (ON jobs(title))
- [ ] idx_jobs_country_match (ON jobs(country, match_score DESC))
- [ ] idx_saved_jobs_user (ON saved_jobs(user_id))
- [ ] idx_saved_jobs_cluster (ON saved_jobs(cluster_id))
- [ ] idx_country (mentioned in schema)
- [ ] idx_source (mentioned in schema)
- [ ] idx_cluster (mentioned in schema)
- [ ] idx_user_status (mentioned in schema)

## Data Verification

### Test Empty Tables

Run:
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard << EOF
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
SELECT COUNT(*) as jobs_count FROM jobs;
SELECT COUNT(*) as job_clusters_count FROM job_clusters;
SELECT COUNT(*) as saved_jobs_count FROM saved_jobs;
EOF
```

Verify all return:
- [ ] user_profiles_count: 0
- [ ] jobs_count: 0
- [ ] job_clusters_count: 0
- [ ] saved_jobs_count: 0

### Test Foreign Keys

Run:
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\d saved_jobs"
```

Verify constraint shown:
- [ ] FOREIGN KEY (user_id) REFERENCES user_profiles(user_id)
- [ ] FOREIGN KEY (job_id) REFERENCES jobs(id)

## Environment Configuration

- [ ] Backend `.env` file exists at `/home/gautham/lazyscaper/backend/.env`
- [ ] `.env` contains `DATABASE_URL=postgresql://postgres:password@localhost:5432/job_dashboard`
- [ ] `.env` contains `API_PORT=5000`
- [ ] `.env` contains `NODE_ENV=development`
- [ ] `.env` API key placeholders are present

## Backend Connection Test

Run from backend directory:

```bash
cd /home/gautham/lazyscaper/backend
npm install
npm run build
npm run dev
```

Verify in logs:
- [ ] No "Database connection refused" errors
- [ ] No "ECONNREFUSED" errors
- [ ] No "Authentication failed" errors
- [ ] Server starts successfully on port 5000
- [ ] No pooling errors

## Final Connectivity Test

```bash
# Test direct connection
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "SELECT 1;"
```

Expected output:
- [ ] `(1 row)` returned
- [ ] No authentication errors

## Docker-Specific Checks (if using Docker)

```bash
# Container should be running
docker ps | grep lazyscaper-db
```

- [ ] Container `lazyscaper-db` is running
- [ ] Port 5432 is mapped to host

```bash
# Check container logs
docker logs lazyscaper-db
```

- [ ] No critical errors in logs
- [ ] Database is ready for connections

## Post-Verification

All checks passed? Great! You're ready to:

1. **Start the backend:**
   ```bash
   cd /home/gautham/lazyscaper/backend
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Insert test data** (optional):
   ```bash
   psql postgresql://postgres:password@localhost:5432/job_dashboard << EOF
   INSERT INTO user_profiles (user_id, skills, experience_years, target_countries)
   VALUES ('test_user_1', ARRAY['JavaScript', 'PostgreSQL'], 5, ARRAY['Germany', 'Sweden']);
   
   SELECT * FROM user_profiles;
   EOF
   ```

## Troubleshooting Checklist

If any checks failed:

- [ ] Verify PostgreSQL is running: `sudo systemctl status postgresql` or `docker ps`
- [ ] Check connection string in `.env` matches your setup
- [ ] Review detailed setup guide: `DATABASE_SETUP.md`
- [ ] Check PostgreSQL logs: `/var/log/postgresql/` or `docker logs lazyscaper-db`
- [ ] Verify schema file wasn't corrupted: `file /home/gautham/lazyscaper/backend/schema.sql`
- [ ] Try resetting database: `sudo -u postgres psql -c "DROP DATABASE job_dashboard;"`
- [ ] Re-run setup script

## Success Indicators

Your setup is complete when:

✅ All 4 tables exist
✅ All 8+ indexes exist
✅ All tables return 0 rows (empty)
✅ All columns match expected types
✅ Foreign key constraints are in place
✅ `.env` file is configured
✅ Backend connects without errors
✅ Direct database queries work

**Date Verified:** _______________
**By:** _______________
**Notes:** _______________________________________________
