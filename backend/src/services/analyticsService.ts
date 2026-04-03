import { query } from '../config/database';

export interface ApplicationStats {
  totalSaved: number;
  applied: number;
  interviewing: number;
  rejected: number;
  offered: number;
  conversionRateApplied: number; // % of saved jobs that received interviews or offers
  conversionRateInterview: number; // % of interviewed jobs that received offers
}

export interface MatchDistribution {
  ranges: Array<{
    min: number;
    max: number;
    count: number;
    percentage: number;
  }>;
  averageMatch: number;
  medianMatch: number;
}

export interface ClusterStats {
  clusterId: string;
  domain: string;
  jobCount: number;
  totalSaved: number;
  applied: number;
  interviewed: number;
  offered: number;
  averageMatchScore: number;
  conversionRate: number; // % of saved jobs in cluster that progressed
}

export interface LocationBreakdown {
  country: string;
  totalSaved: number;
  applied: number;
  interviewing: number;
  rejected: number;
  offered: number;
}

export interface ApplicationTimeline {
  date: Date;
  status: string;
  count: number;
}

/**
 * Gets application statistics for a user
 */
export const getApplicationStats = async (userId: string): Promise<ApplicationStats> => {
  try {
    const result = await query(
      `SELECT
        COUNT(*) as total_saved,
        SUM(CASE WHEN status = 'applied' THEN 1 ELSE 0 END) as applied,
        SUM(CASE WHEN status = 'interviewing' THEN 1 ELSE 0 END) as interviewing,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'offered' THEN 1 ELSE 0 END) as offered
       FROM saved_jobs
       WHERE user_id = $1`,
      [userId],
    );

    const row = result.rows[0];
    const totalSaved = parseInt(row.total_saved, 10) || 0;
    const appliedCount = parseInt(row.applied, 10) || 0;
    const interviewingCount = parseInt(row.interviewing, 10) || 0;
    const rejectedCount = parseInt(row.rejected, 10) || 0;
    const offeredCount = parseInt(row.offered, 10) || 0;

    const conversionRateApplied = totalSaved > 0 ? ((interviewingCount + offeredCount) / totalSaved) * 100 : 0;
    const conversionRateInterview =
      interviewingCount > 0 ? (offeredCount / interviewingCount) * 100 : 0;

    return {
      totalSaved,
      applied: appliedCount,
      interviewing: interviewingCount,
      rejected: rejectedCount,
      offered: offeredCount,
      conversionRateApplied: Math.round(conversionRateApplied * 100) / 100,
      conversionRateInterview: Math.round(conversionRateInterview * 100) / 100,
    };
  } catch (error) {
    console.error('Error fetching application stats:', error);
    throw error;
  }
};

/**
 * Gets the distribution of match scores for a user's saved jobs
 */
export const getMatchDistribution = async (userId: string): Promise<MatchDistribution> => {
  try {
    const result = await query(
      `SELECT j.match_score
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.user_id = $1 AND j.match_score IS NOT NULL
       ORDER BY j.match_score`,
      [userId],
    );

    if (result.rows.length === 0) {
      return {
        ranges: [],
        averageMatch: 0,
        medianMatch: 0,
      };
    }

    const scores = result.rows.map((row) => row.match_score);
    const averageMatch = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;

    // Calculate median
    const sorted = scores.sort((a, b) => a - b);
    const medianMatch =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

    // Create ranges (0-20, 20-40, 40-60, 60-80, 80-100)
    const ranges = [
      { min: 0, max: 20 },
      { min: 20, max: 40 },
      { min: 40, max: 60 },
      { min: 60, max: 80 },
      { min: 80, max: 100 },
    ];

    const distribution = ranges.map((range) => {
      const count = scores.filter((s) => s >= range.min && s <= range.max).length;
      return {
        ...range,
        count,
        percentage: Math.round((count / scores.length) * 100 * 100) / 100,
      };
    });

    return {
      ranges: distribution,
      averageMatch: Math.round(averageMatch * 100) / 100,
      medianMatch: Math.round(medianMatch * 100) / 100,
    };
  } catch (error) {
    console.error('Error fetching match distribution:', error);
    throw error;
  }
};

/**
 * Gets cluster performance statistics for a user
 */
