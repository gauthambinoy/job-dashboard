# Database Setup Documentation Index

Quick navigation guide for all database setup resources.

## Getting Started (Choose One)

### If you want the fastest setup: ⚡
**→ [QUICK_START_DB.md](QUICK_START_DB.md)** (3 min read)
- Copy-paste commands
- Choose between Docker or Local PostgreSQL
- Quick verification steps

### If you want detailed step-by-step instructions: 📖
**→ [DATABASE_SETUP.md](DATABASE_SETUP.md)** (10 min read)
- Complete installation guide for all operating systems
- Detailed explanation of each step
- Troubleshooting guide
- Database maintenance

### If you prefer a visual overview: 📊
**→ [DB_SETUP_SUMMARY.txt](DB_SETUP_SUMMARY.txt)**
- Executive summary of all options
- System analysis
- Default settings reference

---

## Setup Automation Scripts

### Docker Setup (Recommended for Development)
```bash
cd /home/gautham/lazyscaper
chmod +x setup-db-docker.sh
./setup-db-docker.sh
```
**File:** [setup-db-docker.sh](setup-db-docker.sh)  
**Time:** 30-60 seconds  
**Requirements:** Docker installed

### Local PostgreSQL Setup (Recommended for Production)
```bash
cd /home/gautham/lazyscaper
chmod +x setup-db-local.sh
./setup-db-local.sh
```
**File:** [setup-db-local.sh](setup-db-local.sh)  
**Time:** 5 minutes (installation) + 30 seconds (setup)  
**Requirements:** PostgreSQL installed

---

## Verification & Troubleshooting

### Complete Verification Checklist
**→ [SETUP_VERIFICATION_CHECKLIST.md](SETUP_VERIFICATION_CHECKLIST.md)**
- 50+ verification points
- Table structure checks
- Column-by-column verification
- Backend connectivity tests
- Docker-specific checks

### Status Report
**→ [SETUP_COMPLETE.txt](SETUP_COMPLETE.txt)**
- Summary of what was done
- Files created
- Success criteria checklist
- Next steps

---

## Technical Reference

### Configuration Files
- **[backend/.env](backend/.env)** - Database connection string and API configuration
- **[backend/.env.example](backend/.env.example)** - Template reference
- **[backend/schema.sql](backend/schema.sql)** - SQL schema (80 lines, 4 tables, 8+ indexes)

### Backend Source Code
- **[backend/src/config/database.ts](backend/src/config/database.ts)** - Database connection logic

---

## Setup Options Summary

| Option | Speed | Complexity | Best For | Requirements |
|--------|-------|-----------|----------|--------------|
| **Docker** | 1-2 min | Low | Development | Docker |
| **Local PostgreSQL** | 5-10 min | Medium | Production | PostgreSQL |
| **AWS RDS** | 10-20 min | Medium | Cloud | AWS Account |

---

## Database Schema Overview

### Tables (4 total)

1. **user_profiles**
   - User profile information
   - Skills, experience, salary expectations
   - Target countries and availability status

2. **jobs**
   - Job postings
   - Full job description and extracted data
   - Salary, skills, experience level, requirements
   - Source tracking

3. **job_clusters**
   - Groups similar jobs by domain
   - Consolidated skills
   - Match scores

4. **saved_jobs**
   - Application tracking
   - Job save status
   - Interview dates and notes
   - CV variant tracking

### Indexes (8+ total)
- Job title search
- Country and match score
- User and status queries
- Cluster lookups
- Foreign key performance

---

## Connection Details

```
Host:        localhost
Port:        5432
Database:    job_dashboard
User:        postgres
Password:    password
```

**Connection String:**
```
postgresql://postgres:password@localhost:5432/job_dashboard
```

---

## Quick Commands Reference

### Verify Tables Exist
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\dt"
```

### Check Indexes
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "\di"
```

### Test Empty Tables
```bash
psql postgresql://postgres:password@localhost:5432/job_dashboard << EOF
SELECT COUNT(*) FROM user_profiles;
SELECT COUNT(*) FROM jobs;
SELECT COUNT(*) FROM job_clusters;
SELECT COUNT(*) FROM saved_jobs;
EOF
```

