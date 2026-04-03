#!/bin/bash

set -e

echo "🚀 Setting up Job Seeker Dashboard..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "${GREEN}✓ Node.js and npm found${NC}"
echo ""

# Backend setup
echo "${BLUE}Setting up backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "${GREEN}✓ Created backend .env${NC}"
fi

echo "${GREEN}✓ Backend ready${NC}"
cd ..
echo ""

# Frontend setup
echo "${BLUE}Setting up frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local
    echo "${GREEN}✓ Created frontend .env.local${NC}"
fi

echo "${GREEN}✓ Frontend ready${NC}"
cd ..
echo ""

echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running (or use Docker)"
echo "2. Run: npm run dev (from root, or run backend and frontend separately)"
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:5000"
echo ""
