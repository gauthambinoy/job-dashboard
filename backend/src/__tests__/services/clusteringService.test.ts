import { clusterJobs } from '../../services/clusteringService';

// Mock the database — clusterJobs itself doesn't call the DB, only saveClusters/assignCluster do
jest.mock('../../config/database', () => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
}));

function makeJob(id: number, title: string, skills: string[]) {
  return {
    id,
    company: 'Test Co',
    title,
    location: 'Dublin',
    country: 'IE',
    jd_full_text: '',
    original_url: `https://example.com/job/${id}`,
    source: 'IrishJobs' as const,
    extracted_skills_required: skills,
  };
}

describe('clusterJobs', () => {
  it('groups jobs with identical skills into one cluster', async () => {
    const jobs = [
      makeJob(1, 'React Developer', ['React', 'JavaScript', 'CSS']),
      makeJob(2, 'Frontend Engineer', ['React', 'JavaScript', 'CSS']),
    ];
    const clusters = await clusterJobs(jobs);
    // With identical skill vectors, cosine similarity = 1 ≥ 0.85 → same cluster
    expect(clusters.size).toBe(1);
    const [cluster] = clusters.values();
    expect(cluster.job_ids).toContain(1);
    expect(cluster.job_ids).toContain(2);
  });

  it('puts jobs with completely different skills in separate clusters', async () => {
    const jobs = [
      makeJob(1, 'Python Engineer', ['Python', 'Django', 'Celery']),
      makeJob(2, 'iOS Developer', ['Swift', 'Xcode', 'CoreData']),
    ];
    const clusters = await clusterJobs(jobs);
    expect(clusters.size).toBe(2);
  });

  it('assigns a cluster ID with the C-XXX format', async () => {
    const jobs = [makeJob(1, 'Backend Dev', ['Node.js', 'Express'])];
    const clusters = await clusterJobs(jobs);
    const [id] = clusters.keys();
    expect(id).toMatch(/^C-\d{3}$/);
  });

  it('correctly identifies the domain for a frontend job', async () => {
    const jobs = [makeJob(1, 'React Frontend Developer', ['React', 'CSS'])];
    const clusters = await clusterJobs(jobs);
    const [cluster] = clusters.values();
    expect(cluster.domain).toBe('Frontend Engineering');
  });

  it('correctly identifies the domain for a data engineering job', async () => {
    const jobs = [makeJob(1, 'Data Engineer', ['Python', 'Spark'])];
    const clusters = await clusterJobs(jobs);
    const [cluster] = clusters.values();
    expect(cluster.domain).toBe('Data Engineering');
  });

  it('consolidates skills from all jobs in a cluster', async () => {
    // Same skills → cosine sim = 1 → same cluster → consolidated skills union
    const jobs = [
      makeJob(1, 'Full Stack Dev', ['React', 'Node.js', 'TypeScript']),
      makeJob(2, 'Full Stack Engineer', ['React', 'Node.js', 'TypeScript']),
    ];
    const clusters = await clusterJobs(jobs);
    expect(clusters.size).toBe(1);
    const [cluster] = clusters.values();
    expect(cluster.required_skills_consolidated).toContain('React');
    expect(cluster.required_skills_consolidated).toContain('TypeScript');
  });

  it('adds a CV suggestion when multiple jobs share a cluster', async () => {
    const jobs = [
      makeJob(1, 'React Dev', ['React', 'JavaScript', 'TypeScript']),
      makeJob(2, 'React Engineer', ['React', 'JavaScript', 'TypeScript']),
    ];
    const clusters = await clusterJobs(jobs);
    const [cluster] = clusters.values();
    expect(cluster.cv_suggestion).toBeDefined();
    expect(cluster.cv_suggestion).toContain('CV');
  });

  it('returns an empty map for an empty input', async () => {
    const clusters = await clusterJobs([]);
    expect(clusters.size).toBe(0);
  });
});