### Connect to Database
```bash
# Local PostgreSQL
psql -d job_dashboard

# Docker
docker exec -it lazyscaper-db psql -U postgres -d job_dashboard
```

---

## Troubleshooting Quick Links

- **PostgreSQL not installed?**
  → See [DATABASE_SETUP.md](DATABASE_SETUP.md) - Installation section

- **Connection errors?**
  → See [DATABASE_SETUP.md](DATABASE_SETUP.md) - Troubleshooting section

- **Tables not created?**
  → See [SETUP_VERIFICATION_CHECKLIST.md](SETUP_VERIFICATION_CHECKLIST.md) - Troubleshooting Checklist

- **Docker container issues?**
  → See [DATABASE_SETUP.md](DATABASE_SETUP.md) - Docker Setup section
  → Or [QUICK_START_DB.md](QUICK_START_DB.md) - Docker quick commands

---

## Next Steps After Database Setup

1. **Verify the database:**
   ```bash
   # Use the verification checklist
   cat SETUP_VERIFICATION_CHECKLIST.md
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Test API connection:**
   ```bash
   curl http://localhost:5000/health
   ```

4. **Insert test data (optional):**
   ```bash
   psql postgresql://postgres:password@localhost:5432/job_dashboard << EOF
   INSERT INTO user_profiles (user_id, skills, experience_years, target_countries)
   VALUES ('test_user', ARRAY['JavaScript', 'PostgreSQL'], 5, ARRAY['Germany']);
   EOF
   ```

---

## File Organization

```
/home/gautham/lazyscaper/
├── DATABASE_SETUP.md                      ← Full guide (START HERE for details)
├── QUICK_START_DB.md                      ← Quick guide (START HERE for speed)
├── DATABASE_SETUP_INDEX.md                ← This file (navigation)
├── DB_SETUP_SUMMARY.txt                   ← Executive summary
├── SETUP_VERIFICATION_CHECKLIST.md        ← Verification steps
├── SETUP_COMPLETE.txt                     ← Setup status report
├── setup-db-docker.sh                     ← Docker automation script
├── setup-db-local.sh                      ← Local PostgreSQL automation script
├── backend/
│   ├── .env                               ← Configuration (CREATED)
│   ├── .env.example                       ← Template
│   ├── schema.sql                         ← Database schema
│   └── src/config/database.ts             ← Connection logic
└── [other backend files]
```

---

## Documentation Quality Checklist

✅ Installation guides for all OS (Ubuntu, Fedora, macOS)  
✅ Docker setup with container management  
✅ AWS RDS cloud alternative  
✅ Automated setup scripts (Docker + Local)  
✅ Comprehensive verification checklist  
✅ Troubleshooting guide  
✅ Quick reference commands  
✅ Configuration file templates  
✅ Database maintenance procedures  
✅ Security recommendations  

---

## Support Resources

**Internal:**
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Main documentation
- [SETUP_VERIFICATION_CHECKLIST.md](SETUP_VERIFICATION_CHECKLIST.md) - Testing guide
- [backend/src/config/database.ts](backend/src/config/database.ts) - Code reference

**External:**
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS RDS PostgreSQL](https://aws.amazon.com/rds/postgresql/)

---

## Summary

**Status:** ✅ Complete - All setup files created and configured

**What You Have:**
- Automated setup scripts for Docker and Local PostgreSQL
- Comprehensive documentation for all scenarios
- Environment configuration ready
- Schema file verified (4 tables, 8+ indexes)
- Verification checklist with 50+ checks
- Troubleshooting guide included

**What's Next:**
1. Choose your setup method (Docker or Local)
2. Run the appropriate script or follow the guide
3. Verify using the checklist
4. Start the backend

**Estimated Time:**
- Docker setup: 2 minutes
- Local setup: 5-10 minutes
- Verification: 5 minutes
- Total: 12-17 minutes to fully functional database

---

**Last Updated:** April 1, 2024  
**Project:** LazyScaper Backend  
**Database:** PostgreSQL 12+  
**Schema Version:** 1.0
