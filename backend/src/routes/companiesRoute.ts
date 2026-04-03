import { Router, Request, Response } from 'express';
import { createCompanyTracker } from '../services/companyTracker';

const router = Router();
const companyTracker = createCompanyTracker();

/**
 * GET /api/companies
 * List all companies with job counts
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const companies = await companyTracker.getCompanies();

    // Attach job count to each company
    const { query } = await import('../config/database');
    const countResult = await query(
      `SELECT company_id, COUNT(*) as job_count
       FROM jobs
       WHERE company_id IS NOT NULL
       GROUP BY company_id`,
      []
    );

    const jobCountMap: Record<number, number> = {};
    for (const row of countResult.rows) {
      jobCountMap[row.company_id] = parseInt(row.job_count, 10);
    }

    const companiesWithCounts = companies.map((c) => ({
      ...c,
      job_count: jobCountMap[c.id] ?? 0,
    }));

    res.json({ companies: companiesWithCounts, total: companiesWithCounts.length });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

/**
 * GET /api/companies/:id
 * Single company with its jobs
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid company id' });
    }

    const { query } = await import('../config/database');
    const companyResult = await query(
      `SELECT id, name, sector, careers_url, grad_programme_url, has_grad_programme, last_checked, created_at
       FROM companies WHERE id = $1`,
      [id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companyResult.rows[0];
    const jobs = await companyTracker.getCompanyJobs(id);

    res.json({ ...company, jobs, job_count: jobs.length });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

/**
 * GET /api/companies/:id/jobs
 * Jobs for a specific company
 */
router.get('/:id/jobs', async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid company id' });
    }

    const jobs = await companyTracker.getCompanyJobs(id);
    res.json({ company_id: id, jobs, total: jobs.length });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({ error: 'Failed to fetch company jobs' });
  }
});

export default router;
