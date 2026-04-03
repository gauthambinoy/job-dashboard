import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { query } from '../config/database';
import { calculateMatchScore } from '../utils/matchingEngine';
import { analyzeJD } from '../utils/jdAnalyzer';

const router = Router();

// Calculate match for a job against user's profile
router.post('/calculate/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user profile
    const profileResult = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get job
    const jobResult = await query('SELECT * FROM jobs WHERE id = $1', [jobId]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const userProfile = profileResult.rows[0];
    const job = jobResult.rows[0];

    // Calculate match
    const match = calculateMatchScore(userProfile, job);

    // Update job with match score
    await query('UPDATE jobs SET match_score = $1 WHERE id = $2', [match.totalScore, jobId]);

    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to calculate match' });
  }
});

// Analyze JD and extract requirements
router.post('/analyze-jd', async (req: AuthRequest, res: Response) => {
  try {
    const { jdText } = req.body;

    if (!jdText) {
      return res.status(400).json({ error: 'JD text is required' });
    }

    const analysis = analyzeJD(jdText);
    res.json(analysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze JD' });
  }
});

// Batch calculate matches for all jobs (for authenticated user and filters)
router.post('/batch', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { countries, minSalary, maxSalary } = req.body;

    // Get user profile
    const profileResult = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userProfile = profileResult.rows[0];

    // Get matching jobs
    let jobQuery = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (countries && countries.length > 0) {
      jobQuery += ` AND country = ANY($${paramIndex})`;
      params.push(countries);
      paramIndex++;
    }

    const jobsResult = await query(jobQuery, params);

    // Calculate matches
    const matchedJobs = jobsResult.rows.map((job) => {
      const match = calculateMatchScore(userProfile, job);
      return {
        ...job,
        match_score: match.totalScore,
        match_details: match,
      };
    });

    // Sort by match score
    matchedJobs.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));

    // Update database
    for (const job of matchedJobs) {
      await query('UPDATE jobs SET match_score = $1 WHERE id = $2', [job.match_score, job.id]);
    }

    res.json(matchedJobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to batch calculate matches' });
  }
});

export default router;
