import { Router, Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { createJobAggregator } from '../services/jobAggregator';

const router = Router();
const jobAggregator = createJobAggregator();

// Search jobs
router.get('/search', async (req: AuthRequest, res: Response) => {
  try {
    const query_obj = req.query as any;
    const { countries, minSalary, maxSalary, page, limit } = query_obj;
    const pageVal = page || '1';
    const limitVal = limit || '20';

    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params: any[] = [];
    let idx = 1;

    if (countries) {
      const arr = Array.isArray(countries) ? countries : [countries];
      sql += ` AND country = ANY($${idx})`;
      params.push(arr);
      idx++;
    }

    if (minSalary) {
      const salaryStr = Array.isArray(minSalary) ? minSalary[0] : minSalary;
      const num = parseInt(salaryStr + '', 10);
      sql += ` AND salary_max >= $${idx}`;
      params.push(num);
      idx++;
    }

    if (maxSalary) {
      const salaryStr = Array.isArray(maxSalary) ? maxSalary[0] : maxSalary;
      const num = parseInt(salaryStr + '', 10);
      sql += ` AND salary_min <= $${idx}`;
      params.push(num);
      idx++;
    }

    const pageStr = Array.isArray(pageVal) ? pageVal[0] : pageVal;
    const limitStr = Array.isArray(limitVal) ? limitVal[0] : limitVal;
    const p = parseInt(pageStr + '', 10) || 1;
    const l = parseInt(limitStr + '', 10) || 20;
    const offset = (p - 1) * l;

    sql += ` ORDER BY match_score DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(l, offset);

    const result = await query(sql, params);
    res.json({ jobs: result.rows, page: p, limit: l, total: result.rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

// Get job by ID
router.get('/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = (req.params.jobId || '') as string;
    const result = await query('SELECT * FROM jobs WHERE id = $1', [parseInt(jobId, 10)]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Get jobs by cluster
router.get('/cluster/:clusterId', async (req: AuthRequest, res: Response) => {
  try {
    const { clusterId } = req.params;
    const result = await query('SELECT * FROM jobs WHERE cluster_id = $1', [clusterId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cluster jobs' });
  }
});

// Save a job
router.post('/:jobId/save', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = (req.params.jobId || '') as string;
    const userId = req.userId;
    const status = (req.body.status || 'interested') as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query(
      'INSERT INTO saved_jobs (user_id, job_id, status, date_saved) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [userId, parseInt(jobId, 10), status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save job' });
  }
});

// Update job status
router.put('/:jobId/status', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = (req.params.jobId || '') as string;
    const userId = req.userId;
    const newStatus = (req.body.newStatus || '') as string;
    const dateApplied = req.body.dateApplied;
    const interviewDate = req.body.interviewDate;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!newStatus) {
      return res.status(400).json({ error: 'newStatus is required' });
    }

    const result = await query(
      `UPDATE saved_jobs SET status = $1, date_applied = COALESCE($2, date_applied),
       interview_date = COALESCE($3, interview_date), updated_at = NOW()
       WHERE job_id = $4 AND user_id = $5 RETURNING *`,
      [newStatus, dateApplied, interviewDate, parseInt(jobId, 10), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Get user's saved jobs
router.get('/saved', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const query_obj = req.query as any;
    const { status, limit, offset } = query_obj;
    const limitVal = limit || '50';
    const offsetVal = offset || '0';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let sql = 'SELECT * FROM saved_jobs WHERE user_id = $1';
    const params: any[] = [userId];
    let idx = 2;

    if (status) {
      const st = Array.isArray(status) ? status[0] : status;
      sql += ` AND status = $${idx}`;
      params.push(st);
      idx++;
    }

    sql += ` ORDER BY date_saved DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    const limitStr = Array.isArray(limitVal) ? limitVal[0] : limitVal;
    const offsetStr = Array.isArray(offsetVal) ? offsetVal[0] : offsetVal;
    const l = parseInt(limitStr + '', 10) || 50;
    const o = parseInt(offsetStr + '', 10) || 0;
    params.push(l, o);

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch saved jobs' });
  }
});

// Delete saved job
router.delete('/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = (req.params.jobId || '') as string;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query('DELETE FROM saved_jobs WHERE job_id = $1 AND user_id = $2 RETURNING id', [parseInt(jobId, 10), userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Add note to saved job
router.post('/:jobId/note', async (req: AuthRequest, res: Response) => {
  try {
    const jobId = (req.params.jobId || '') as string;
    const userId = req.userId;
    const note = (req.body.note || '') as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!note) {
      return res.status(400).json({ error: 'note is required' });
    }

    const result = await query(
      'UPDATE saved_jobs SET notes = $1, updated_at = NOW() WHERE job_id = $2 AND user_id = $3 RETURNING *',
      [note, parseInt(jobId, 10), userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Aggregate jobs from all sources (IrishJobs + Bayt)
router.get('/aggregate/all', async (req: AuthRequest, res: Response) => {
  try {
    const result = await jobAggregator.aggregateJobs();
    res.json(result);
  } catch (error) {
    console.error('Error aggregating jobs:', error);
    res.status(500).json({
      error: 'Failed to aggregate jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get aggregated jobs by country
router.get('/aggregate/by-country/:country', async (req: AuthRequest, res: Response) => {
  try {
    const country = String(req.params.country || '');
    const jobs = await jobAggregator.getJobsByCountry(country);
    res.json({ country, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs by country' });
  }
});

// Get aggregated jobs by skill
router.get('/aggregate/by-skill/:skill', async (req: AuthRequest, res: Response) => {
  try {
    const skill = String(req.params.skill || '');
    const jobs = await jobAggregator.getJobsBySkill(skill);
    res.json({ skill, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs by skill' });
  }
});

// Get aggregated jobs by experience level
router.get('/aggregate/by-experience/:level', async (req: AuthRequest, res: Response) => {
  try {
    const { level } = req.params as { level: 'Junior' | 'Mid-Level' | 'Senior' };
    const jobs = await jobAggregator.getJobsByExperienceLevel(level);
    res.json({ level, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs by experience level' });
  }
});

// Get aggregated jobs by salary range
router.get('/aggregate/by-salary', async (req: AuthRequest, res: Response) => {
  try {
    const { minSalary, maxSalary } = req.query;
    const min = parseInt(minSalary as string, 10) || 0;
    const max = parseInt(maxSalary as string, 10) || 1000000;

    const jobs = await jobAggregator.getJobsBySalaryRange(min, max);
    res.json({ salaryRange: { min, max }, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs by salary range' });
  }
});

// Get job market statistics
router.get('/aggregate/statistics', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await jobAggregator.getJobStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
});

// Clear job cache
router.post('/aggregate/clear-cache', async (req: AuthRequest, res: Response) => {
  try {
    jobAggregator.clearCache();
    res.json({ status: 'Cache cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

export default router;
