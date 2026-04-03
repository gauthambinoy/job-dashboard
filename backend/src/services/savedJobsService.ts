import { SavedJob, Job } from '../types/index';
import { query } from '../config/database';

export interface SaveJobRequest {
  userId: string;
  jobId: number;
  status?: 'interested' | 'applied' | 'interviewing' | 'rejected' | 'offered';
}

export interface UpdateJobStatusRequest {
  userId: string;
  jobId: number;
  newStatus: 'interested' | 'applied' | 'interviewing' | 'rejected' | 'offered';
  dateApplied?: Date;
  interviewDate?: Date;
  resultNotes?: string;
}

export interface GetSavedJobsFilters {
  status?: 'interested' | 'applied' | 'interviewing' | 'rejected' | 'offered';
  clusterId?: string;
  sortBy?: 'date_saved' | 'date_applied' | 'match_score';
  limit?: number;
  offset?: number;
}

export interface SavedJobWithDetails extends SavedJob {
  jobDetails?: Job;
}

/**
 * Manages saving and tracking jobs for users
 */
export const saveJob = async (request: SaveJobRequest): Promise<SavedJob> => {
  try {
    const { userId, jobId, status = 'interested' } = request;

    // Check if job already saved
    const checkResult = await query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId],
    );

    if (checkResult.rows.length > 0) {
      throw new Error('Job already saved by this user');
    }

    const result = await query(
      `INSERT INTO saved_jobs (user_id, job_id, status, date_saved)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id, user_id, job_id, cluster_id, status, cv_variant_used, notes, date_saved, date_applied, interview_date, result_notes`,
      [userId, jobId, status],
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to save job');
    }

    return result.rows[0] as SavedJob;
  } catch (error) {
    console.error('Error saving job:', error);
    throw error;
  }
};

/**
 * Updates the status of a saved job
 */
export const updateJobStatus = async (request: UpdateJobStatusRequest): Promise<SavedJob> => {
  try {
    const { userId, jobId, newStatus, dateApplied, interviewDate, resultNotes } = request;

    // Build dynamic update query
    const updates: string[] = ['status = $3', 'updated_at = CURRENT_TIMESTAMP'];
    const params: (string | number | Date | null)[] = [userId, jobId, newStatus];
    let paramIndex = 4;

    if (dateApplied) {
      updates.push(`date_applied = $${paramIndex}`);
      params.push(dateApplied);
      paramIndex++;
    }

    if (interviewDate) {
      updates.push(`interview_date = $${paramIndex}`);
      params.push(interviewDate);
      paramIndex++;
    }

    if (resultNotes) {
      updates.push(`result_notes = $${paramIndex}`);
      params.push(resultNotes);
      paramIndex++;
    }

    const result = await query(
      `UPDATE saved_jobs
       SET ${updates.join(', ')}
       WHERE user_id = $1 AND job_id = $2
       RETURNING id, user_id, job_id, cluster_id, status, cv_variant_used, notes, date_saved, date_applied, interview_date, result_notes`,
      params,
    );

    if (result.rows.length === 0) {
      throw new Error('Saved job not found');
    }

    return result.rows[0] as SavedJob;
  } catch (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
};

/**
 * Retrieves saved jobs for a user with optional filters
 */
export const getSavedJobs = async (userId: string, filters?: GetSavedJobsFilters): Promise<SavedJobWithDetails[]> => {
  try {
    let queryStr = `
      SELECT
        sj.id, sj.user_id, sj.job_id, sj.cluster_id, sj.status,
        sj.cv_variant_used, sj.notes, sj.date_saved, sj.date_applied,
        sj.interview_date, sj.result_notes,
        j.company, j.title, j.location, j.country, j.salary_min, j.salary_max,
        j.currency, j.jd_full_text, j.original_url, j.source, j.extracted_skills_required,
        j.extracted_skills_nice_to_have, j.experience_level, j.degree_required,
        j.soft_skills, j.job_type, j.posted_date, j.cluster_id as job_cluster_id, j.match_score
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      WHERE sj.user_id = $1
    `;

    const params: (string | number)[] = [userId];
    let paramIndex = 2;

    if (filters?.status) {
      queryStr += ` AND sj.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.clusterId) {
      queryStr += ` AND sj.cluster_id = $${paramIndex}`;
      params.push(filters.clusterId);
      paramIndex++;
    }

    const sortBy = filters?.sortBy || 'date_saved';
    queryStr += ` ORDER BY sj.${sortBy} DESC`;

    const limit = filters?.limit || 100;
    const offset = filters?.offset || 0;

    queryStr += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(queryStr, params);

    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      job_id: row.job_id,
      cluster_id: row.cluster_id,
      status: row.status,
      cv_variant_used: row.cv_variant_used,
      notes: row.notes,
      date_saved: row.date_saved,
      date_applied: row.date_applied,
      interview_date: row.interview_date,
      result_notes: row.result_notes,
      jobDetails: {
        id: row.job_id,
        company: row.company,
        title: row.title,
        location: row.location,
        country: row.country,
        salary_min: row.salary_min,
        salary_max: row.salary_max,
        currency: row.currency,
        jd_full_text: row.jd_full_text,
        original_url: row.original_url,
        source: row.source,
        extracted_skills_required: row.extracted_skills_required,
        extracted_skills_nice_to_have: row.extracted_skills_nice_to_have,
        experience_level: row.experience_level,
        degree_required: row.degree_required,
        soft_skills: row.soft_skills,
        job_type: row.job_type,
        posted_date: row.posted_date,
        cluster_id: row.job_cluster_id,
        match_score: row.match_score,
      } as Job,
    }));
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    throw error;
  }
};

/**
 * Adds or updates a note on a saved job
 */
export const addNote = async (userId: string, jobId: number, note: string): Promise<SavedJob> => {
  try {
    const result = await query(
      `UPDATE saved_jobs
       SET notes = $3, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND job_id = $2
       RETURNING id, user_id, job_id, cluster_id, status, cv_variant_used, notes, date_saved, date_applied, interview_date, result_notes`,
      [userId, jobId, note],
    );

    if (result.rows.length === 0) {
      throw new Error('Saved job not found');
    }

    return result.rows[0] as SavedJob;
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

/**
 * Removes a job from saved jobs
 */
export const deleteJob = async (userId: string, jobId: number): Promise<void> => {
  try {
    const result = await query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId],
    );

    if (result.rowCount === 0) {
      throw new Error('Saved job not found');
    }
  } catch (error) {
    console.error('Error deleting saved job:', error);
    throw error;
  }
};
