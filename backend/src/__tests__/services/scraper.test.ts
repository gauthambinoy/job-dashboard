import { IndeedScraper } from '../../services/scraper';
import axios from 'axios';
import * as fs from 'fs';

jest.mock('axios');
jest.mock('fs');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;

// Helper: access private methods via any cast
function getPrivate(instance: any) {
  return instance as any;
}

describe('IndeedScraper — utility methods', () => {
  let scraper: IndeedScraper;

  beforeEach(() => {
    // Prevent real FS operations on construction
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    scraper = new IndeedScraper();
  });

  // ─── parseSalary ──────────────────────────────────────────────────────────

  describe('parseSalary', () => {
    it('parses a euro range string', () => {
      const result = getPrivate(scraper).parseSalary('€50,000 - €70,000');
      expect(result.min).toBeCloseTo(50000, -2);
      expect(result.max).toBeCloseTo(70000, -2);
    });

    it('parses k-notation salary', () => {
      const result = getPrivate(scraper).parseSalary('€55k - €80k');
      expect(result.min).toBe(55000);
      expect(result.max).toBe(80000);
    });

    it('returns default when salary text is empty', () => {
      const result = getPrivate(scraper).parseSalary('');
      expect(result.min).toBe(45000);
      expect(result.max).toBe(75000);
    });

    it('parses a single salary value into a range', () => {
      const result = getPrivate(scraper).parseSalary('€60,000');
      expect(result.min).toBeGreaterThan(0);
      expect(result.max).toBeGreaterThan(result.min);
    });
  });

  // ─── determineJobType ─────────────────────────────────────────────────────

  describe('determineJobType', () => {
    it('returns Full-time for permanent jobs', () => {
      expect(getPrivate(scraper).determineJobType('this is a permanent role')).toBe('Full-time');
    });

    it('returns Contract for contract jobs', () => {
      expect(getPrivate(scraper).determineJobType('6-month contract position')).toBe('Contract');
    });

    it('returns Part-time for part-time jobs', () => {
      expect(getPrivate(scraper).determineJobType('part-time customer service role')).toBe('Part-time');
    });

    it('defaults to Full-time when type is not specified', () => {
      expect(getPrivate(scraper).determineJobType('great opportunity in dublin')).toBe('Full-time');
    });
  });

  // ─── extractSkillsAndExperience ───────────────────────────────────────────

  describe('extractSkillsAndExperience', () => {
    it('extracts JavaScript as a required skill', () => {
      const { required } = getPrivate(scraper).extractSkillsAndExperience(
        'We need JavaScript and React experience. Must have: React.',
      );
      expect(required.some((s: string) => s.toLowerCase().includes('javascript') || s.toLowerCase().includes('react'))).toBe(true);
    });

    it('identifies a senior role', () => {
      const { level } = getPrivate(scraper).extractSkillsAndExperience(
        'Looking for a senior developer with leadership skills.',
      );
      expect(level).toBe('Senior');
    });

    it('identifies a junior role', () => {
      const { level } = getPrivate(scraper).extractSkillsAndExperience(
        'Graduate position open for junior software developers.',
      );
      expect(level).toBe('Junior');
    });

    it('defaults to Mid-Level when no seniority keyword found', () => {
      const { level } = getPrivate(scraper).extractSkillsAndExperience(
        'Software developer needed for our product team.',
      );
      expect(level).toBe('Mid-Level');
    });

    it('detects degree requirement', () => {
      const { degreeRequired } = getPrivate(scraper).extractSkillsAndExperience(
        'A Bachelor degree in Computer Science is required.',
      );
      expect(degreeRequired).toBe('Bachelor');
    });

    it('returns at most 8 required skills', () => {
      const longDesc = 'JavaScript TypeScript React Vue Angular Node.js Python Java Kotlin Go Rust PHP';
      const { required } = getPrivate(scraper).extractSkillsAndExperience(longDesc);
      expect(required.length).toBeLessThanOrEqual(8);
    });
  });

  // ─── getCachedJobs ────────────────────────────────────────────────────────

  describe('getCachedJobs', () => {
    it('returns empty array when cache file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = getPrivate(scraper).getCachedJobs();
      expect(result).toEqual([]);
    });

    it('returns empty array when cache is expired', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({ timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, jobs: [{ id: 1 }] }),
      );
      const result = getPrivate(scraper).getCachedJobs(false);
      expect(result).toEqual([]);
    });

    it('returns jobs from a fresh cache', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({ timestamp: Date.now(), jobs: [{ id: 99, title: 'Dev' }] }),
      );
      const result = getPrivate(scraper).getCachedJobs();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(99);
    });
  });
});
