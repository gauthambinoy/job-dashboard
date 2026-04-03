'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material';
import Divider from '@mui/material/Divider';
import StorageIcon from '@mui/icons-material/Storage';
import LayersIcon from '@mui/icons-material/Layers';
import PublicIcon from '@mui/icons-material/Public';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WifiIcon from '@mui/icons-material/Wifi';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CodeIcon from '@mui/icons-material/Code';
import FilterListIcon from '@mui/icons-material/FilterList';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkIcon from '@mui/icons-material/Work';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  url?: string;
  source: string;
  type?: string;
  remote?: boolean;
  posted_at?: string;
  tags?: string[];
  matchScore: number;
}

interface ApiResponse {
  results: Job[];
  total: number;
  totalPages: number;
  sourceBreakdown: Record<string, number>;
  countryBreakdown: Record<string, number>;
}

const SOURCE_LABELS: Record<string, string> = {
  adzuna: 'Adzuna',
  jsearch: 'LinkedIn / Indeed',
  remotive: 'Remotive',
  arbeitnow: 'Arbeitnow',
  jobicy: 'Jobicy',
  himalayas: 'Himalayas',
  remoteok: 'RemoteOK',
  devitjobs_uk: 'DevITjobs',
  themuse: 'The Muse',
  reed: 'Reed',
  usajobs: 'USAJOBS',
};

const SOURCE_COLORS = [
  '#3b82f6', '#a855f7', '#10b981', '#f59e0b',
  '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6',
  '#f97316', '#ec4899', '#84cc16',
];

const COUNTRY_COLORS = [
  '#3b82f6', '#a855f7', '#10b981', '#f59e0b',
  '#06b6d4', '#f43f5e',
];

const MATCH_RANGES = [
  { label: '90 - 100', min: 90, max: 100, color: '#10b981' },
  { label: '80 - 89', min: 80, max: 89, color: '#3b82f6' },
  { label: '70 - 79', min: 70, max: 79, color: '#a855f7' },
  { label: '60 - 69', min: 60, max: 69, color: '#f59e0b' },
  { label: '< 60', min: 0, max: 59, color: '#6b7280' },
];

const SALARY_RANGES = [
  { label: '< 50K', min: 0, max: 49999, color: '#6b7280' },
  { label: '50K - 80K', min: 50000, max: 79999, color: '#f59e0b' },
  { label: '80K - 120K', min: 80000, max: 119999, color: '#3b82f6' },
  { label: '120K - 160K', min: 120000, max: 159999, color: '#a855f7' },
  { label: '160K+', min: 160000, max: Infinity, color: '#10b981' },
];

// All known sources for the health panel
const ALL_SOURCES = Object.keys(SOURCE_LABELS);

// ─── Skill extraction ─────────────────────────────────────────────────────────
const SKILL_KEYWORDS: string[] = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP',
  'C++', 'C#', 'Scala', 'Kotlin', 'Swift', 'R',
  'React', 'Angular', 'Vue', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Tailwind',
  'Redux', 'GraphQL', 'REST',
  'Node.js', 'Django', 'Flask', 'Spring', 'Rails', 'FastAPI', 'Express',
  'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Spark',
  'Kafka', 'Airflow', 'dbt', 'Databricks', 'Snowflake', 'Redshift',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Jenkins', 'GitHub Actions', 'Ansible', 'Helm',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
  'Cassandra', 'SQLite',
  'Microservices', 'Linux', 'Git', 'Agile', 'Scrum',
];

const SKILL_MAP: Record<string, string> = {};
SKILL_KEYWORDS.forEach(s => { SKILL_MAP[s.toLowerCase()] = s; });

function extractSkills(job: Job): string[] {
  const found = new Set<string>();
  if (job.tags) {
    for (const tag of job.tags) {
      const norm = tag.toLowerCase().trim();
      if (SKILL_MAP[norm]) found.add(SKILL_MAP[norm]);
    }
  }
  const text = `${job.title} ${job.description || ''}`.toLowerCase();
  for (const [lc, canonical] of Object.entries(SKILL_MAP)) {
    const pattern = new RegExp(`(?<![a-z0-9])${lc.replace(/[.+]/g, '\\$&')}(?![a-z0-9])`, 'i');
    if (pattern.test(text)) found.add(canonical);
  }
  return Array.from(found);
}