export const getClusterStats = async (userId: string): Promise<ClusterStats[]> => {
  try {
    const result = await query(
      `SELECT
        jc.id as cluster_id,
        jc.domain,
        COUNT(DISTINCT sj.job_id) as total_saved,
        SUM(CASE WHEN sj.status = 'applied' THEN 1 ELSE 0 END) as applied,
        SUM(CASE WHEN sj.status = 'interviewing' THEN 1 ELSE 0 END) as interviewed,
        SUM(CASE WHEN sj.status = 'offered' THEN 1 ELSE 0 END) as offered,
        COUNT(DISTINCT j.id) as job_count,
        AVG(j.match_score) as avg_match_score
       FROM job_clusters jc
       LEFT JOIN saved_jobs sj ON jc.id = sj.cluster_id AND sj.user_id = $1
       LEFT JOIN jobs j ON sj.job_id = j.id
       WHERE sj.id IS NOT NULL
       GROUP BY jc.id, jc.domain
       ORDER BY total_saved DESC`,
      [userId],
    );

    return result.rows.map((row) => {
      const totalSaved = parseInt(row.total_saved, 10) || 0;
      const interviewed = parseInt(row.interviewed, 10) || 0;
      const offered = parseInt(row.offered, 10) || 0;

      const conversionRate = totalSaved > 0 ? Math.round(((interviewed + offered) / totalSaved) * 100 * 100) / 100 : 0;

      return {
        clusterId: row.cluster_id,
        domain: row.domain,
        jobCount: parseInt(row.job_count, 10) || 0,
        totalSaved,
        applied: parseInt(row.applied, 10) || 0,
        interviewed,
        offered,
        averageMatchScore: row.avg_match_score ? Math.round(row.avg_match_score * 100) / 100 : 0,
        conversionRate,
      };
    });
  } catch (error) {
    console.error('Error fetching cluster stats:', error);
    throw error;
  }
};

/**
 * Gets job statistics broken down by location
 */
export const getLocationBreakdown = async (userId: string): Promise<LocationBreakdown[]> => {
  try {
    const result = await query(
      `SELECT
        j.country,
        COUNT(sj.id) as total_saved,
        SUM(CASE WHEN sj.status = 'applied' THEN 1 ELSE 0 END) as applied,
        SUM(CASE WHEN sj.status = 'interviewing' THEN 1 ELSE 0 END) as interviewing,
        SUM(CASE WHEN sj.status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN sj.status = 'offered' THEN 1 ELSE 0 END) as offered
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       WHERE sj.user_id = $1
       GROUP BY j.country
       ORDER BY total_saved DESC`,
      [userId],
    );

    return result.rows.map((row) => ({
      country: row.country,
      totalSaved: parseInt(row.total_saved, 10) || 0,
      applied: parseInt(row.applied, 10) || 0,
      interviewing: parseInt(row.interviewing, 10) || 0,
      rejected: parseInt(row.rejected, 10) || 0,
      offered: parseInt(row.offered, 10) || 0,
    }));
  } catch (error) {
    console.error('Error fetching location breakdown:', error);
    throw error;
  }
};

/**
 * Gets timeline of applications and responses
 */
export const getApplicationTimeline = async (userId: string): Promise<ApplicationTimeline[]> => {
  try {
    const result = await query(
      `SELECT
        DATE(date_saved) as date,
        'saved' as status,
        COUNT(*) as count
       FROM saved_jobs
       WHERE user_id = $1 AND date_saved IS NOT NULL
       GROUP BY DATE(date_saved)

       UNION ALL

       SELECT
        DATE(date_applied) as date,
        'applied' as status,
        COUNT(*) as count
       FROM saved_jobs
       WHERE user_id = $1 AND date_applied IS NOT NULL
       GROUP BY DATE(date_applied)

       UNION ALL

       SELECT
        DATE(interview_date) as date,
        'interviewed' as status,
        COUNT(*) as count
       FROM saved_jobs
       WHERE user_id = $1 AND interview_date IS NOT NULL
       GROUP BY DATE(interview_date)

       ORDER BY date ASC`,
      [userId],
    );

    return result.rows.map((row) => ({
      date: row.date,
      status: row.status,
      count: parseInt(row.count, 10) || 0,
    }));
  } catch (error) {
    console.error('Error fetching application timeline:', error);
    throw error;
  }
};
