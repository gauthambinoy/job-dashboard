#!/bin/bash

# LazyScaper - Local PostgreSQL Setup Script
# This script automates database setup for local PostgreSQL installation

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$PROJECT_DIR/backend/schema.sql"

echo "======================================================"
echo "LazyScaper - Local PostgreSQL Setup"
echo "======================================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
else
    OS="unknown"
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "ERROR: PostgreSQL is not installed."
    echo ""
    if [ "$OS" == "linux" ]; then
        echo "To install PostgreSQL, run:"
        echo "  Ubuntu/Debian: sudo apt-get install -y postgresql postgresql-contrib"
        echo "  Fedora/RHEL:   sudo dnf install -y postgresql postgresql-server postgresql-contrib"
    elif [ "$OS" == "macos" ]; then
        echo "To install PostgreSQL, run:"
        echo "  brew install postgresql@15"
        echo "  brew services start postgresql@15"
    fi
    exit 1
fi

echo "✓ PostgreSQL found: $(psql --version)"
echo ""

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "ERROR: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

echo "Step 1: Checking PostgreSQL service..."
if [ "$OS" == "linux" ]; then
    if sudo systemctl is-active --quiet postgresql; then
        echo "✓ PostgreSQL service is running"
    else
        echo "Starting PostgreSQL service..."
        sudo systemctl start postgresql
        echo "✓ PostgreSQL service started"
    fi
elif [ "$OS" == "macos" ]; then
    if pg_isready &> /dev/null; then
        echo "✓ PostgreSQL is running"
    else
        echo "Starting PostgreSQL..."
        brew services start postgresql@15
        sleep 2
        echo "✓ PostgreSQL started"
    fi
fi

echo ""
echo "Step 2: Checking for existing database..."
DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='lazyscaper'" 2>/dev/null || echo "")

if [ -n "$DB_EXISTS" ]; then
    echo "Database 'lazyscaper' already exists."
    read -p "Do you want to drop it and recreate? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        sudo -u postgres psql -c "DROP DATABASE IF EXISTS lazyscaper;"
        echo "✓ Database dropped"
    else
        echo "Using existing database..."
        echo ""
        echo "Skipping to verification step..."
        SKIP_SCHEMA=true
    fi
fi

if [ -z "$SKIP_SCHEMA" ]; then
    echo ""
    echo "Step 3: Creating database..."
    sudo -u postgres psql -c "CREATE DATABASE lazyscaper;"
    echo "✓ Database created"

    echo ""
    echo "Step 4: Loading schema..."
    sudo -u postgres psql -d lazyscaper -f "$SCHEMA_FILE"
    echo "✓ Schema loaded"
fi

echo ""
echo "Step 5: Verifying tables..."
TABLE_COUNT=$(sudo -u postgres psql -d lazyscaper -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Tables created: $TABLE_COUNT"

if [ "$TABLE_COUNT" -eq "4" ]; then
    echo "✓ All 4 tables created successfully!"
    echo ""
    echo "Tables:"
    sudo -u postgres psql -d lazyscaper -c "\dt"
else
    echo "✗ WARNING: Expected 4 tables but found $TABLE_COUNT"
fi

echo ""
echo "Step 6: Verifying indexes..."
INDEX_COUNT=$(sudo -u postgres psql -d lazyscaper -tAc "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';")
echo "Indexes created: $INDEX_COUNT"

if [ "$INDEX_COUNT" -ge "8" ]; then
    echo "✓ All indexes created successfully!"
else
    echo "✗ WARNING: Expected at least 8 indexes but found $INDEX_COUNT"
fi

echo ""
echo "Step 7: Testing empty tables..."
echo "user_profiles:"
sudo -u postgres psql -d lazyscaper -tAc "SELECT COUNT(*) FROM user_profiles;" | xargs echo "  Count:"
echo "jobs:"
sudo -u postgres psql -d lazyscaper -tAc "SELECT COUNT(*) FROM jobs;" | xargs echo "  Count:"
echo "job_clusters:"
sudo -u postgres psql -d lazyscaper -tAc "SELECT COUNT(*) FROM job_clusters;" | xargs echo "  Count:"
echo "saved_jobs:"
sudo -u postgres psql -d lazyscaper -tAc "SELECT COUNT(*) FROM saved_jobs;" | xargs echo "  Count:"

echo ""
echo "Step 8: Creating .env file..."
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    cp "$PROJECT_DIR/backend/.env.example" "$PROJECT_DIR/backend/.env"
    echo "✓ .env file created at $PROJECT_DIR/backend/.env"
else
    echo "✓ .env file already exists at $PROJECT_DIR/backend/.env"
fi

echo ""
echo "======================================================"
echo "Setup Complete!"
echo "======================================================"
echo ""
echo "Database Details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: lazyscaper"
echo "  User: postgres"
echo ""
echo "Connection String:"
echo "  postgresql://postgres:password@localhost:5432/lazyscaper"
echo ""
echo "NOTE: Update the password in your .env file to match your PostgreSQL setup."
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env and set correct DATABASE_URL if needed"
echo "  2. Add API keys (INDEED_API_KEY, LINKEDIN_API_KEY)"
echo "  3. Run 'npm install' in the backend directory"
echo "  4. Run 'npm run dev' to start the backend server"
echo ""
echo "Useful PostgreSQL commands:"
echo "  psql -d lazyscaper                    # Connect to database as current user"
echo "  sudo -u postgres psql -d lazyscaper   # Connect as postgres user"
echo "  psql -d lazyscaper -c '\\dt'           # List tables"
echo "  psql -d lazyscaper -c '\\di'           # List indexes"
echo ""
