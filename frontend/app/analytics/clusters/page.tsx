'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import WorkIcon from '@mui/icons-material/Work';
import StarIcon from '@mui/icons-material/Star';

// ─── Types ───────────────────────────────────────────────────────────────────

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

interface Cluster {
  domain: string;
  jobs: Job[];
  count: number;
  topSkills: string[];
  topCompanies: string[];
  avgMatch: number;
  avgSalaryMin: number | null;
  avgSalaryMax: number | null;
  topLocations: string[];
  remoteCount: number;
  highMatchCount: number;
}

// ─── Domain classification ────────────────────────────────────────────────────

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  'Full Stack': ['full stack', 'fullstack', 'full-stack'],
  Backend: [
    'backend', 'back-end', 'back end', 'server-side', 'api engineer',
    'golang', 'go developer', 'java developer', 'python developer',
    'node.js', 'nodejs', 'ruby on rails', 'django', 'flask', 'spring boot',
    'express', 'rails developer', 'php developer', 'scala',
  ],
  Frontend: [
    'frontend', 'front-end', 'front end', 'react developer', 'angular developer',
    'vue developer', 'ui engineer', 'ui developer', 'css engineer',
    'javascript developer', 'typescript developer', 'next.js developer',
  ],
  Data: [
    'data engineer', 'data scientist', 'data analyst', 'machine learning',
    'ml engineer', 'ai engineer', 'analytics engineer', 'etl developer',
    'big data', 'spark engineer', 'bi developer', 'nlp engineer',
    'deep learning', 'llm engineer',
  ],
  'DevOps / Infra': [
    'devops', 'sre', 'site reliability', 'infrastructure engineer',
    'platform engineer', 'cloud engineer', 'kubernetes', 'terraform',
    'ci/cd', 'devsecops', 'systems engineer', 'network engineer',
  ],
  Mobile: [
    'ios developer', 'android developer', 'mobile developer', 'react native',
    'flutter developer', 'swift developer', 'kotlin developer',
  ],
  QA: [
    'qa engineer', 'quality assurance', 'test engineer', 'sdet',
    'automation engineer', 'testing engineer', 'qa analyst',
  ],
  Security: [
    'security engineer', 'cybersecurity', 'appsec', 'penetration tester',
    'security analyst', 'cloud security', 'devsecops',
  ],
};

const DOMAIN_COLORS: Record<string, string> = {
  Backend: '#3b82f6',
  Frontend: '#a855f7',
  'Full Stack': '#10b981',
  Data: '#f59e0b',
  'DevOps / Infra': '#06b6d4',
  Mobile: '#f97316',
  QA: '#f43f5e',
  Security: '#6366f1',
  Other: '#6b7280',
};

function classifyJob(title: string): string {
  const lower = title.toLowerCase();
  // Check Full Stack first — it is more specific
  for (const kw of DOMAIN_KEYWORDS['Full Stack']) {
    if (lower.includes(kw)) return 'Full Stack';
  }
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (domain === 'Full Stack') continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return domain;
    }
  }
  return 'Other';
}

// ─── Skill extraction ─────────────────────────────────────────────────────────

const SKILL_KEYWORDS: string[] = [
  // Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Golang', 'Rust', 'Ruby', 'PHP',
  'C++', 'C#', 'Scala', 'Kotlin', 'Swift', 'R',
  // Frontend
  'React', 'Angular', 'Vue', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Tailwind',
  'Redux', 'GraphQL', 'REST',
  // Backend
  'Node.js', 'Django', 'Flask', 'Spring', 'Rails', 'FastAPI', 'Express',
  // Data / ML
  'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Spark',
  'Kafka', 'Airflow', 'dbt', 'Databricks', 'Snowflake', 'Redshift',
  // Cloud / Infra
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
  'Jenkins', 'GitHub Actions', 'Ansible', 'Helm',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
  'Cassandra', 'SQLite',
  // Other
  'Microservices', 'Linux', 'Git', 'Agile', 'Scrum',
];

const SKILL_MAP: Record<string, string> = {};
SKILL_KEYWORDS.forEach(s => { SKILL_MAP[s.toLowerCase()] = s; });

