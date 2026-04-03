import { Router, Response } from 'express';
import { query } from '../config/database';
import { UserProfile } from '../types/index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// Get user's own profile
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create or update user's own profile
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile: UserProfile = req.body;

    const result = await query(
      `INSERT INTO user_profiles (user_id, skills, experience_years, education, salary_min, salary_max, target_countries, availability)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE
       SET skills = EXCLUDED.skills,
           experience_years = EXCLUDED.experience_years,
           education = EXCLUDED.education,
           salary_min = EXCLUDED.salary_min,
           salary_max = EXCLUDED.salary_max,
           target_countries = EXCLUDED.target_countries,
           availability = EXCLUDED.availability,
           profile_updated_date = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        userId,
        profile.skills,
        profile.experience_years,
        profile.education || null,
        profile.salary_min || null,
        profile.salary_max || null,
        profile.target_countries,
        profile.availability,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

export default router;
