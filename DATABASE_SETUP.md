# LazyScaper - PostgreSQL Database Setup Guide

This guide provides step-by-step instructions to set up PostgreSQL for the LazyScaper application.

## Prerequisites

The LazyScaper backend requires:
- PostgreSQL 12 or higher
- Node.js (for running the backend)
- A local or remote PostgreSQL instance

---

## Option 1: Local PostgreSQL Installation (Linux)

### For Ubuntu/Debian:

```bash
# Update package manager
sudo apt-get update

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### For Fedora/RHEL/CentOS:

```bash
# Install PostgreSQL
sudo dnf install -y postgresql postgresql-server postgresql-contrib

# Initialize database cluster
sudo postgresql-setup initdb

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### For macOS (using Homebrew):

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

---

## Option 2: Docker Setup (Recommended for Development)

If you don't want to install PostgreSQL locally, use Docker:

```bash
# Pull and run PostgreSQL container
docker run --name lazyscaper-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=job_dashboard \
  -p 5432:5432 \
  -d postgres:15

# Verify container is running
docker ps | grep lazyscaper-db

# Check logs
docker logs lazyscaper-db
```

To stop the container later:
```bash
docker stop lazyscaper-db
```

To remove the container (WARNING: deletes data):
```bash
docker rm lazyscaper-db
```

---

## Database Setup Steps

### 1. Create Database and Load Schema (Local PostgreSQL)

```bash
# Switch to postgres user
sudo -u postgres psql

# Inside psql, run:
CREATE DATABASE job_dashboard;
\c job_dashboard
\i /home/gautham/lazyscaper/backend/schema.sql

# Verify tables were created
\dt

# Exit psql
\q
```

### 2. Create Database and Load Schema (Docker)

```bash
# Copy schema into container
docker cp /home/gautham/lazyscaper/backend/schema.sql lazyscaper-db:/tmp/schema.sql

# Connect to container and create database
docker exec -it lazyscaper-db psql -U postgres -c "CREATE DATABASE job_dashboard;"

# Load schema
docker exec -it lazyscaper-db psql -U postgres -d job_dashboard -f /tmp/schema.sql

# Verify tables
docker exec -it lazyscaper-db psql -U postgres -d job_dashboard -c "\dt"
```

### 3. Configure Backend Environment

Navigate to the backend directory and create `.env`:

```bash
cd /home/gautham/lazyscaper/backend
```

Create `.env` file with:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_dashboard
API_PORT=5000
NODE_ENV=development
INDEED_API_KEY=your_indeed_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
```

**Note**: If you used different PostgreSQL credentials, update the `DATABASE_URL` accordingly.

---

## Verify Database Connection

### Test 1: Check Tables Exist

```bash
# From backend directory
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\dt"
```

Expected output (4 tables):
```
               List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | job_clusters    | table | postgres
 public | jobs            | table | postgres
 public | saved_jobs      | table | postgres
 public | user_profiles   | table | postgres
```

### Test 2: Check Indexes

```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\di"
```

Expected indexes:
- idx_country
- idx_source
- idx_cluster
- idx_jobs_title
- idx_jobs_country_match
- idx_saved_jobs_user
- idx_saved_jobs_cluster
- idx_user_status

### Test 3: Verify Tables are Empty

```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard << EOF
SELECT COUNT(*) as user_profiles_count FROM user_profiles;
SELECT COUNT(*) as jobs_count FROM jobs;
SELECT COUNT(*) as job_clusters_count FROM job_clusters;
SELECT COUNT(*) as saved_jobs_count FROM saved_jobs;
EOF
```

All counts should return `0` (zero rows).

### Test 4: Test Backend Connection

From the backend directory:

```bash
cd /home/gautham/lazyscaper/backend
npm install
npm run build
npm run dev
```

Check the logs for successful database connection messages.

---

## Database Schema Summary

### Tables Created:

1. **user_profiles**
   - Stores user profile information
   - Fields: user_id, skills, experience_years, education, salary range, target_countries, availability

2. **jobs**
   - Stores job postings
   - Fields: company, title, location, country, salary, job description, source, required/nice-to-have skills, experience level, etc.
   - Indexes: country, source, cluster_id, title, country+match_score

3. **job_clusters**
   - Groups similar jobs together
   - Fields: domain, job_ids, average match score, skill vector, consolidated required skills

4. **saved_jobs**
   - Application tracking (job saving and application status)
   - Fields: user_id, job_id, cluster_id, status, CV variant used, dates, interview notes

---

## AWS RDS Alternative

If you prefer to use a cloud-hosted PostgreSQL database instead of local installation:

### 1. Create AWS RDS Instance

1. Log in to AWS Console
2. Navigate to RDS → Create Database
3. Choose:
   - Engine: PostgreSQL
   - Version: 15.x
   - DB Instance Class: db.t3.micro (for development/testing)
   - Master username: postgres
   - Master password: [your-secure-password]
   - Database name: job_dashboard

### 2. Configure Security Groups

Allow inbound traffic on port 5432:
- Protocol: TCP
- Port: 5432
- Source: Your IP address (or 0.0.0.0/0 for development only)

### 3. Load Schema to RDS

```bash
psql -h your-rds-endpoint.amazonaws.com \
     -U postgres \
     -d job_dashboard \
     -f /home/gautham/lazyscaper/backend/schema.sql
