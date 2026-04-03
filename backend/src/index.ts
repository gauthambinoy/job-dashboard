import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './config/database';
import { authMiddleware } from './middleware/auth';
import { createJobPipeline } from './services/jobPipeline';
import { createCompanyTracker } from './services/companyTracker';

dotenv.config();

const app: Express = express();
const PORT = process.env.API_PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Job Dashboard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/signup | /api/auth/login',
      jobs: '/api/jobs/search | /api/jobs/aggregate/statistics',
      scraper: '/api/scraper',
      analytics: '/api/analytics',
    }
  });
});

// Health check with database connectivity
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      api_port: PORT
    });
  } catch (error: any) {
    console.error('Health check failed:', error.message);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date(),
      database: 'disconnected',
      error: error.message,
      environment: process.env.NODE_ENV || 'development',
      api_port: PORT
    });
  }
});

// Initialize database
app.post('/api/init-db', async (req, res) => {
  try {
    const client = await query(
      `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    await query(
      `CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        skills TEXT[] NOT NULL DEFAULT '{}',
        experience_years INT NOT NULL,
        education VARCHAR(255),
        salary_min INT,
        salary_max INT,
        target_countries TEXT[] NOT NULL DEFAULT '{}',
        availability VARCHAR(50) NOT NULL DEFAULT 'actively_looking',
        profile_updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    await query(
      `CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        company VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        salary_min INT,
        salary_max INT,
        currency VARCHAR(10) DEFAULT 'EUR',
        jd_full_text TEXT,
        original_url TEXT UNIQUE,
        source VARCHAR(50) NOT NULL,
        extracted_skills_required TEXT[],
        extracted_skills_nice_to_have TEXT[],
        experience_level VARCHAR(100),
        degree_required VARCHAR(255),
        soft_skills TEXT[],
        job_type VARCHAR(50),
        posted_date TIMESTAMP,
        cluster_id VARCHAR(100),
        match_score FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    await query(
      `CREATE TABLE IF NOT EXISTS job_clusters (
        id VARCHAR(100) PRIMARY KEY,
        domain VARCHAR(255) NOT NULL,
        job_ids INT[] NOT NULL DEFAULT '{}',
        avg_match_score FLOAT,
        skill_vector JSONB,
        cv_suggestion TEXT,
        required_skills_consolidated TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    await query(
      `CREATE TABLE IF NOT EXISTS saved_jobs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        job_id INT NOT NULL REFERENCES jobs(id),
        cluster_id VARCHAR(100),
        status VARCHAR(50) DEFAULT 'interested',
        cv_variant_used TEXT,
        notes TEXT,
        date_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_applied TIMESTAMP,
        interview_date TIMESTAMP,
        result_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
    );

    res.json({ status: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// Routes
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import jobRoutes from './routes/jobRoutes';
import matchingRoutes from './routes/matchingRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import scraperRoutes from './routes/scraperRoutes';
import adminRoutes from './routes/adminRoutes';
import companiesRoute from './routes/companiesRoute';
import statsRoute from './routes/statsRoute';

// Public jobs search (no auth required — used by frontend)
app.get('/api/public/jobs', async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(req.query.limit as string) || 100);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT id, company, title, location, country, salary_min, salary_max, currency,
              jd_full_text, original_url, source, extracted_skills_required,
              extracted_skills_nice_to_have, experience_level, degree_required,
              soft_skills, job_type, posted_date
       FROM jobs ORDER BY posted_date DESC NULLS LAST LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countResult = await query('SELECT COUNT(*) FROM jobs');
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      jobs: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('Public jobs error:', error.message);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/profile', authMiddleware, profileRoutes);
app.use('/api/jobs', authMiddleware, jobRoutes);
app.use('/api/matching', authMiddleware, matchingRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/scraper', authMiddleware, scraperRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/companies', authMiddleware, companiesRoute);
app.use('/api/stats', authMiddleware, statsRoute);

// Error handling
app.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  },
);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
