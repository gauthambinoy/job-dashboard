import { Job, JobCluster } from '../types/index';
import { getSkillVector, cosineSimilarity } from '../utils/matchingEngine';
import { query } from '../config/database';

interface JobWithSkills extends Job {
  id: number;
  skill_vector?: Record<string, number>;
}

export const clusterJobs = async (jobs: JobWithSkills[]): Promise<Map<string, JobCluster>> => {
  const clusters = new Map<string, JobCluster>();
  const clusterMap = new Map<number, string>(); // job_id -> cluster_id

  let clusterCounter = 1;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const jobId = job.id;

    // Skip if already assigned
    if (clusterMap.has(jobId)) continue;

    // Create new cluster
    const clusterId = `C-${String(clusterCounter).padStart(3, '0')}`;
    const jobIds: number[] = [jobId];

    // Get skill vector for this job
    const skillVector = getSkillVector(job.extracted_skills_required || []);

    // Find similar jobs
    for (let j = i + 1; j < jobs.length; j++) {
      const otherJob = jobs[j];
      if (clusterMap.has(otherJob.id)) continue;

      // Calculate similarity
      const otherSkillVector = getSkillVector(otherJob.extracted_skills_required || []);
      const similarity = cosineSimilarity(skillVector, otherSkillVector);

      // If 85%+ similar, add to cluster
      if (similarity >= 0.85) {
        jobIds.push(otherJob.id);
        clusterMap.set(otherJob.id, clusterId);
      }
    }

    clusterMap.set(jobId, clusterId);

    // Calculate consolidated skills
    const allSkills = new Set<string>();
    for (const jid of jobIds) {
      const j = jobs.find((job) => job.id === jid);
      if (j && j.extracted_skills_required) {
        j.extracted_skills_required.forEach((s) => allSkills.add(s));
      }
    }

    // Calculate average match score (will be set later)
    const cluster: JobCluster = {
      id: clusterId,
      domain: identifyDomain(job.title),
      job_ids: jobIds,
      skill_vector: skillVector,
      required_skills_consolidated: Array.from(allSkills),
      cv_suggestion:
        jobIds.length > 1
          ? `You can use 1 CV for all ${jobIds.length} jobs in this cluster`
          : undefined,
    };

    clusters.set(clusterId, cluster);
    clusterCounter++;
  }

  return clusters;
};

function identifyDomain(jobTitle: string): string {
  const title = jobTitle.toLowerCase();

  if (title.includes('backend') || title.includes('full stack')) return 'Backend Engineering';
  if (title.includes('frontend') || title.includes('react') || title.includes('vue')) return 'Frontend Engineering';
  if (title.includes('data engineer') || title.includes('data scientist') || title.includes('ml')) return 'Data Engineering';
  if (title.includes('devops') || title.includes('sre') || title.includes('infrastructure'))
    return 'Infrastructure/Cloud';
  if (title.includes('qa') || title.includes('test')) return 'QA/Testing';

  return 'Software Engineering';
}

export const saveClustersToDb = async (clusters: Map<string, JobCluster>): Promise<void> => {
  for (const [clusterId, cluster] of clusters) {
    const insertQuery = `
      INSERT INTO job_clusters (id, domain, job_ids, required_skills_consolidated, cv_suggestion, skill_vector)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE
      SET job_ids = EXCLUDED.job_ids,
          required_skills_consolidated = EXCLUDED.required_skills_consolidated,
          updated_at = CURRENT_TIMESTAMP
    `;

    await query(insertQuery, [
      clusterId,
      cluster.domain,
      cluster.job_ids,
      cluster.required_skills_consolidated,
      cluster.cv_suggestion,
      JSON.stringify(cluster.skill_vector),
    ]);
  }
};

export const assignClusterIdsToJobs = async (clusters: Map<string, JobCluster>): Promise<void> => {
  for (const [clusterId, cluster] of clusters) {
    for (const jobId of cluster.job_ids) {
      const updateQuery = 'UPDATE jobs SET cluster_id = $1 WHERE id = $2';
      await query(updateQuery, [clusterId, jobId]);
    }
  }
};