// ─── Experience level classification ──────────────────────────────────────────
const EXP_LEVELS = ['Entry-Level', 'Junior', 'Mid-Level', 'Senior'] as const;
const EXP_COLORS: Record<string, string> = {
  'Entry-Level': '#6b7280',
  Junior: '#3b82f6',
  'Mid-Level': '#a855f7',
  Senior: '#10b981',
};

function classifyExperience(title: string, description?: string): string {
  const text = `${title} ${description || ''}`.toLowerCase();
  if (/\b(senior|sr\.?|staff|principal|lead|architect)\b/.test(text)) return 'Senior';
  if (/\b(mid[- ]?level|intermediate|mid[- ]?senior)\b/.test(text)) return 'Mid-Level';
  if (/\b(junior|jr\.?|associate)\b/.test(text)) return 'Junior';
  if (/\b(entry[- ]?level|intern|trainee|graduate|new grad)\b/.test(text)) return 'Entry-Level';
  // Default heuristic: if no keyword found, call it Mid-Level
  return 'Mid-Level';
}

const SKILL_BAR_COLORS = [
  '#3b82f6', '#a855f7', '#10b981', '#f59e0b',
  '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6',
  '#f97316', '#ec4899', '#84cc16', '#8b5cf6',
  '#22d3ee', '#fb923c', '#a3e635',
];

function StatBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary', width: 112, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={label}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={Math.max(pct, 1.5)}
          sx={{
            height: 10,
            borderRadius: 5,
            backgroundColor: 'action.hover',
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              backgroundColor: color,
            },
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 36, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {count}
      </Typography>
    </Stack>
  );
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [countryBreakdown, setCountryBreakdown] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/jobs?limit=200&page=1');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data: ApiResponse = await res.json();
        setJobs(data.results || []);
        setTotal(data.total || 0);
        setSourceBreakdown(data.sourceBreakdown || {});
        setCountryBreakdown(data.countryBreakdown || {});
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data');
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  const avgMatch = useMemo(() => {
    if (!jobs.length) return 0;
    return Math.round(jobs.reduce((s, j) => s + (j.matchScore || 0), 0) / jobs.length);
  }, [jobs]);

  const matchDistribution = useMemo(() => {
    return MATCH_RANGES.map(r => ({
      ...r,
      count: jobs.filter(j => j.matchScore >= r.min && j.matchScore <= r.max).length,
    }));
  }, [jobs]);

  const salaryDistribution = useMemo(() => {
    const withSalary = jobs.filter(j => j.salary_min || j.salary_max);
    const counts = SALARY_RANGES.map(r => ({
      ...r,
      count: withSalary.filter(j => {
        const sal = j.salary_max || j.salary_min || 0;
        return sal >= r.min && sal <= r.max;
      }).length,
    }));
    return { counts, totalWithSalary: withSalary.length };
  }, [jobs]);

  const remoteCount = useMemo(() => jobs.filter(j => j.remote).length, [jobs]);

  const sourceSorted = useMemo(() => {
    return Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]);
  }, [sourceBreakdown]);

  const countrySorted = useMemo(() => {
    return Object.entries(countryBreakdown).sort((a, b) => b[1] - a[1]);
  }, [countryBreakdown]);

  // ─── Data Source Reliability ──────────────────────────────────────────────
  const sourceHealth = useMemo(() => {
    return ALL_SOURCES.map(key => {
      const count = sourceBreakdown[key] || 0;
      let status: 'green' | 'yellow' | 'red';
      if (count > 10) status = 'green';
      else if (count > 0) status = 'yellow';
      else status = 'red';
      return { key, label: SOURCE_LABELS[key] || key, count, status };
    });
  }, [sourceBreakdown]);

  // ─── Skills Gap Analysis ────────────────────────────────────────────────────
  const skillFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const skills = extractSkills(job);
      skills.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    });
    return Object.entries(counts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [jobs]);
  const maxSkillCount = Math.max(...skillFrequency.map(s => s.count), 1);

  // ─── Salary Comparison by Country ──────────────────────────────────────────
  const salaryByCountry = useMemo(() => {
    const groups: Record<string, { mins: number[]; maxes: number[] }> = {};
    jobs.forEach(job => {
      if (!job.salary_min && !job.salary_max) return;
      // Derive country from location (take last segment after comma, or full location)
      const parts = (job.location || '').split(',').map(s => s.trim());
      const country = parts.length > 1 ? parts[parts.length - 1] : parts[0] || 'Unknown';
      if (!groups[country]) groups[country] = { mins: [], maxes: [] };
      if (job.salary_min) groups[country].mins.push(job.salary_min);
      if (job.salary_max) groups[country].maxes.push(job.salary_max);
    });
    // Also try using the countryBreakdown keys if location parsing doesn't align
    return Object.entries(groups)
      .map(([country, { mins, maxes }]) => ({
        country,
        avgMin: mins.length > 0 ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0,
        avgMax: maxes.length > 0 ? Math.round(maxes.reduce((a, b) => a + b, 0) / maxes.length) : 0,
        count: Math.max(mins.length, maxes.length),
      }))
      .filter(c => c.avgMin > 0 || c.avgMax > 0)
      .sort((a, b) => (b.avgMax || b.avgMin) - (a.avgMax || a.avgMin))
      .slice(0, 10);
  }, [jobs]);
  const maxSalaryCountry = Math.max(...salaryByCountry.map(c => c.avgMax || c.avgMin), 1);

  // ─── Application Timeline / Funnel ─────────────────────────────────────────
  const funnelStages = useMemo(() => {
    const totalJobs = jobs.length;
    const withMatch = jobs.filter(j => j.matchScore > 0).length;
    const highMatch = jobs.filter(j => j.matchScore >= 80).length;
    const withSalary = jobs.filter(j => j.salary_min || j.salary_max).length;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyPosted = jobs.filter(j => {
      if (!j.posted_at) return false;
      return new Date(j.posted_at) >= thirtyDaysAgo;
    }).length;
    return [
      { label: 'Total Jobs', count: totalJobs, color: '#3b82f6' },
      { label: 'With Match Score', count: withMatch, color: '#a855f7' },
      { label: 'High Match (80%+)', count: highMatch, color: '#10b981' },
      { label: 'With Salary Info', count: withSalary, color: '#f59e0b' },
      { label: 'Recent (30 days)', count: recentlyPosted, color: '#06b6d4' },
    ];
  }, [jobs]);
  const maxFunnel = Math.max(...funnelStages.map(s => s.count), 1);

  // ─── Experience Level Distribution ─────────────────────────────────────────
  const experienceDistribution = useMemo(() => {
    const counts: Record<string, number> = { 'Entry-Level': 0, Junior: 0, 'Mid-Level': 0, Senior: 0 };
    jobs.forEach(job => {
      const level = classifyExperience(job.title, job.description);
      counts[level] = (counts[level] || 0) + 1;
    });
    const total = jobs.length || 1;
    return EXP_LEVELS.map(level => ({
      level,
      count: counts[level],
      pct: Math.round((counts[level] / total) * 100),
      color: EXP_COLORS[level],
    }));
  }, [jobs]);

  const maxSource = Math.max(...sourceSorted.map(([, c]) => c), 1);
  const maxCountry = Math.max(...countrySorted.map(([, c]) => c), 1);
  const maxMatch = Math.max(...matchDistribution.map(r => r.count), 1);
  const maxSalary = Math.max(...salaryDistribution.counts.map(r => r.count), 1);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">Loading analytics...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <StorageIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
          <Typography fontWeight={600} gutterBottom>Failed to load data</Typography>
          <Typography variant="body2" color="text.secondary">{error}</Typography>
        </Paper>
      </Box>
    );
  }

  const summaryCards = [
    { label: 'Total Jobs', value: total.toLocaleString(), icon: <StorageIcon />, color: '#3b82f6' },
    { label: 'Sources', value: sourceSorted.length.toString(), icon: <LayersIcon />, color: '#a855f7' },
    { label: 'Countries', value: countrySorted.length.toString(), icon: <PublicIcon />, color: '#10b981' },
    { label: 'Avg Match', value: `${avgMatch}%`, icon: <TrendingUpIcon />, color: '#f59e0b' },
    { label: 'Remote Jobs', value: remoteCount.toLocaleString(), icon: <WifiIcon />, color: '#06b6d4' },
    { label: 'With Salary', value: salaryDistribution.totalWithSalary.toLocaleString(), icon: <AttachMoneyIcon />, color: '#f43f5e' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 5 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Statistics and breakdowns across {total.toLocaleString()} scraped job listings
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map((card) => (
            <Grid size={{ xs: 6, sm: 4, lg: 2 }} key={card.label}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                  <Typography variant="h5" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Main grid */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Jobs by Source */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <LayersIcon fontSize="small" sx={{ color: '#a855f7' }} />
                  <Typography variant="subtitle2">Jobs by Source</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {sourceSorted.map(([key, count], i) => (
                    <StatBar
                      key={key}
                      label={SOURCE_LABELS[key] || key}
                      count={count}
                      max={maxSource}
                      color={SOURCE_COLORS[i % SOURCE_COLORS.length]}
                    />
                  ))}
                  {sourceSorted.length === 0 && (
                    <Typography variant="body2" color="text.disabled">No source data available</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Jobs by Country */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <PublicIcon fontSize="small" sx={{ color: '#10b981' }} />
                  <Typography variant="subtitle2">Jobs by Country</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {countrySorted.map(([key, count], i) => (
                    <StatBar
                      key={key}
                      label={key}
                      count={count}
                      max={maxCountry}
                      color={COUNTRY_COLORS[i % COUNTRY_COLORS.length]}
                    />
                  ))}
                  {countrySorted.length === 0 && (
                    <Typography variant="body2" color="text.disabled">No country data available</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Match Score Distribution */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <TrendingUpIcon fontSize="small" sx={{ color: '#f59e0b' }} />
                  <Typography variant="subtitle2">Match Score Distribution</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {matchDistribution.map((r) => (
                    <StatBar key={r.label} label={r.label} count={r.count} max={maxMatch} color={r.color} />
                  ))}
                </Stack>
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="baseline" spacing={1}>
                    <Typography variant="caption" color="text.secondary">Average</Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        fontVariantNumeric: 'tabular-nums',
                        color: avgMatch >= 80 ? '#10b981' : avgMatch >= 60 ? '#f59e0b' : 'text.secondary',
                      }}
                    >
                      {avgMatch}%
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Salary Distribution */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <AttachMoneyIcon fontSize="small" sx={{ color: '#06b6d4' }} />
                  <Typography variant="subtitle2">Salary Distribution</Typography>
                </Stack>
                {salaryDistribution.totalWithSalary > 0 ? (
                  <Stack spacing={1.5}>
                    {salaryDistribution.counts.map((r) => (
                      <StatBar key={r.label} label={r.label} count={r.count} max={maxSalary} color={r.color} />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.disabled">No salary data in current results</Typography>
                )}
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    {salaryDistribution.totalWithSalary} of {jobs.length} jobs include salary info
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── Section 2: Data Pipeline Funnel ────────────────────────────────── */}
        <Divider sx={{ my: 4 }} />
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <TimelineIcon sx={{ color: '#3b82f6' }} />
          <Typography variant="h6" fontWeight={600}>Data Pipeline Funnel</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          How jobs flow from total scraped down to recently posted high-quality listings.
        </Typography>
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent>
            <Stack spacing={1.5}>
              {funnelStages.map((stage, i) => {
                const pct = maxFunnel > 0 ? Math.round((stage.count / maxFunnel) * 100) : 0;
                const conversionFromPrev = i > 0 && funnelStages[i - 1].count > 0
                  ? Math.round((stage.count / funnelStages[i - 1].count) * 100)
                  : null;
                return (
                  <Box key={stage.label}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body2" fontWeight={600}>{stage.label}</Typography>
                        {conversionFromPrev !== null && (
                          <Chip
                            label={`${conversionFromPrev}% of previous`}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: 10,
                              bgcolor: conversionFromPrev >= 50 ? '#d1fae5' : '#fef3c7',
                              color: conversionFromPrev >= 50 ? '#065f46' : '#92400e',
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {stage.count.toLocaleString()}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(pct, 1.5)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': { borderRadius: 6, backgroundColor: stage.color },
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>

        {/* ── Section 3: Skills Gap Analysis & Experience Distribution ─────────── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {/* Skills Gap Analysis */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <CodeIcon fontSize="small" sx={{ color: '#6366f1' }} />
                  <Typography variant="subtitle2">Top In-Demand Skills</Typography>
                  <Chip label="Skills Gap Analysis" size="small" sx={{ ml: 'auto', fontSize: 10 }} />
                </Stack>
                {skillFrequency.length > 0 ? (
                  <Stack spacing={1.2}>
                    {skillFrequency.map(({ skill, count }, i) => (
                      <StatBar
                        key={skill}
                        label={skill}
                        count={count}
                        max={maxSkillCount}
                        color={SKILL_BAR_COLORS[i % SKILL_BAR_COLORS.length]}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    Skills data will appear once jobs are loaded
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Experience Level Distribution */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <WorkIcon fontSize="small" sx={{ color: '#10b981' }} />
                  <Typography variant="subtitle2">Experience Levels</Typography>
                </Stack>
                <Stack spacing={2}>
                  {experienceDistribution.map(({ level, count, pct, color }) => (
                    <Box key={level}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{level}</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" color="text.secondary">{count} jobs</Typography>
                          <Chip
                            label={`${pct}%`}
                            size="small"
                            sx={{ height: 18, fontSize: 10, bgcolor: `${color}20`, color }}
                          />
                        </Stack>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(pct, 1.5)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'action.hover',
                          '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: color },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── Section 4: Salary by Country ────────────────────────────────────── */}
        {salaryByCountry.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AttachMoneyIcon sx={{ color: '#f59e0b' }} />
              <Typography variant="h6" fontWeight={600}>Average Salary by Country</Typography>
            </Stack>
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Stack spacing={2}>
                  {salaryByCountry.map(({ country, avgMin, avgMax, count }, i) => {
                    const maxBar = maxSalaryCountry;
                    const pct = maxBar > 0 ? Math.round((avgMax / maxBar) * 100) : 0;
                    const color = SOURCE_COLORS[i % SOURCE_COLORS.length];
                    return (
                      <Box key={country}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" fontWeight={600}>{country}</Typography>
                            <Typography variant="caption" color="text.secondary">({count} jobs)</Typography>
                          </Stack>
                          <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {avgMin > 0 ? `${(avgMin / 1000).toFixed(0)}K` : '—'} – {avgMax > 0 ? `${(avgMax / 1000).toFixed(0)}K` : '—'}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.max(pct, 1.5)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: color },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Section 5: Data Source Health ───────────────────────────────────── */}
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <FilterListIcon sx={{ color: '#a855f7' }} />
          <Typography variant="h6" fontWeight={600}>Data Source Health</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Status of each job source. Green = 10+ jobs, Yellow = 1–9 jobs, Red = no data returned.
        </Typography>
        <Grid container spacing={1.5} sx={{ mb: 4 }}>
          {sourceHealth.map(({ key, label, count, status }) => {
            const dotColor = status === 'green' ? '#10b981' : status === 'yellow' ? '#f59e0b' : '#ef4444';
            return (
              <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={key}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderColor: dotColor,
                    borderWidth: 1.5,
                    opacity: status === 'red' ? 0.55 : 1,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <FiberManualRecordIcon sx={{ fontSize: 10, color: dotColor }} />
                    <Typography variant="caption" fontWeight={600} noWrap>{label}</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {count.toLocaleString()} jobs
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
