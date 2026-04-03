import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createJobInitializer } from '../services/jobInitializer';

/**
 * Admin Routes
 * Protected endpoints for database and job management
 */

const router = Router();
const jobInitializer = createJobInitializer();

// Admin middleware - in production, add proper role checking
const adminMiddleware = (req: AuthRequest, res: Response, next: Function) => {
  // For now, allow authenticated users
  // In production: check if user has admin role
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.use(adminMiddleware);

/**
 * Initialize job database from scrapers
 * POST /api/admin/jobs/initialize
 */
router.post('/jobs/initialize', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Initializing job database...');
    const result = await jobInitializer.initializeJobDatabase();
    res.json(result);
  } catch (error) {
    console.error('Error initializing jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Refresh existing jobs
 * POST /api/admin/jobs/refresh
 */
router.post('/jobs/refresh', async (req: AuthRequest, res: Response) => {
  try {
    console.log('Refreshing jobs...');
    const result = await jobInitializer.refreshJobs();
    res.json(result);
  } catch (error) {
    console.error('Error refreshing jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get job database statistics
 * GET /api/admin/jobs/stats
 */
router.get('/jobs/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await jobInitializer.getDatabaseStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Delete old jobs
 * DELETE /api/admin/jobs/cleanup
 */
router.delete('/jobs/cleanup', async (req: AuthRequest, res: Response) => {
  try {
    const { daysOld } = req.query;
    const days = daysOld ? parseInt(daysOld as string, 10) : 30;

    const result = await jobInitializer.deleteOldJobs(days);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Export jobs to JSON
 * POST /api/admin/jobs/export
 */
router.post('/jobs/export', async (req: AuthRequest, res: Response) => {
  try {
    const { filename } = req.body;
    const filePath = await jobInitializer.exportJobsToJson(filename);
    res.json({
      success: true,
      message: 'Jobs exported successfully',
      filePath,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export jobs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Health check for scrapers
 * GET /api/admin/health
 */
router.get('/health', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await jobInitializer.getDatabaseStats();
    res.json({
      status: 'ok',
      timestamp: new Date(),
      database: {
        jobCount: stats.totalJobs,
        sources: stats.bySource,
        countries: Object.keys(stats.byCountry).length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
