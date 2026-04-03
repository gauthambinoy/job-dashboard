#!/bin/bash

# Railway Backend Quick Setup Script
# This script provides a reference for setting up the backend on Railway
# It documents the steps but does not execute them automatically

set -e

echo "================================"
echo "Railway Backend Setup - Reference Guide"
echo "================================"
echo ""

# Function to print instructions
print_section() {
    echo ""
    echo "=== $1 ==="
    echo ""
}

print_section "Step 1: Generate JWT Secret"
echo "Run this command and save the output:"
echo ""
echo '  node -e "console.log(require('"'"'crypto'"'"').randomBytes(32).toString('"'"'hex'"'"'))"'
echo ""
read -p "Enter your JWT_SECRET: " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    echo "JWT_SECRET not provided, generating one..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo "Generated JWT_SECRET: $JWT_SECRET"
fi

print_section "Step 2: RDS Connection Details"
echo "You need the following from your AWS RDS instance:"
echo ""
read -p "RDS Endpoint (e.g., lazyscaper.c9akciq32.us-east-1.rds.amazonaws.com): " RDS_ENDPOINT
read -p "Database Username (default: postgres): " DB_USERNAME
DB_USERNAME=${DB_USERNAME:-postgres}
read -sp "Database Password: " DB_PASSWORD
echo ""
read -p "Database Name (default: job_dashboard): " DB_NAME
DB_NAME=${DB_NAME:-job_dashboard}

# Construct DATABASE_URL
DATABASE_URL="postgresql://${DB_USERNAME}:${DB_PASSWORD}@${RDS_ENDPOINT}:5432/${DB_NAME}"

print_section "Step 3: Frontend URL"
echo "After deploying frontend to Vercel, you'll have a URL like:"
echo "  https://lazyscaper-frontend-abc123.vercel.app"
echo ""
read -p "Enter your Frontend URL (or leave blank for now, update later): " FRONTEND_URL
FRONTEND_URL=${FRONTEND_URL:-"https://your-vercel-url.vercel.app"}

print_section "Step 4: Environment Variables Summary"
echo ""
echo "Add these variables to Railway Dashboard > Your Service > Variables:"
echo ""
echo "DATABASE_URL"
echo "  $DATABASE_URL"
echo ""
echo "NODE_ENV"
echo "  production"
echo ""
echo "API_PORT"
echo "  5000"
echo ""
echo "JWT_SECRET"
echo "  $JWT_SECRET"
echo ""
echo "FRONTEND_URL"
echo "  $FRONTEND_URL"
echo ""

print_section "Step 5: Manual Railway Setup Instructions"
echo ""
echo "1. Go to https://railway.app"
echo "2. Select your lazyscaper backend service"
echo "3. Click 'Variables' tab"
echo "4. Add each variable above by clicking 'Add Variable'"
echo "5. Click 'Save'"
echo ""
echo "6. Commit your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Configure Railway backend deployment'"
echo "   git push"
echo ""
echo "7. Railway will automatically deploy on push"
echo ""

print_section "Step 6: Verify Deployment"
echo ""
echo "Once Railway shows a successful deployment:"
echo ""
echo "A. Get your Railway URL from the service dashboard"
echo ""
echo "B. Test health endpoint:"
echo '   curl https://YOUR-RAILWAY-URL/health'
echo ""
echo "C. Initialize database:"
echo '   curl -X POST https://YOUR-RAILWAY-URL/api/init-db'
echo ""
echo "D. Check logs:"
echo "   Look for 'Database connection verified'"
echo "   and 'Backend server running on port 5000'"
echo ""

print_section "Step 7: Update Frontend"
echo ""
echo "After frontend deployment to Vercel:"
echo ""
echo "1. Get your Vercel URL: https://your-frontend-domain.vercel.app"
echo ""
echo "2. Update FRONTEND_URL in Railway:"
echo "   Variables > FRONTEND_URL > set to your Vercel URL"
echo ""
echo "3. Restart the Railway service"
echo ""

print_section "Step 8: Test End-to-End"
echo ""
echo "1. Go to your Vercel frontend URL"
echo "2. Test the API Status page (if available)"
echo "3. Test authentication flow"
echo "4. Verify no CORS errors in browser console"
echo ""

print_section "Troubleshooting"
echo ""
echo "Database Connection Error:"
echo "  - Check DATABASE_URL in Railway Variables"
echo "  - Verify RDS security group allows port 5432"
echo "  - Test locally: psql postgresql://user:pass@host/db"
echo ""
echo "CORS Errors:"
echo "  - Update FRONTEND_URL to match your Vercel URL exactly"
echo "  - No trailing slash"
echo "  - Use https://"
echo ""
echo "JWT Secret Issues:"
echo "  - Regenerate: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
echo "  - Update in Railway Variables"
echo "  - Restart service"
echo ""

print_section "Files to Review"
echo ""
echo "Documentation:"
echo "  - RAILWAY_DEPLOYMENT_GUIDE.md - Complete setup guide"
echo "  - RAILWAY_CONFIG_CHECKLIST.md - Deployment checklist"
echo "  - ENVIRONMENT_VARIABLES_REFERENCE.md - Variable documentation"
echo "  - BACKEND_DEPLOYMENT_CONFIGURATION.md - Configuration details"
echo ""
echo "Code:"
echo "  - backend/.env.example - Configuration template"
echo "  - backend/src/index.ts - CORS and health endpoint"
echo "  - backend/src/config/database.ts - Database connection"
echo ""

print_section "Next Steps"
echo ""
echo "1. Read RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions"
echo "2. Create AWS RDS instance"
echo "3. Deploy backend to Railway"
echo "4. Test health endpoint"
echo "5. Deploy frontend to Vercel"
echo "6. Update FRONTEND_URL in Railway"
echo "7. Test end-to-end integration"
echo ""
echo "================================"
echo "Setup Reference Complete"
echo "================================"
