#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost:5000"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
TEST_USER="testuser123"
TEST_JOB_ID="1"
RESULTS_FILE="API_TEST_RESULTS.md"

# Initialize results file
cat > "$RESULTS_FILE" << 'EOF'
# API Test Results

EOF

echo "$TIMESTAMP" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test an endpoint
test_endpoint() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local body=$4
    local expected_code=$5

    echo -e "${BLUE}Testing: $test_name${NC}"

    if [ -z "$body" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$body")
    fi

    # Extract status code (last line)
    http_code=$(echo "$response" | tail -n1)
    # Extract body (everything except last line)
    body_response=$(echo "$response" | head -n-1)

    # Log to file
    echo "## $test_name" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
    echo "**Endpoint:** \`$method $endpoint\`" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"

    if [ -n "$body" ]; then
        echo "**Request Body:**" >> "$RESULTS_FILE"
        echo "\`\`\`json" >> "$RESULTS_FILE"
        echo "$body" | jq . >> "$RESULTS_FILE" 2>/dev/null || echo "$body" >> "$RESULTS_FILE"
        echo "\`\`\`" >> "$RESULTS_FILE"
        echo "" >> "$RESULTS_FILE"
    fi

    echo "**HTTP Status:** $http_code" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"
    echo "**Response:**" >> "$RESULTS_FILE"
    echo "\`\`\`json" >> "$RESULTS_FILE"
    echo "$body_response" | jq . 2>/dev/null || echo "$body_response" >> "$RESULTS_FILE"
    echo "\`\`\`" >> "$RESULTS_FILE"
    echo "" >> "$RESULTS_FILE"

    # Check if response is success
    if [[ "$http_code" =~ ^2[0-9][0-9]$ ]]; then
        echo -e "${GREEN}✓ PASSED (HTTP $http_code)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAILED (HTTP $http_code)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi

    echo ""
}

echo -e "${YELLOW}=== Starting API Tests ===${NC}"
echo ""

# 1. Health Check
test_endpoint "Health Check" "GET" "/health" "" "200"

# 2. Initialize Database
test_endpoint "Initialize Database" "POST" "/api/init-db" "" "200"

# 3. Create/Update User Profile
profile_body='{
  "skills": ["Python", "AWS"],
  "experience_years": 2,
  "education": "BS CS",
  "salary_min": 55000,
  "salary_max": 80000,
  "target_countries": ["Ireland"],
  "availability": "actively_looking"
}'
test_endpoint "Create User Profile" "POST" "/api/profile/$TEST_USER" "$profile_body" "200"

# 4. Get User Profile
test_endpoint "Get User Profile" "GET" "/api/profile/$TEST_USER" "" "200"

# 5. Search Jobs (need to insert test data first)
test_endpoint "Search Jobs" "GET" "/api/jobs/search?countries=Ireland&minSalary=50000" "" "200"

# 6. Get Job By ID (if exists)
test_endpoint "Get Job by ID" "GET" "/api/jobs/$TEST_JOB_ID" "" "200"

# 7. Save a Job
save_body='{
  "userId": "'$TEST_USER'",
  "status": "interested"
}'
test_endpoint "Save Job" "POST" "/api/jobs/$TEST_JOB_ID/save" "$save_body" "200"

# 8. Get Saved Jobs
test_endpoint "Get Saved Jobs" "GET" "/api/jobs/saved/$TEST_USER" "" "200"

# 9. Update Job Status
status_body='{
  "userId": "'$TEST_USER'",
  "newStatus": "applied",
  "dateApplied": "2026-04-01"
}'
test_endpoint "Update Job Status" "PUT" "/api/jobs/$TEST_JOB_ID/status" "$status_body" "200"

# 10. Calculate Match Score
test_endpoint "Calculate Match Score" "POST" "/api/matching/calculate/$TEST_USER/$TEST_JOB_ID" "" "200"

# 11. Analytics - Stats
test_endpoint "Get Analytics Stats" "GET" "/api/analytics/$TEST_USER/stats" "" "200"

# 12. Analytics - Match Distribution
test_endpoint "Get Match Distribution" "GET" "/api/analytics/$TEST_USER/match-distribution" "" "200"

# 13. Analytics - Location Breakdown
test_endpoint "Get Location Breakdown" "GET" "/api/analytics/$TEST_USER/location-breakdown" "" "200"

# 14. Analytics - Timeline
test_endpoint "Get Application Timeline" "GET" "/api/analytics/$TEST_USER/timeline" "" "200"

echo -e "${YELLOW}=== Test Summary ===${NC}"
echo ""
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

# Add summary to file
echo "## Test Summary" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "**Timestamp:** $TIMESTAMP" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "**Tests Passed:** $TESTS_PASSED" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "**Tests Failed:** $TESTS_FAILED" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All endpoints working ✓${NC}"
    echo "**Result:** All endpoints working ✓" >> "$RESULTS_FILE"
else
    echo -e "${RED}Some tests failed${NC}"
    echo "**Result:** Some endpoints failed - see details above" >> "$RESULTS_FILE"
fi

echo ""
echo "Results saved to: $RESULTS_FILE"
