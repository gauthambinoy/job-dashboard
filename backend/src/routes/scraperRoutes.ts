import { Router, Request, Response } from 'express';
import { query as dbQuery } from '../config/database';
import { createJobPipeline } from '../services/jobPipeline';

const router = Router();

/**
 * Trigger a full pipeline sync
 * POST /api/scraper/sync
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    console.log('Manual pipeline sync triggered via /api/scraper/sync');

    const pipeline = createJobPipeline();
    const stats = await pipeline.runFull();

    res.json({
      success: true,
      message: 'Pipeline sync complete',
      stats,
    });
  } catch (error) {
    console.error('Error running pipeline sync:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run pipeline sync',
    });
  }
});

/**
 * Get scraper/pipeline statistics — job counts per source from the database
 * GET /api/scraper/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await dbQuery('SELECT source, COUNT(*) as count FROM jobs GROUP BY source', []);

    const stats = result.rows.map((row: { source: string; count: string }) => ({
      source: row.source,
      count: parseInt(row.count, 10),
    }));

    const total = stats.reduce((sum: number, row: { count: number }) => sum + row.count, 0);

    res.json({
      success: true,
      total,
      bySource: stats,
    });
  } catch (error) {
    console.error('Error fetching scraper stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch scraper stats',
    });
  }
});

export default router;
