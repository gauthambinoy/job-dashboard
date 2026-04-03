# Environment Variables Reference

## Overview
This document provides a complete reference for all environment variables used in the LazyScaper backend across different deployment environments.

## Environment Variable Definitions

### 1. DATABASE_URL
**Purpose:** PostgreSQL connection string  
**Required:** Yes  
**Type:** String (Connection String)

#### Local Development
```
postgresql://postgres:password@localhost:5432/job_dashboard
```

#### AWS RDS Production
```
postgresql://username:password@your-rds-endpoint.rds.amazonaws.com:5432/job_dashboard
```

#### Connection String Format
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Components:**
- `user`: Database user (default: postgres)
- `password`: Database password (secure random string in production)
- `host`: Database host (localhost, RDS endpoint, or other provider)
- `port`: PostgreSQL port (default: 5432)
- `database`: Database name (job_dashboard)

**Notes:**
- URLs must use proper encoding for special characters: `@` → `%40`, `:` → `%3A`
- No trailing slash
- Connection pooling configured in code (max 20 connections)

**Example RDS URL:**
```
postgresql://postgres:MySecurePass123@lazyscaper.c9akciq32.us-east-1.rds.amazonaws.com:5432/job_dashboard
```

---

### 2. NODE_ENV
**Purpose:** Specifies the application environment/deployment mode  
**Required:** Yes  
**Type:** String (development | production | staging)

#### Values

| Value | Use Case | Behavior |
|-------|----------|----------|
| `development` | Local development | Detailed logging, hot reload, relaxed CORS |
| `production` | Railway deployment, live traffic | Optimized logging, CORS restricted, error handling |
| `staging` | Testing environment | Mix of both, detailed errors, CORS restricted |

**Default:** development (if not set)

**Notes:**
- Controls logging verbosity
- Affects CORS configuration
- Should be `production` for Railway
- Required for DATABASE_URL validation

---

### 3. API_PORT
**Purpose:** Port the Express server listens on  
**Required:** No  
**Type:** Number

**Default:** 5000

**Values:**
- Local development: `3000`, `5000`, or `8000` (any free port)
- Railway: `5000` (set by platform, can be overridden)
- Docker container: `5000` (exposed in Dockerfile)

**Notes:**
- Railway automatically assigns port, but this is the internal port
- Must match the port in Dockerfile EXPOSE
- Cannot conflict with other services on same machine

---

### 4. JWT_SECRET
**Purpose:** Secret key for signing and verifying JWT authentication tokens  
**Required:** Yes  
**Type:** String (cryptographic key)

**Requirements:**
- Minimum 32 bytes (64 hex characters)
- Cryptographically random
- Unique per environment
- Never shared or logged
- Stored securely (environment variables only)

**Generation Methods:**

```bash
# Node.js (Recommended)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output example:
# 7a8f9e2c1b3d4a5c6f8e9d0c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9

# OpenSSL
openssl rand -hex 32

# Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Storage:**
- Railway: Environment variable (encrypted at rest)
- Local: `.env` file (never commit to git)
- CI/CD: Secret management system

**Token Expiration:**
- Not set here; configured in auth middleware
- Typically 24-48 hours for auth tokens
- Can be configurable per application need

**Notes:**
- Changing JWT_SECRET will invalidate all existing tokens
- Plan token rotation carefully in production
- Use different keys for development and production
- Verify tokens before trusting them

---

### 5. FRONTEND_URL
**Purpose:** Frontend origin for CORS (Cross-Origin Resource Sharing) configuration  
**Required:** Yes (for production)  
**Type:** URL String

**Values:**

#### Local Development
```
http://localhost:3000
```

#### Vercel Production
```
https://lazyscaper-frontend-abc123.vercel.app
```

**Format:**
```
https://[domain].[tld]
```

**Requirements:**
- No trailing slash
- Must include protocol (http:// or https://)
- Must match exact domain in browser

**Notes:**
- Controls which origins can make requests to the API
- Prevents unauthorized cross-origin requests
- Should only be changed after frontend deployment
- Multiple origins not supported in current configuration
- Can be expanded in future to support multiple origins

**Examples:**
```
http://localhost:3000              # Local development
https://lazyscaper.vercel.app   # Production
https://staging.example.com        # Staging
```

---

### 6. INDEED_API_KEY (Optional)
**Purpose:** API key for Indeed job board integration  
**Required:** No  
**Type:** String (API Key)

**Default:** None (feature disabled if not set)

**Where to Get:**
1. Register with Indeed Employer
2. Request API access
3. Copy API key from developer console

**Uses:**
- Fetching job postings from Indeed
- Scraping job descriptions
- Matching jobs to user profiles

**Notes:**
- Only required if using Indeed job scraping feature
- API rate limits apply
- Should be rotated periodically
- Can be tested with curl:
  ```bash
  curl -H "Authorization: Bearer $INDEED_API_KEY" \
    https://apis.indeed.com/... (endpoint varies)
  ```

---

### 7. LINKEDIN_API_KEY (Optional)
**Purpose:** API key for LinkedIn job board integration  
**Required:** No  
**Type:** String (API Key)

**Default:** None (feature disabled if not set)

**Where to Get:**
1. Create LinkedIn App via LinkedIn Developer Console
2. Authenticate with OAuth 2.0
3. Copy access token or API key

**Uses:**
- Fetching job postings from LinkedIn
- Matching jobs to user skills
- Profile integration

**Notes:**
- LinkedIn API access is restricted (approval required)
- Token expiration must be handled
- Should be rotated before expiration
- More complex than Indeed API

---

## Environment Variable Reference Table

| Variable | Required | Type | Default | Example |
|----------|----------|------|---------|---------|
| DATABASE_URL | Yes | URL | None | `postgresql://user:pass@host/db` |
| NODE_ENV | Yes | String | development | `production` |
| API_PORT | No | Number | 5000 | `5000` |
| JWT_SECRET | Yes | String | None | 64-char hex |
| FRONTEND_URL | Yes | URL | http://localhost:3000 | `https://app.vercel.app` |
| INDEED_API_KEY | No | String | None | `api_key_xxx` |
| LINKEDIN_API_KEY | No | String | None | `token_xxx` |

