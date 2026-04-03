# Quick Start: Database Setup

Choose one of the options below:

## Option A: Quick Docker Setup (Recommended for Development)

**Single command to set everything up:**

```bash
cd /home/gautham/lazyscaper
chmod +x setup-db-docker.sh
./setup-db-docker.sh
```

**That's it!** The script will:
- ✓ Start PostgreSQL in Docker
- ✓ Create job_dashboard database
- ✓ Load schema
- ✓ Verify tables are created
- ✓ Create .env file

Then run the backend:
```bash
cd backend
npm install
npm run dev
```

---

## Option B: Local PostgreSQL Setup

**First, install PostgreSQL:**

```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib

# Fedora/RHEL
sudo dnf install -y postgresql postgresql-server postgresql-contrib && sudo postgresql-setup initdb

# macOS
brew install postgresql@15 && brew services start postgresql@15
```

**Then run the setup script:**

```bash
cd /home/gautham/lazyscaper
chmod +x setup-db-local.sh
./setup-db-local.sh
```

Then run the backend:
```bash
cd backend
npm install
npm run dev
```

---

## Option C: Manual Setup (If Scripts Don't Work)

### For Docker:
```bash
# Start PostgreSQL container
docker run --name lazyscaper-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=job_dashboard \
  -p 5432:5432 \
  -d postgres:15

# Wait a moment, then load schema
sleep 3
docker cp /home/gautham/lazyscaper/backend/schema.sql lazyscaper-db:/tmp/
docker exec -i lazyscaper-db psql -U postgres -d job_dashboard -f /tmp/schema.sql
```

### For Local PostgreSQL:
```bash
# Create database
sudo -u postgres psql -c "CREATE DATABASE job_dashboard;"

# Load schema
sudo -u postgres psql -d job_dashboard -f /home/gautham/lazyscaper/backend/schema.sql
```

### Then create .env file:
```bash
cd /home/gautham/lazyscaper/backend
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_dashboard
API_PORT=5000
NODE_ENV=development
INDEED_API_KEY=your_indeed_api_key
LINKEDIN_API_KEY=your_linkedin_api_key
EOF
```

---

## Verify It Works

```bash
# Test database connection
psql postgresql://postgres:password@localhost:5432/job_dashboard -c "SELECT * FROM user_profiles LIMIT 1;"

# Should return: (0 rows) - which is correct for empty schema
```

---

## Database Connection Details

```
Host:     localhost
Port:     5432
Database: job_dashboard
User:     postgres
Password: password
```

**Connection String:**
```
postgresql://postgres:password@localhost:5432/job_dashboard
```

---

## If Something Goes Wrong

### PostgreSQL not installed?
```bash
# Check if installed
psql --version

# If not installed, follow installation steps above
```

### Database connection fails?
```bash
# Check if service is running
sudo systemctl status postgresql              # Linux
docker ps | grep lazyscaper-db            # Docker

# Start it
sudo systemctl start postgresql               # Linux
docker start lazyscaper-db                 # Docker
```

### Reset everything?
```bash
# For Docker
docker stop lazyscaper-db
docker rm lazyscaper-db
./setup-db-docker.sh

# For Local
sudo -u postgres psql -c "DROP DATABASE job_dashboard;"
./setup-db-local.sh
```

---

## Next Steps

1. ✅ Database is set up
2. Run the backend:
   ```bash
   cd /home/gautham/lazyscaper/backend
   npm install
   npm run dev
   ```
3. Backend will start on http://localhost:5000
4. Check the logs for "Database connected" message

---

For detailed documentation, see: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
