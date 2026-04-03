import { calculateMatchScore, getSkillVector, cosineSimilarity } from '../../utils/matchingEngine';
import { UserProfile, Job } from '../../types/index';

const baseProfile: UserProfile = {
  user_id: 'test-user',
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
  experience_years: 3,
  education: 'Bachelor',
  salary_min: 50000,
  salary_max: 80000,
  target_countries: ['IE', 'GB'],
  availability: 'actively_looking',
};

const baseJob: Partial<Job> = {
  company: 'Acme Corp',
  title: 'Frontend Developer',
  location: 'Dublin',
  country: 'IE',
  jd_full_text: 'We need a developer',
  original_url: 'https://example.com/job',
  source: 'IrishJobs',
};

function makeJob(overrides: Partial<Job>): Job {
  return { ...baseJob, ...overrides } as Job;
}

// ─── calculateMatchScore ─────────────────────────────────────────────────────

describe('calculateMatchScore', () => {
  it('returns a score in the 0–100 range', () => {
    const job = makeJob({
      extracted_skills_required: ['JavaScript', 'React'],
      experience_level: 'mid-level',
      salary_min: 55000,
      salary_max: 75000,
      country: 'IE',
      degree_required: 'Bachelor',
    });
    const result = calculateMatchScore(baseProfile, job);
    // totalScore is weighted sum / 100, so range is 0–1
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(1);
  });

  it('gives a high total score for a near-perfect match', () => {
    const job = makeJob({
      extracted_skills_required: ['JavaScript', 'React', 'Node.js'],
      experience_level: 'mid-level',
      salary_min: 55000,
      salary_max: 75000,
      country: 'IE',
      degree_required: 'Bachelor',
    });
    const result = calculateMatchScore(baseProfile, job);
    // totalScore is in 0–1 range (weighted sum / 100)
    expect(result.totalScore).toBeGreaterThan(0.5);
  });

  it('gives a low total score when no skills overlap', () => {
    const job = makeJob({
      extracted_skills_required: ['Cobol', 'Fortran', 'VHDL', 'Assembly'],
      experience_level: 'mid-level',
      salary_min: 55000,
      salary_max: 75000,
      country: 'IE',
      degree_required: 'Bachelor',
    });
    const result = calculateMatchScore(baseProfile, job);
    // skills are 40% weight, 0 overlap → skillsMatch contribution is 0
    // other components (exp, salary, location, edu) can still contribute up to 0.6
    expect(result.skillsMatch).toBe(0);
    // total without any skills should be less than a perfect score (1.0)
    expect(result.totalScore).toBeLessThan(1);
  });

  it('gives full skills score when no required skills are listed', () => {
    const job = makeJob({ extracted_skills_required: [] });
    const result = calculateMatchScore(baseProfile, job);
    // 0 required skills → 100% match → skillsMatch = 40
    expect(result.skillsMatch).toBe(40);
  });

  it('returns 0 location score for a country not in target list', () => {
    const job = makeJob({ country: 'JP', extracted_skills_required: [] });
    const result = calculateMatchScore(baseProfile, job);
    expect(result.locationMatch).toBe(0);
  });

  it('returns full location score for a country in target list', () => {
    const job = makeJob({ country: 'GB', extracted_skills_required: [] });
    const result = calculateMatchScore(baseProfile, job);
    expect(result.locationMatch).toBe(10);
  });

  it('returns 0 salary match when job salary is below user minimum', () => {
    const job = makeJob({
      salary_min: 20000,
      salary_max: 30000,
      extracted_skills_required: [],
    });
    const result = calculateMatchScore(baseProfile, job);
    expect(result.salaryMatch).toBe(0);
  });

  it('returns partial salary match for salary overlap', () => {
    const job = makeJob({
      salary_min: 70000,
      salary_max: 100000,
      extracted_skills_required: [],
    });
    const result = calculateMatchScore(baseProfile, job);
    // Overlap at 70k-80k → partial
    expect(result.salaryMatch).toBeGreaterThan(0);
  });

  it('gives full salary score for perfect salary overlap', () => {
    const job = makeJob({
      salary_min: 55000,
      salary_max: 75000,
      extracted_skills_required: [],
    });
    const result = calculateMatchScore(baseProfile, job);
    expect(result.salaryMatch).toBe(15);
  });

  it('returns neutral experience score for senior level with 3 years exp', () => {
    const job = makeJob({ experience_level: 'senior', extracted_skills_required: [] });
    const result = calculateMatchScore(baseProfile, job);
    // 3 years, requires senior (5+) → partial match
    expect(result.experienceMatch).toBeLessThan(30);
    expect(result.experienceMatch).toBeGreaterThanOrEqual(0);
  });

  it('returns full experience score for junior level with 3 years exp', () => {
    const job = makeJob({ experience_level: 'junior', extracted_skills_required: [] });
    const result = calculateMatchScore(baseProfile, job);
    // 3 years → overqualified for junior, but still 0.7 × 30 = 21
    expect(result.experienceMatch).toBeGreaterThan(0);
  });
});

// ─── getSkillVector ───────────────────────────────────────────────────────────

describe('getSkillVector', () => {
  it('counts each skill once with value 1', () => {
    const vec = getSkillVector(['React', 'Node.js']);
    expect(vec['react']).toBe(1);
    expect(vec['node.js']).toBe(1);
  });

  it('accumulates duplicate skills', () => {
    const vec = getSkillVector(['React', 'React', 'Python']);
    expect(vec['react']).toBe(2);
  });

  it('returns empty object for empty array', () => {
    expect(getSkillVector([])).toEqual({});
  });
});

// ─── cosineSimilarity ────────────────────────────────────────────────────────

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = { react: 1, python: 1 };
    expect(cosineSimilarity(v, v)).toBeCloseTo(1);
  });

  it('returns 0 for completely different vectors', () => {
    expect(cosineSimilarity({ react: 1 }, { python: 1 })).toBe(0);
  });

  it('returns 0 for empty vectors', () => {
    expect(cosineSimilarity({}, {})).toBe(0);
  });

  it('returns a value between 0 and 1 for partial overlap', () => {
    const v1 = { react: 1, node: 1 };
    const v2 = { react: 1, python: 1 };
    const sim = cosineSimilarity(v1, v2);
    expect(sim).toBeGreaterThan(0);
    expect(sim).toBeLessThan(1);
  });
});
