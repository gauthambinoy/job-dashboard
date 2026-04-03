import { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router = Router();

/**
 * GET /api/stats/graduate
 * Graduate job market stats:
 *   totalGraduateJobs, byCity, byTechArea, bySector, closingSoon, topCompanies, pipelineHealth
 */
router.get('/graduate', async (req: Request, res: Response) => {
  try {
    // Total graduate / entry-level jobs
    const totalResult = await query(
      `SELECT COUNT(*) as count FROM jobs
       WHERE experience_level ILIKE '%graduate%'
          OR experience_level ILIKE '%entry%'
          OR experience_level ILIKE '%junior%'`,
      []
    );
    const totalGraduateJobs = parseInt(totalResult.rows[0]?.count ?? '0', 10);

    // By city (location breakdown)
    const cityResult = await query(
      `SELECT location, COUNT(*) as count FROM jobs
       WHERE experience_level ILIKE '%graduate%'
          OR experience_level ILIKE '%entry%'
          OR experience_level ILIKE '%junior%'
       GROUP BY location
       ORDER BY count DESC
       LIMIT 20`,
      []
    );
    const byCity: Record<string, number> = {};
    for (const row of cityResult.rows) {
      byCity[row.location] = parseInt(row.count, 10);
    }

    // By tech area (derived from extracted skills)
    const techAreas: Record<string, string[]> = {
      'Software Engineering': ['javascript', 'typescript', 'python', 'java', 'c#', 'react', 'node'],
      'Data & Analytics': ['sql', 'data analysis', 'python', 'tableau', 'power bi', 'excel'],
      'Cloud & DevOps': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'terraform'],
      'Cybersecurity': ['security', 'penetration testing', 'siem', 'firewall', 'soc'],
      'AI & Machine Learning': ['machine learning', 'ai', 'tensorflow', 'pytorch', 'nlp'],
      'Finance & Accounting': ['accounting', 'finance', 'excel', 'sap', 'audit'],
    };

    const skillsResult = await query(
      `SELECT extracted_skills_required FROM jobs
       WHERE experience_level ILIKE '%graduate%'
          OR experience_level ILIKE '%entry%'
          OR experience_level ILIKE '%junior%'`,
      []
    );

    const byTechArea: Record<string, number> = {};
    for (const row of skillsResult.rows) {
      const skills: string[] = (row.extracted_skills_required || []).map((s: string) => s.toLowerCase());
      for (const [area, keywords] of Object.entries(techAreas)) {
        if (keywords.some((kw) => skills.some((s) => s.includes(kw)))) {
          byTechArea[area] = (byTechArea[area] || 0) + 1;
        }
      }
    }

    // By sector (via companies table join)
    const sectorResult = await query(
      `SELECT c.sector, COUNT(j.id) as count
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.experience_level ILIKE '%graduate%'
          OR j.experience_level ILIKE '%entry%'
          OR j.experience_level ILIKE '%junior%'
       GROUP BY c.sector
       ORDER BY count DESC`,
      []
    );
    const bySector: Record<string, number> = {};
    for (const row of sectorResult.rows) {
      bySector[row.sector] = parseInt(row.count, 10);
    }

    // Closing soon: jobs posted more than 25 days ago (roughly closing in ~5 days if 30-day window)
    const closingSoonResult = await query(
      `SELECT COUNT(*) as count FROM jobs
       WHERE posted_date <= NOW() - INTERVAL '25 days'
         AND posted_date >= NOW() - INTERVAL '30 days'`,
      []
    );
    const closingSoon = parseInt(closingSoonResult.rows[0]?.count ?? '0', 10);

    // Top companies by graduate job count
    const topCompaniesResult = await query(
      `SELECT j.company, COUNT(*) as count
       FROM jobs j
       WHERE j.experience_level ILIKE '%graduate%'
          OR j.experience_level ILIKE '%entry%'
          OR j.experience_level ILIKE '%junior%'
       GROUP BY j.company
       ORDER BY count DESC
       LIMIT 10`,
      []
    );
    const topCompanies = topCompaniesResult.rows.map((r) => ({
      company: r.company,
      jobCount: parseInt(r.count, 10),
    }));

    // Pipeline health: total jobs and when last updated
    const healthResult = await query(
      `SELECT COUNT(*) as total, MAX(updated_at) as last_updated FROM jobs`,
      []
    );
    const pipelineHealth = {
      totalJobsInDb: parseInt(healthResult.rows[0]?.total ?? '0', 10),
      lastUpdated: healthResult.rows[0]?.last_updated ?? null,
    };

    res.json({
      totalGraduateJobs,
      byCity,
      byTechArea,
      bySector,
      closingSoon,
      topCompanies,
      pipelineHealth,
    });
  } catch (error) {
    console.error('Error fetching graduate stats:', error);
    res.status(500).json({ error: 'Failed to fetch graduate stats' });
  }
});

export default router;