## Environment Configuration by Stage

### Local Development
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/job_dashboard
NODE_ENV=development
API_PORT=5000
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
INDEED_API_KEY=optional
LINKEDIN_API_KEY=optional
```

### Railway Production
```env
DATABASE_URL=postgresql://user:secure_password@rds-endpoint:5432/job_dashboard
NODE_ENV=production
API_PORT=5000
JWT_SECRET=<64-char-cryptographic-key>
FRONTEND_URL=https://lazyscaper-frontend-prod.vercel.app
INDEED_API_KEY=<production-key>
LINKEDIN_API_KEY=<production-key>
```

### Docker Container
```env
DATABASE_URL=postgresql://postgres:password@postgres-service:5432/job_dashboard
NODE_ENV=production
API_PORT=5000
JWT_SECRET=<secure-key>
FRONTEND_URL=http://frontend-service:3000
```

## Security Best Practices

### DO:
- ✅ Use strong, unique JWT_SECRET (minimum 32 bytes)
- ✅ Rotate JWT_SECRET periodically
- ✅ Never commit `.env` to git
- ✅ Use Railway's secret management
- ✅ Audit logs for environment variable access
- ✅ Store credentials in environment variables
- ✅ Use HTTPS in production (Railway provides this)
- ✅ Validate all environment variables on startup

### DON'T:
- ❌ Hardcode secrets in source code
- ❌ Log sensitive environment variables
- ❌ Share .env files
- ❌ Use default passwords
- ❌ Commit DATABASE_URL to git
- ❌ Use weak JWT_SECRET
- ❌ Store secrets in configuration files
- ❌ Log JWT tokens or API keys

## Validation Checklist

When deploying to a new environment, verify:

- [ ] DATABASE_URL is valid and reachable
- [ ] NODE_ENV is set to correct value
- [ ] API_PORT is available and not in use
- [ ] JWT_SECRET is cryptographically secure
- [ ] FRONTEND_URL matches the frontend origin
- [ ] All required variables are set
- [ ] No secrets are logged
- [ ] Connection can be established
- [ ] Health check endpoint returns 200

## Testing Environment Variables

### Local Testing
```bash
# Verify database connection
psql $DATABASE_URL -c "SELECT 1"

# Check Node can read variables
node -e "console.log(process.env.DATABASE_URL)"

# Test API with variables
npm run dev
curl http://localhost:5000/health
```

### Railway Testing
```bash
# View environment variables in Railway logs
railway logs -f | grep "Database\|connected"

# Test health endpoint
curl https://your-railway-url/health

# View specific environment in logs
# Check Railway dashboard for variable values (masked)
```

## Troubleshooting

### Missing DATABASE_URL
**Error:** `FATAL: DATABASE_URL environment variable is not set`

**Solution:**
1. Check Railway Variables tab
2. Add DATABASE_URL variable
3. Restart service

### Invalid JWT_SECRET
**Error:** `JWT_SECRET is not defined` or tokens don't verify

**Solution:**
1. Generate new secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
2. Update Railway variables
3. Restart service
4. Old tokens will be invalid

### Database Connection Refused
**Error:** `ECONNREFUSED` or `Connection timeout`

**Solution:**
1. Verify DATABASE_URL format
2. Check RDS security group allows connections
3. Test connection locally with psql
4. Check RDS instance is running

### CORS Errors
**Error:** `CORS policy: Access-Control-Allow-Origin`

**Solution:**
1. Update FRONTEND_URL to match your domain
2. Ensure no trailing slash
3. Restart Railway service
4. Clear browser cache

## Resources

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)
- [JWT.io - Information on JWT](https://jwt.io)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [Railway Environments](https://docs.railway.app/develop/variables)
- [Node.js Crypto Module](https://nodejs.org/api/crypto.html)
- [AWS RDS Connection Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ConnectToPostgreSQLInstance.html)
