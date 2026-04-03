#!/bin/bash

# LazyScaper - Deployment Readiness Verification Script
# This script verifies that all deployment files are in place and correct

set -e

echo "=========================================="
echo "LazyScaper - Deployment Readiness Check"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0
WARN=0

# Function to check file exists
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description: $file"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $description ($file)"
        ((FAIL++))
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    local dir=$1
    local description=$2

    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description: $dir"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Missing: $description ($dir)"
        ((FAIL++))
        return 1
    fi
}

# Function to check file contains text
check_content() {
    local file=$1
    local pattern=$2
    local description=$3

    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $description"
        ((PASS++))
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Check: $description (not found in $file)"
        ((WARN++))
        return 1
    fi
}

echo "Checking directory structure..."
echo ""

# Check main directories
check_dir "backend" "Backend directory"
check_dir "frontend" "Frontend directory"
check_dir "shared" "Shared directory"

echo ""
echo "Checking Dockerfiles..."
echo ""

# Check Dockerfiles
check_file "backend/Dockerfile" "Backend Dockerfile"
check_file "frontend/Dockerfile" "Frontend Dockerfile"

# Verify they're multi-stage builds
check_content "backend/Dockerfile" "FROM.*AS.*builder" "Backend uses multi-stage build"
check_content "frontend/Dockerfile" "FROM.*AS.*builder" "Frontend uses multi-stage build"

# Verify health checks
check_content "backend/Dockerfile" "HEALTHCHECK" "Backend has health checks"
check_content "frontend/Dockerfile" "HEALTHCHECK" "Frontend has health checks"

# Verify non-root user
check_content "backend/Dockerfile" "adduser" "Backend runs as non-root user"
check_content "frontend/Dockerfile" "adduser" "Frontend runs as non-root user"

echo ""
echo "Checking Docker Compose files..."
echo ""

# Check docker-compose files
check_file "docker-compose.yml" "Development docker-compose"
check_file "docker-compose.prod.yml" "Production docker-compose"

# Verify development compose setup
check_content "docker-compose.yml" "postgres" "Development has PostgreSQL service"
check_content "docker-compose.yml" "backend" "Development has backend service"
check_content "docker-compose.yml" "frontend" "Development has frontend service"

# Verify production compose setup
check_content "docker-compose.prod.yml" "postgres" "Production has PostgreSQL service"
check_content "docker-compose.prod.yml" "backend" "Production has backend service"
check_content "docker-compose.prod.yml" "frontend" "Production has frontend service"
check_content "docker-compose.prod.yml" "nginx" "Production has Nginx service"

echo ""
echo "Checking Docker .dockerignore files..."
echo ""

check_file "backend/.dockerignore" "Backend .dockerignore"
check_file "frontend/.dockerignore" "Frontend .dockerignore"

echo ""
echo "Checking Nginx configuration..."
echo ""

check_file "nginx.conf" "Nginx reverse proxy config"
check_content "nginx.conf" "upstream backend" "Nginx backend upstream configured"
check_content "nginx.conf" "upstream frontend" "Nginx frontend upstream configured"

echo ""
echo "Checking database schema..."
echo ""

check_file "backend/schema.sql" "Database schema file"
check_content "backend/schema.sql" "CREATE TABLE.*user_profiles" "Schema has user_profiles table"
check_content "backend/schema.sql" "CREATE TABLE.*jobs" "Schema has jobs table"
check_content "backend/schema.sql" "CREATE TABLE.*saved_jobs" "Schema has saved_jobs table"

echo ""
echo "Checking environment files..."
echo ""

check_file ".env.example" "Environment variables template"
check_content ".env.example" "DATABASE_URL" ".env.example has DATABASE_URL"
check_content ".env.example" "JWT_SECRET" ".env.example has JWT_SECRET"
check_content ".env.example" "NEXT_PUBLIC_API_URL" ".env.example has NEXT_PUBLIC_API_URL"

echo ""
echo "Checking deployment documentation..."
echo ""

check_file "DEPLOYMENT_GUIDE.md" "Comprehensive deployment guide"
check_file "QUICK_DEPLOY.md" "Quick deploy guide (30 min)"
check_file "DEPLOYMENT_CHECKLIST.txt" "Deployment checklists"
check_file "DEPLOYMENT_README.md" "Deployment infrastructure README"

# Verify guide content
check_content "DEPLOYMENT_GUIDE.md" "Railway" "Guide covers Railway deployment"
check_content "DEPLOYMENT_GUIDE.md" "Vercel" "Guide covers Vercel deployment"
check_content "DEPLOYMENT_GUIDE.md" "AWS" "Guide covers AWS deployment"
check_content "DEPLOYMENT_GUIDE.md" "Docker" "Guide covers Docker setup"

check_content "QUICK_DEPLOY.md" "Railway" "Quick guide focuses on Railway"
check_content "QUICK_DEPLOY.md" "30 minutes" "Quick guide promises 30 min deployment"

check_content "DEPLOYMENT_CHECKLIST.txt" "RAILWAY" "Checklist has Railway section"
check_content "DEPLOYMENT_CHECKLIST.txt" "VERCEL" "Checklist has Vercel section"
check_content "DEPLOYMENT_CHECKLIST.txt" "AWS" "Checklist has AWS section"

echo ""
echo "Checking backend configuration..."
echo ""

check_file "backend/package.json" "Backend package.json"
check_content "backend/package.json" "express" "Backend has Express.js"
check_content "backend/package.json" "pg" "Backend has PostgreSQL driver"
check_content "backend/package.json" "typescript" "Backend configured for TypeScript"

echo ""
echo "Checking frontend configuration..."
echo ""

check_file "frontend/package.json" "Frontend package.json"
check_content "frontend/package.json" "next" "Frontend has Next.js"
check_content "frontend/package.json" "react" "Frontend has React"
check_content "frontend/package.json" "typescript" "Frontend configured for TypeScript"

echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""

echo -e "${GREEN}Passed:${NC}  $PASS"
echo -e "${RED}Failed:${NC}  $FAIL"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo ""
    echo "Your deployment infrastructure is ready."
    echo ""
    echo "Next steps:"
    echo "1. Read QUICK_DEPLOY.md for 30-minute Railway deployment"
    echo "2. Or read DEPLOYMENT_GUIDE.md for detailed instructions"
    echo "3. Test locally: docker-compose up -d"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some critical checks failed.${NC}"
    echo ""
    echo "Please resolve the issues above before deployment."
    exit 1
fi

