import { JobPipeline } from '../../services/jobPipeline';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockQuery = jest.fn();
jest.mock('../../config/database', () => ({ query: (...args: any[]) => mockQuery(...args) }));

const mockAggregateJobs = jest.fn();
jest.mock('../../services/jobAggregator', () => ({
  JobAggregator: jest.fn().mockImplementation(() => ({ aggregateJobs: mockAggregateJobs })),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeJob(overrides = {}) {
  return {
    company: 'ACME',
    title: 'Dev',
    location: 'Dublin',
    country: 'IE',
    jd_full_text: 'JD text',
    original_url: `https://example.com/job/${Math.random()}`,
    source: 'IrishJobs',
    salary_min: 50000,
    salary_max: 80000,
    currency: 'EUR',
    extracted_skills_required: ['JavaScript'],
    extracted_skills_nice_to_have: [],
    experience_level: 'Mid-Level',
    degree_required: 'Bachelor',
    soft_skills: ['Communication'],
    job_type: 'Full-time',
    posted_date: new Date(),
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

describe('JobPipeline.runFull', () => {
  it('inserts new jobs and returns correct stats', async () => {
    const jobs = [makeJob(), makeJob()];

    mockAggregateJobs.mockResolvedValue({
      totalJobs: 2,
      bySource: { IrishJobs: 2 },
      jobs,
      aggregatedAt: new Date(),
    });

    // First call per job: SELECT (no rows = new job), second: INSERT
    // Final call: COUNT(*)
    mockQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })  // job 1 — not exists
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })  // job 1 INSERT
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })  // job 2 — not exists
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })  // job 2 INSERT
      .mockResolvedValueOnce({ rows: [{ count: '2' }], rowCount: 1 }); // COUNT

    const pipeline = new JobPipeline();
    const stats = await pipeline.runFull();

    expect(stats.newJobsAdded).toBe(2);
    expect(stats.duplicatesSkipped).toBe(0);
    expect(stats.totalJobsInDb).toBe(2);
    expect(stats.errors).toHaveLength(0);
  });

  it('skips duplicate jobs (same original_url)', async () => {
    const url = 'https://example.com/job/duplicate';
    const jobs = [makeJob({ original_url: url }), makeJob({ original_url: url })];

    mockAggregateJobs.mockResolvedValue({
      totalJobs: 2,
      bySource: { IrishJobs: 2 },
      jobs,
      aggregatedAt: new Date(),
    });

    // Both SELECT calls return an existing row → duplicates
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })  // job 1 — exists
      .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })  // job 2 — exists
      .mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 }); // COUNT

    const pipeline = new JobPipeline();
    const stats = await pipeline.runFull();

    expect(stats.newJobsAdded).toBe(0);
    expect(stats.duplicatesSkipped).toBe(2);
  });

  it('records errors for failed DB inserts', async () => {
    mockAggregateJobs.mockResolvedValue({
      totalJobs: 1,
      bySource: {},
      jobs: [makeJob()],
      aggregatedAt: new Date(),
    });

    // SELECT: new job
    mockQuery
      .mockResolvedValueOnce({ rows: [], rowCount: 0 })
      .mockRejectedValueOnce(new Error('DB insert failed'))
      .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 });

    const pipeline = new JobPipeline();
    const stats = await pipeline.runFull();

    expect(stats.errors.length).toBeGreaterThan(0);
    expect(stats.errors[0]).toContain('DB insert failed');
  });

  it('returns error stats if aggregator itself throws', async () => {
    mockAggregateJobs.mockRejectedValue(new Error('Scraping failed'));

    const pipeline = new JobPipeline();
    const stats = await pipeline.runFull();

    expect(stats.errors.length).toBeGreaterThan(0);
    expect(stats.newJobsAdded).toBe(0);
  });

  it('reports bySource from aggregation result', async () => {
    mockAggregateJobs.mockResolvedValue({
      totalJobs: 0,
      bySource: { Adzuna: 25, Arbeitnow: 40, RemoteOK: 30 },
      jobs: [],
      aggregatedAt: new Date(),
    });
    mockQuery.mockResolvedValueOnce({ rows: [{ count: '95' }], rowCount: 1 });

    const pipeline = new JobPipeline();
    const stats = await pipeline.runFull();

    expect(stats.bySource).toEqual({ Adzuna: 25, Arbeitnow: 40, RemoteOK: 30 });
  });
});
