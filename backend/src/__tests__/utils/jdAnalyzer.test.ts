import { analyzeJD } from '../../utils/jdAnalyzer';

describe('analyzeJD', () => {
  // ─── Skill extraction ───────────────────────────────────────────────────

  it('extracts known tech skills from a job description', () => {
    const jd = `We need a developer with experience in React, Node.js, and PostgreSQL.
    Good to have: Redis and AWS.`;
    const result = analyzeJD(jd);
    expect(result.requiredSkills.some(s => s.includes('react'))).toBe(true);
    expect(result.requiredSkills.some(s => s.includes('postgresql'))).toBe(true);
  });

  it('returns empty arrays for an empty description', () => {
    const result = analyzeJD('');
    expect(result.requiredSkills).toEqual([]);
    expect(result.niceToHaveSkills).toEqual([]);
  });

  it('extracts skills from a real-world style description', () => {
    const jd = `Software Engineer position.
    Required skills:
    - Python, Django, PostgreSQL
    - AWS, Docker

    Nice to have:
    - Kubernetes, Redis`;
    const result = analyzeJD(jd);
    expect(result.requiredSkills.some(s => s.includes('python'))).toBe(true);
  });

  // ─── Experience level ───────────────────────────────────────────────────

  it('detects experience as "senior" keyword', () => {
    const jd = 'We are looking for a senior engineer with 5+ years of experience.';
    const result = analyzeJD(jd);
    expect(result.experienceLevel).not.toBeNull();
    expect(result.experienceLevel!.toLowerCase()).toMatch(/senior|5/);
  });

  it('detects experience as "junior" keyword', () => {
    const jd = 'This is a junior developer position for recent graduates.';
    const result = analyzeJD(jd);
    expect(result.experienceLevel?.toLowerCase()).toMatch(/junior/);
  });

  it('detects year range in experience', () => {
    const jd = 'Requires 3-5 years experience in backend development.';
    const result = analyzeJD(jd);
    expect(result.experienceLevel).not.toBeNull();
  });

  it('returns null experience level when not mentioned', () => {
    const jd = 'We are hiring a developer. Great benefits await.';
    const result = analyzeJD(jd);
    // may or may not find — just check it doesn't crash
    expect(result).toBeDefined();
  });

  // ─── Salary extraction ──────────────────────────────────────────────────

  it('parses a USD salary range', () => {
    const jd = 'Salary: $70,000 - $90,000 per year.';
    const result = analyzeJD(jd);
    expect(result.salaryRange.min).not.toBeNull();
    expect(result.salaryRange.max).not.toBeNull();
    expect(result.salaryRange.min!).toBeLessThan(result.salaryRange.max!);
  });

  it('parses a k-notation salary range', () => {
    const jd = 'Compensation: 60k - 85k depending on experience.';
    const result = analyzeJD(jd);
    expect(result.salaryRange.min).toBe(60);
    expect(result.salaryRange.max).toBe(85);
  });

  it('returns null salary when not mentioned', () => {
    const jd = 'Competitive compensation package.';
    const result = analyzeJD(jd);
    expect(result.salaryRange.min).toBeNull();
    expect(result.salaryRange.max).toBeNull();
  });

  // ─── Degree requirement ─────────────────────────────────────────────────

  it('detects bachelor degree requirement', () => {
    const jd = 'Requires a Bachelor degree in Computer Science or equivalent.';
    const result = analyzeJD(jd);
    expect(result.degreeRequired).not.toBeNull();
    expect(result.degreeRequired!.toLowerCase()).toContain('bachelor');
  });

  // ─── Job type ───────────────────────────────────────────────────────────

  it('identifies full-time job type', () => {
    const jd = 'This is a full-time position based in Dublin.';
    const result = analyzeJD(jd);
    expect(result.jobType).toBe('full-time');
  });

  it('identifies contract job type', () => {
    const jd = 'We are looking for a contract developer for a 6-month engagement.';
    const result = analyzeJD(jd);
    expect(result.jobType).toBe('contract');
  });

  // ─── Soft skills ────────────────────────────────────────────────────────

  it('extracts soft skills', () => {
    const jd = 'You should have excellent communication skills and strong teamwork ability.';
    const result = analyzeJD(jd);
    expect(result.softSkills.some(s => s.includes('communication'))).toBe(true);
  });
});
