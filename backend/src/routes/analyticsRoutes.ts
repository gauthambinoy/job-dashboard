import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getApplicationStats,
  getMatchDistribution,
  getClusterStats,
  getLocationBreakdown,
  getApplicationTimeline,
} from '../services/analyticsService';

const router = Router();

/**
 * GET /api/analytics/stats
 * Returns overall application statistics for the authenticated user
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await getApplicationStats(userId);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch application stats' });
  }
});

/**
 * GET /api/analytics/match-distribution
 * Returns distribution of match scores for the authenticated user
 */
router.get('/match-distribution', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const distribution = await getMatchDistribution(userId);
    res.json(distribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch match distribution' });
  }
});

/**
 * GET /api/analytics/cluster-stats
 * Returns cluster-level performance statistics for the authenticated user
 */
router.get('/cluster-stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const clusterStats = await getClusterStats(userId);
    res.json(clusterStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cluster stats' });
  }
});

/**
 * GET /api/analytics/location-breakdown
 * Returns job statistics broken down by country/location for the authenticated user
 */
router.get('/location-breakdown', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const locationBreakdown = await getLocationBreakdown(userId);
    res.json(locationBreakdown);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch location breakdown' });
  }
});

/**
 * GET /api/analytics/timeline
 * Returns timeline of application events for the authenticated user
 */
router.get('/timeline', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const timeline = await getApplicationTimeline(userId);
    res.json(timeline);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch application timeline' });
  }
});

export default router;
