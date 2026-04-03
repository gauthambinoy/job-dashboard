#!/bin/bash

# LazyScaper - PostgreSQL Docker Setup Script
# This script automates database setup using Docker

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$PROJECT_DIR/backend/schema.sql"

echo "======================================================"
echo "LazyScaper - PostgreSQL Docker Setup"
echo "======================================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed."
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "ERROR: Schema file not found at $SCHEMA_FILE"
    exit 1
fi

echo "Step 1: Checking for existing container..."
if docker ps -a --format '{{.Names}}' | grep -q "^lazyscaper-db$"; then
    echo "Container 'lazyscaper-db' already exists."
    read -p "Do you want to remove it and start fresh? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Stopping and removing container..."
        docker stop lazyscaper-db 2>/dev/null || true
        docker rm lazyscaper-db 2>/dev/null || true
    else
        echo "Using existing container..."
        exit 0
    fi
fi

echo ""
echo "Step 2: Starting PostgreSQL container..."
docker run --name lazyscaper-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=job_dashboard \
  -p 5432:5432 \
  -d postgres:15

echo "Container started successfully!"
echo ""

# Wait for PostgreSQL to be ready
echo "Step 3: Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec lazyscaper-db pg_isready -U postgres &> /dev/null; then
        echo "PostgreSQL is ready!"
        break
    fi
    echo "Waiting... ($i/30)"
    sleep 1
done

echo ""
echo "Step 4: Loading schema..."
docker cp "$SCHEMA_FILE" lazyscaper-db:/tmp/schema.sql
docker exec -i lazyscaper-db psql -U postgres -d job_dashboard -f /tmp/schema.sql

echo "Schema loaded successfully!"
echo ""

echo "Step 5: Verifying tables..."
TABLE_COUNT=$(docker exec lazyscaper-db psql -U postgres -d job_dashboard -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Tables created: $TABLE_COUNT"

if [ "$TABLE_COUNT" -eq "4" ]; then
    echo "✓ All 4 tables created successfully!"
else
    echo "✗ WARNING: Expected 4 tables but found $TABLE_COUNT"
fi

echo ""
echo "Step 6: Creating .env file..."
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
echo "  Database: job_dashboard"
echo "  User: postgres"
echo "  Password: password"
echo ""
echo "Connection String:"
echo "  postgresql://postgres:password@localhost:5432/job_dashboard"
echo ""
echo "Next steps:"
echo "  1. Review backend/.env and update API keys if needed"
echo "  2. Run 'npm install' in the backend directory"
echo "  3. Run 'npm run dev' to start the backend server"
echo ""
echo "Useful Docker commands:"
echo "  docker ps                           # Check container status"
echo "  docker logs lazyscaper-db        # View database logs"
echo "  docker exec -it lazyscaper-db psql -U postgres  # Connect to database"
echo "  docker stop lazyscaper-db        # Stop database"
echo "  docker start lazyscaper-db       # Restart database"
echo ""