function extractSkills(job: Job): string[] {
  const found = new Set<string>();

  // From tags field (some APIs return structured tags)
  if (job.tags) {
    for (const tag of job.tags) {
      const norm = tag.toLowerCase().trim();
      if (SKILL_MAP[norm]) found.add(SKILL_MAP[norm]);
    }
  }

  // From title + description text matching
  const text = `${job.title} ${job.description || ''}`.toLowerCase();
  for (const [lc, canonical] of Object.entries(SKILL_MAP)) {
    // Use word boundary approximation: surrounded by non-alphanumeric chars or string edges
    const pattern = new RegExp(`(?<![a-z0-9])${lc.replace(/[.+]/g, '\\$&')}(?![a-z0-9])`, 'i');
    if (pattern.test(text)) found.add(canonical);
  }

  return Array.from(found);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function topN(arr: string[], n: number): string[] {
  const counts: Record<string, number> = {};
  arr.forEach(v => { if (v) counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
}

function formatSalary(val: number | null): string {
  if (val === null) return '--';
  if (val >= 1000) return `$${Math.round(val / 1000)}K`;
  return `$${val}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBar({
  label,
  count,
  max,
  color,
  suffix = '',
}: {
  label: string;
  count: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          width: 130,
          flexShrink: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
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
            '& .MuiLinearProgress-bar': { borderRadius: 5, backgroundColor: color },
          }}
        />
      </Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, minWidth: 42, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
      >
        {count}{suffix}
      </Typography>
    </Stack>
  );
}

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? '#10b981' :
    score >= 65 ? '#f59e0b' :
    score >= 50 ? '#3b82f6' :
    '#6b7280';
  return (
    <Typography variant="body2" fontWeight={700} sx={{ color, fontVariantNumeric: 'tabular-nums' }}>
      {score}%
    </Typography>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClustersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/jobs?limit=200&page=1');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data: ApiResponse = await res.json();
        setJobs(data.results || []);
        setTotal(data.total || 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  // ─── Cluster computation ───────────────────────────────────────────────────

  const clusters = useMemo<Cluster[]>(() => {
    const groups: Record<string, Job[]> = {};
    jobs.forEach(job => {
      const domain = classifyJob(job.title);
      if (!groups[domain]) groups[domain] = [];
      groups[domain].push(job);
    });

    return Object.entries(groups)
      .map(([domain, domainJobs]) => {
        const withSalary = domainJobs.filter(j => j.salary_min || j.salary_max);
        const avgSalaryMin =
          withSalary.length > 0
            ? Math.round(withSalary.reduce((s, j) => s + (j.salary_min || 0), 0) / withSalary.length)
            : null;
        const avgSalaryMax =
          withSalary.length > 0
            ? Math.round(
                withSalary.reduce((s, j) => s + (j.salary_max || j.salary_min || 0), 0) / withSalary.length,
              )
            : null;

        const allSkills = domainJobs.flatMap(j => extractSkills(j));

        return {
          domain,
          jobs: domainJobs,
          count: domainJobs.length,
          topSkills: topN(allSkills, 8),
          topCompanies: topN(domainJobs.map(j => j.company), 5),
          avgSalaryMin,
          avgSalaryMax,
          topLocations: topN(domainJobs.map(j => j.location), 3),
          avgMatch:
            domainJobs.length > 0
              ? Math.round(
                  domainJobs.reduce((s, j) => s + (j.matchScore || 0), 0) / domainJobs.length,
                )
              : 0,
          remoteCount: domainJobs.filter(j => j.remote).length,
          highMatchCount: domainJobs.filter(j => (j.matchScore || 0) >= 80).length,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [jobs]);

  // ─── Global skill frequency ───────────────────────────────────────────────

  const skillFrequency = useMemo<{ skill: string; count: number }[]>(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const skills = extractSkills(job);
      skills.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
    });
    return Object.entries(counts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [jobs]);

  const maxSkillCount = Math.max(...skillFrequency.map(s => s.count), 1);
  const maxClusterCount = Math.max(...clusters.map(c => c.count), 1);

  // ─── Loading / Error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">
            Loading cluster data...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <HubIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
          <Typography fontWeight={600} gutterBottom>
            Failed to load data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // ─── Summary stat cards ────────────────────────────────────────────────────

  const totalSkillsFound = skillFrequency.length;
  const topCluster = clusters[0];
  const avgMatchAll =
    jobs.length > 0
      ? Math.round(jobs.reduce((s, j) => s + (j.matchScore || 0), 0) / jobs.length)
      : 0;
  const highMatchTotal = jobs.filter(j => (j.matchScore || 0) >= 80).length;

  const summaryCards = [
    { label: 'Total Jobs', value: total.toLocaleString(), icon: <WorkIcon />, color: '#3b82f6' },
    { label: 'Clusters', value: clusters.length.toString(), icon: <HubIcon />, color: '#a855f7' },
    { label: 'Unique Skills', value: totalSkillsFound.toString(), icon: <CodeIcon />, color: '#10b981' },
    { label: 'Avg Match', value: `${avgMatchAll}%`, icon: <TrendingUpIcon />, color: '#f59e0b' },
    { label: 'High Match (≥80%)', value: highMatchTotal.toLocaleString(), icon: <StarIcon />, color: '#06b6d4' },
    {
      label: 'Top Cluster',
      value: topCluster ? topCluster.domain : '--',
      icon: <BarChartIcon />,
      color: topCluster ? (DOMAIN_COLORS[topCluster.domain] || '#6b7280') : '#6b7280',
    },
  ];

  const SKILL_COLORS = [
    '#3b82f6', '#a855f7', '#10b981', '#f59e0b',
    '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6',
    '#f97316', '#ec4899', '#84cc16', '#8b5cf6',
    '#22d3ee', '#fb923c', '#a3e635', '#34d399',
    '#60a5fa', '#c084fc', '#f472b6', '#facc15',
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 5 }}>
        {/* ── Header ── */}
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Cluster Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Jobs grouped by domain and skill similarity across {jobs.length.toLocaleString()} listings
          {total > jobs.length && ` (of ${total.toLocaleString()} total)`}
        </Typography>

        {/* ── Summary Cards ── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {summaryCards.map(card => (
            <Grid size={{ xs: 6, sm: 4, lg: 2 }} key={card.label}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ color: card.color, mb: 1 }}>{card.icon}</Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{ fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {card.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* ── Cluster Cards + Skill Frequency side by side ── */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* Cluster Cards */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Grid container spacing={2}>
              {clusters.map(cluster => {
                const color = DOMAIN_COLORS[cluster.domain] || '#6b7280';
                const barPct = (cluster.count / maxClusterCount) * 100;

                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={cluster.domain}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        {/* Header row */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1.5 }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="subtitle1" fontWeight={700}>
                              {cluster.domain}
                            </Typography>
                          </Stack>
                          <Chip
                            label={`${cluster.count} jobs`}
                            size="small"
                            sx={{ fontWeight: 600, backgroundColor: `${color}18`, color }}
                          />
                        </Stack>

                        {/* Volume bar */}
                        <LinearProgress
                          variant="determinate"
                          value={Math.max(barPct, 1.5)}
                          sx={{
                            height: 5,
                            borderRadius: 3,
                            mb: 2,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': { borderRadius: 3, backgroundColor: color },
                          }}
                        />

                        {/* Stats row */}
                        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Avg Match
                            </Typography>
                            <MatchBadge score={cluster.avgMatch} />
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              High Match
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                              {cluster.highMatchCount}
                            </Typography>
                          </Box>
                          {cluster.remoteCount > 0 && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Remote
                              </Typography>
                              <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {cluster.remoteCount}
                              </Typography>
                            </Box>
                          )}
                          {cluster.avgSalaryMin !== null && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Avg Salary
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                              >
                                {formatSalary(cluster.avgSalaryMin)}–{formatSalary(cluster.avgSalaryMax)}
                              </Typography>
                            </Box>
                          )}
                        </Stack>

                        {/* Top Skills */}
                        {cluster.topSkills.length > 0 && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 0.75, display: 'block' }}
                            >
                              Top Skills
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.5}>
                              {cluster.topSkills.map(skill => (
                                <Chip
                                  key={skill}
                                  label={skill}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${color}14`,
                                    color,
                                    borderColor: `${color}40`,
                                    border: '1px solid',
                                    fontSize: '0.7rem',
                                    height: 20,
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Top Companies */}
                        {cluster.topCompanies.length > 0 && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 0.75, display: 'block' }}
                            >
                              Top Companies
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.5}>
                              {cluster.topCompanies.map(c => (
                                <Chip key={c} label={c} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Top Locations */}
                        {cluster.topLocations.length > 0 && (
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mb: 0.75, display: 'block' }}
                            >
                              Top Locations
                            </Typography>
                            <Stack direction="row" flexWrap="wrap" gap={0.5}>
                              {cluster.topLocations.map(loc => (
                                <Chip key={loc} label={loc} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}

              {clusters.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No job data available for clustering.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>

          {/* Skill Frequency Chart */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <CodeIcon fontSize="small" sx={{ color: '#10b981' }} />
                  <Typography variant="subtitle2">Skill Frequency</Typography>
                </Stack>
                {skillFrequency.length > 0 ? (
                  <Stack spacing={1.2}>
                    {skillFrequency.map(({ skill, count }, i) => (
                      <StatBar
                        key={skill}
                        label={skill}
                        count={count}
                        max={maxSkillCount}
                        color={SKILL_COLORS[i % SKILL_COLORS.length]}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    No skill data found in job descriptions.
                  </Typography>
                )}
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    Extracted from titles, descriptions, and tags
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ── Cluster Performance Table ── */}
        <Card variant="outlined" sx={{ mt: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <BarChartIcon fontSize="small" sx={{ color: '#f59e0b' }} />
              <Typography variant="subtitle2">Cluster Performance Summary</Typography>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}>
                      Domain
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}
                    >
                      Jobs
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}
                    >
                      Avg Match
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}
                    >
                      High Match (≥80%)
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}
                    >
                      Remote
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}
                    >
                      With Salary
                    </TableCell>
                    <TableCell
                      sx={{ color: 'text.secondary', fontWeight: 600, borderColor: 'divider' }}
                    >
                      Top Skill
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clusters.map(cluster => {
                    const color = DOMAIN_COLORS[cluster.domain] || '#6b7280';
                    const withSalaryCount = cluster.jobs.filter(j => j.salary_min || j.salary_max).length;
                    const highMatchPct =
                      cluster.count > 0
                        ? Math.round((cluster.highMatchCount / cluster.count) * 100)
                        : 0;

                    return (
                      <TableRow
                        key={cluster.domain}
                        sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
                      >
                        <TableCell sx={{ borderColor: 'divider' }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {cluster.domain}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'divider' }}>
                          <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {cluster.count}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'divider' }}>
                          <MatchBadge score={cluster.avgMatch} />
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'divider' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontVariantNumeric: 'tabular-nums',
                              color: highMatchPct >= 30 ? '#10b981' : highMatchPct >= 15 ? '#f59e0b' : 'text.secondary',
                            }}
                          >
                            {cluster.highMatchCount}{' '}
                            <Typography component="span" variant="caption" color="text.secondary">
                              ({highMatchPct}%)
                            </Typography>
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'divider' }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontVariantNumeric: 'tabular-nums',
                              color: cluster.remoteCount > 0 ? '#06b6d4' : 'text.secondary',
                            }}
                          >
                            {cluster.remoteCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderColor: 'divider' }}>
                          <Typography
                            variant="body2"
                            sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary' }}
                          >
                            {withSalaryCount}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderColor: 'divider' }}>
                          {cluster.topSkills[0] ? (
                            <Chip
                              label={cluster.topSkills[0]}
                              size="small"
                              sx={{
                                backgroundColor: `${color}14`,
                                color,
                                borderColor: `${color}40`,
                                border: '1px solid',
                                fontSize: '0.7rem',
                                height: 20,
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.disabled">
                              --
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