```

### 4. Update Backend .env

```
DATABASE_URL=postgresql://postgres:your-password@your-rds-endpoint.amazonaws.com:5432/job_dashboard
API_PORT=5000
NODE_ENV=production
INDEED_API_KEY=your_indeed_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
```

---

## Troubleshooting

### Issue: "psql: command not found"

**Solution**: PostgreSQL is not installed. Follow the installation steps for your operating system above.

### Issue: "FATAL: Ident authentication failed"

**Solution**: 
```bash
# Use postgres user
sudo -u postgres psql

# Or configure password authentication in pg_hba.conf
sudo nano /etc/postgresql/[VERSION]/main/pg_hba.conf
# Change 'ident' to 'md5' or 'password' for local connections
```

### Issue: "Connection refused" when trying to connect

**Solution**:
```bash
# Check if PostgreSQL service is running
sudo systemctl status postgresql

# Start the service
sudo systemctl start postgresql

# Or check Docker container
docker ps | grep lazyscaper-db
docker logs lazyscaper-db
```

### Issue: "Database already exists"

**Solution**:
```bash
# Drop existing database
psql -U postgres -c "DROP DATABASE IF EXISTS job_dashboard;"

# Then recreate
psql -U postgres -c "CREATE DATABASE job_dashboard;"
```

### Issue: "ERROR: syntax error in schema.sql"

**Solution**:
- Verify the schema.sql file exists at `/home/gautham/lazyscaper/backend/schema.sql`
- Check file is not corrupted: `file /home/gautham/lazyscaper/backend/schema.sql`
- Try loading with verbose mode: `psql -d job_dashboard -f schema.sql -v`

---

## Database Maintenance

### Backup Database

```bash
# Local PostgreSQL
pg_dump -U postgres job_dashboard > backup_$(date +%Y%m%d).sql

# From Docker
docker exec lazyscaper-db pg_dump -U postgres job_dashboard > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
# Local PostgreSQL
psql -U postgres job_dashboard < backup_20240401.sql

# From Docker
docker exec -i lazyscaper-db psql -U postgres job_dashboard < backup_20240401.sql
```

### Reset Database (Development Only)

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE job_dashboard;" -c "CREATE DATABASE job_dashboard;"

# Reload schema
psql -U postgres -d job_dashboard -f /home/gautham/lazyscaper/backend/schema.sql
```

---

## Next Steps

1. ✅ Install PostgreSQL (local or Docker)
2. ✅ Create `job_dashboard` database
3. ✅ Load schema from `backend/schema.sql`
4. ✅ Create `.env` file in `backend/` directory
5. ✅ Run backend: `npm run dev`
6. ✅ Start using the LazyScaper API!

---

## Support

For issues or questions:
- Check PostgreSQL logs: `/var/log/postgresql/` (local) or `docker logs lazyscaper-db` (Docker)
- Backend logs: Output from `npm run dev`
- Review database configuration at `/home/gautham/lazyscaper/backend/src/config/database.ts`
