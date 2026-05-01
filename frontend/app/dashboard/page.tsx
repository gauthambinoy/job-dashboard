'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  CircularProgress,
  Paper,
  LinearProgress,
  Divider,
  Button,
  Avatar,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import LayersIcon from '@mui/icons-material/Layers';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WifiIcon from '@mui/icons-material/Wifi';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
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
  workingnomads: 'WorkingNomads',
  nofluffjobs: 'NoFluffJobs',
  landingjobs: 'LandingJobs',
  hackernews: 'HackerNews',
  devitjobs: 'DevITjobs',
};

const SOURCE_COLORS: Record<string, string> = {
  adzuna: '#3b82f6',
  jsearch: '#0077b5',
  remotive: '#10b981',
  arbeitnow: '#f59e0b',
  jobicy: '#a855f7',
  himalayas: '#06b6d4',
  remoteok: '#f43f5e',
  devitjobs_uk: '#6366f1',
  themuse: '#ec4899',
  reed: '#14b8a6',
  usajobs: '#f97316',
  workingnomads: '#e67e22',
  nofluffjobs: '#2ecc71',
  landingjobs: '#9b59b6',
  hackernews: '#ff6600',
  devitjobs: '#6366f1',
};

function getSourceColor(source: string, index: number): string {
  const fallbacks = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#6366f1', '#14b8a6', '#f97316', '#ec4899', '#84cc16'];
  return SOURCE_COLORS[source] ?? fallbacks[index % fallbacks.length];
}

function matchColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#3b82f6';
  if (score >= 55) return '#f59e0b';
  return '#6b7280';
}

function formatSalary(job: Job): string {
  if (!job.salary_min && !job.salary_max) return '';
  const cur = job.currency ?? 'USD';
  const sym = cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$';
  const fmt = (n: number) => n >= 1000 ? `${sym}${Math.round(n / 1000)}k` : `${sym}${n}`;
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}`;
  if (job.salary_max) return `Up to ${fmt(job.salary_max)}`;
  return `From ${fmt(job.salary_min!)}`;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Yesterday';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

/* ─── Sub-components ─────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        background: `${color}0d`,
        border: `1px solid ${color}28`,
        transition: 'all 0.25s ease',
        '&:hover': { border: `1px solid ${color}55`, background: `${color}18` },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            {label}
          </Typography>
        </Stack>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1, fontSize: value.length > 8 ? '1.4rem' : undefined }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function JobRow({ job, rank }: { job: Job; rank?: number }) {
  const score = job.matchScore ?? 0;
  const color = matchColor(score);
  const salary = formatSalary(job);
  const ago = timeAgo(job.posted_at);

  return (
    <Box
      component={job.url ? 'a' : 'div'}
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: '10px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.2s',
        '&:hover': { background: 'rgba(255,255,255,0.04)' },
        cursor: job.url ? 'pointer' : 'default',
      }}
    >
      {rank !== undefined && (
        <Typography
          sx={{
            width: 20,
            flexShrink: 0,
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            color: 'text.disabled',
            textAlign: 'right',
          }}
        >
          {rank}
        </Typography>
      )}

      {/* Match score badge */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          border: `2px solid ${color}55`,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
          {score}%
        </Typography>
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.25 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ fontSize: '0.875rem' }}
          >
            {job.title}
          </Typography>
          {job.remote && (
            <Chip
              label="Remote"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                bgcolor: 'rgba(16,185,129,0.12)',
                color: '#10b981',
                '& .MuiChip-label': { px: 0.75 },
              }}
            />
          )}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" color="text.secondary" noWrap>
            <BusinessIcon sx={{ fontSize: 11, mr: 0.35, verticalAlign: 'middle', color: 'text.disabled' }} />
            {job.company}
          </Typography>
          {job.location && (
            <Typography variant="caption" color="text.disabled" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
              <LocationOnIcon sx={{ fontSize: 11, mr: 0.25, verticalAlign: 'middle' }} />
              {job.location}
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Right side */}
      <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
        {salary && (
          <Typography variant="caption" fontWeight={600} sx={{ color: '#10b981', fontSize: '0.75rem' }}>
            {salary}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {ago && (
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
              <AccessTimeIcon sx={{ fontSize: 10, mr: 0.25, verticalAlign: 'middle' }} />
              {ago}
            </Typography>
          )}
          {job.url && <OpenInNewIcon sx={{ fontSize: 12, color: 'text.disabled' }} />}
        </Stack>
      </Stack>
    </Box>
  );
}

function QuickActionCard({
  title,
  desc,
  icon,
  color,
  href,
  label,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  label: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        background: 'rgba(255,255,255,0.015)',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.25s ease',
        '&:hover': {
          border: `1px solid ${color}44`,
          background: `${color}08`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardActionArea component={Link} href={href} sx={{ height: '100%', p: 0 }}>
        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: `${color}18`,
              border: `1px solid ${color}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              mb: 2,
              '& .MuiSvgIcon-root': { fontSize: 22 },
            }}
          >
            {icon}
          </Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.75 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, flex: 1 }}>
            {desc}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color }}>
            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
              {label}
            </Typography>
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function SourceHealthRow({
  source,
  count,
  color,
  max,
}: {
  source: string;
  count: number;
  color: string;
  max: number;
}) {
  const label = SOURCE_LABELS[source] ?? source;
  const pct = max > 0 ? (count / max) * 100 : 0;
  const healthy = count > 0;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {healthy ? (
        <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0 }} />
      ) : (
        <ErrorOutlineIcon sx={{ fontSize: 16, color: '#6b7280', flexShrink: 0 }} />
      )}
      <Typography
        variant="body2"
        sx={{
          width: 130,
          flexShrink: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: healthy ? 'text.primary' : 'text.disabled',
          fontSize: '0.82rem',
        }}
        title={label}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>
        <LinearProgress
          variant="determinate"
          value={healthy ? Math.max(pct, 2) : 0}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'rgba(255,255,255,0.04)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 3,
              backgroundColor: healthy ? color : '#374151',
            },
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          minWidth: 36,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: healthy ? 'text.secondary' : 'text.disabled',
          fontWeight: 600,
          fontSize: '0.78rem',
        }}
      >
        {count.toLocaleString()}
      </Typography>
    </Stack>
  );
}

/* ─── Main Page ──────────────────────────────────────── */

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
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
        setJobs(data.results ?? []);
        setTotal(data.total ?? 0);
        setSourceBreakdown(data.sourceBreakdown ?? {});
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs');
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  /* Derived data */
  const recentJobs = useMemo(
    () =>
      [...jobs]
        .sort((a, b) => {
          const da = a.posted_at ? new Date(a.posted_at).getTime() : 0;
          const db = b.posted_at ? new Date(b.posted_at).getTime() : 0;
          return db - da;
        })
        .slice(0, 5),
    [jobs]
  );

  const topMatches = useMemo(
    () => [...jobs].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 5),
    [jobs]
  );

  const sourcesActive = useMemo(
    () => Object.values(sourceBreakdown).filter((v) => v > 0).length,
    [sourceBreakdown]
  );

  const avgMatch = useMemo(() => {
    if (!jobs.length) return 0;
    return Math.round(jobs.reduce((s, j) => s + (j.matchScore ?? 0), 0) / jobs.length);
  }, [jobs]);

  const topMatchScore = useMemo(
    () => (jobs.length ? Math.max(...jobs.map((j) => j.matchScore ?? 0)) : 0),
    [jobs]
  );

  const sourceSorted = useMemo(
    () => Object.entries(sourceBreakdown).sort((a, b) => b[1] - a[1]),
    [sourceBreakdown]
  );

  const maxSource = useMemo(
    () => Math.max(...sourceSorted.map(([, c]) => c), 1),
    [sourceSorted]
  );

  /* All known sources — include ones with 0 count */
  const allSources = useMemo(() => {
    const known = Object.keys(SOURCE_LABELS);
    const active = Object.keys(sourceBreakdown);
    const union = Array.from(new Set([...active, ...known]));
    return union
      .map((k) => ({ key: k, count: sourceBreakdown[k] ?? 0 }))
      .sort((a, b) => b.count - a.count);
  }, [sourceBreakdown]);

  /* ─── Loading ─── */
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={44} sx={{ color: '#6366f1' }} />
          <Typography variant="body2" color="text.secondary">
            Loading your dashboard...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            maxWidth: 420,
            textAlign: 'center',
            background: 'rgba(244,63,94,0.05)',
            border: '1px solid rgba(244,63,94,0.2)',
          }}
        >
          <StorageIcon sx={{ fontSize: 36, color: 'error.main', mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Failed to load dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  /* ─── Page ─── */
  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      <Container maxWidth="xl" sx={{ pt: 5 }}>

        {/* ── Welcome header ── */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 0.75,
                }}
              >
                Welcome back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Here&apos;s what&apos;s happening across{' '}
                <Box component="span" sx={{ color: '#6366f1', fontWeight: 700 }}>
                  {total.toLocaleString()}
                </Box>{' '}
                job listings today
              </Typography>
            </Box>
            <Chip
              icon={<WifiIcon sx={{ fontSize: '14px !important' }} />}
              label={`${sourcesActive} sources active`}
              sx={{
                bgcolor: sourcesActive > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                border: `1px solid ${sourcesActive > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(107,114,128,0.2)'}`,
                color: sourcesActive > 0 ? '#10b981' : '#6b7280',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            />
          </Stack>
        </Box>

        {/* ── Quick stats ── */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Total Jobs"
              value={total.toLocaleString()}
              icon={<WorkIcon fontSize="small" />}
              color="#3b82f6"
              subtitle="across all scrapers"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Sources Active"
              value={`${sourcesActive} / ${Object.keys(SOURCE_LABELS).length}`}
              icon={<LayersIcon fontSize="small" />}
              color="#a855f7"
              subtitle="job boards online"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Top Match"
              value={`${topMatchScore}%`}
              icon={<EmojiEventsIcon fontSize="small" />}
              color="#f59e0b"
              subtitle={`avg ${avgMatch}% across ${jobs.length} jobs`}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Applications"
              value="—"
              icon={<TrackChangesIcon fontSize="small" />}
              color="#10b981"
              subtitle="track via Applications tab"
            />
          </Grid>
        </Grid>

        {/* ── Main body: 2-col layout ── */}
        <Grid container spacing={3}>

          {/* LEFT column */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={3}>

              {/* Recent jobs */}
              <Card
                variant="outlined"
                sx={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '8px',
                          bgcolor: 'rgba(59,130,246,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#3b82f6',
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Recent Jobs
                      </Typography>
                    </Stack>
                    <Button
                      component={Link}
                      href="/search"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        color: '#6366f1',
                        fontSize: '0.8rem',
                        '&:hover': { bgcolor: 'rgba(99,102,241,0.08)' },
                      }}
                    >
                      View all
                    </Button>
                  </Stack>

                  {recentJobs.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
                      No jobs available yet
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {recentJobs.map((job) => (
                        <JobRow key={job.id} job={job} />
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>

              {/* Top Matches */}
              <Card
                variant="outlined"
                sx={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          borderRadius: '8px',
                          bgcolor: 'rgba(245,158,11,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f59e0b',
                        }}
                      >
                        <EmojiEventsIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Top Matches
                      </Typography>
                    </Stack>
                    <Button
                      component={Link}
                      href="/search"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        '&:hover': { bgcolor: 'rgba(245,158,11,0.08)' },
                      }}
                    >
                      See more
                    </Button>
                  </Stack>

                  {topMatches.length === 0 ? (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2 }}>
                      No match data available
                    </Typography>
                  ) : (
                    <Stack spacing={0.5}>
                      {topMatches.map((job, i) => (
                        <JobRow key={job.id} job={job} rank={i + 1} />
                      ))}
                    </Stack>
                  )}

                  {topMatches.length > 0 && (
                    <>
                      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(['#10b981', '#3b82f6', '#f59e0b', '#6b7280'] as const).map((c, i) => {
                          const labels = ['85%+ (Excellent)', '70–84% (Good)', '55–69% (Fair)', '< 55% (Low)'];
                          return (
                            <Stack key={i} direction="row" alignItems="center" spacing={0.5}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c }} />
                              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>
                                {labels[i]}
                              </Typography>
                            </Stack>
                          );
                        })}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <QuickActionCard
                      title="Search Jobs"
                      desc="Browse and filter all scraped listings with smart match scoring"
                      icon={<SearchIcon />}
                      color="#6366f1"
                      href="/search"
                      label="Open search"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <QuickActionCard
                      title="View Analytics"
                      desc="Match distributions, salary bands, source breakdown and more"
                      icon={<BarChartIcon />}
                      color="#06b6d4"
                      href="/analytics"
                      label="Open analytics"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <QuickActionCard
                      title="Track Applications"
                      desc="Mark jobs as saved, applied, interviewing or offered"
                      icon={<TrackChangesIcon />}
                      color="#10b981"
                      href="/applications"
                      label="Open tracker"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT column */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={3}>

              {/* Source health */}
              <Card
                variant="outlined"
                sx={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        bgcolor: 'rgba(99,102,241,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6366f1',
                      }}
                    >
                      <LayersIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Source Health
                    </Typography>
                    <Chip
                      label={`${sourcesActive} online`}
                      size="small"
                      sx={{
                        ml: 'auto !important',
                        height: 20,
                        fontSize: '0.68rem',
                        bgcolor: 'rgba(16,185,129,0.1)',
                        color: '#10b981',
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Stack>

                  <Stack spacing={1.25}>
                    {allSources.map(({ key, count }, i) => (
                      <SourceHealthRow
                        key={key}
                        source={key}
                        count={count}
                        color={getSourceColor(key, i)}
                        max={maxSource}
                      />
                    ))}
                    {allSources.length === 0 && (
                      <Typography variant="body2" color="text.disabled">
                        No scraper data available
                      </Typography>
                    )}
                  </Stack>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />
                  <Stack direction="row" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981' }} />
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                        {sourcesActive} returning data
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <ErrorOutlineIcon sx={{ fontSize: 13, color: '#6b7280' }} />
                      <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.72rem' }}>
                        {allSources.length - sourcesActive} offline
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Match score overview */}
              <Card
                variant="outlined"
                sx={{
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        bgcolor: 'rgba(16,185,129,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981',
                      }}
                    >
                      <TrendingUpIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Match Overview
                    </Typography>
                  </Stack>

                  {/* Avg match ring */}
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={100}
                        size={96}
                        thickness={4}
                        sx={{ color: 'rgba(255,255,255,0.05)', position: 'absolute', top: 0, left: 0 }}
                      />
                      <CircularProgress
                        variant="determinate"
                        value={avgMatch}
                        size={96}
                        thickness={4}
                        sx={{ color: matchColor(avgMatch) }}
                      />
                      <Box
                        sx={{
                          top: 0, left: 0, bottom: 0, right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{ color: matchColor(avgMatch), fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
                        >
                          {avgMatch}%
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.6rem' }}>
                          avg
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      Average match score across {jobs.length.toLocaleString()} jobs
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                  {/* Band breakdown */}
                  {[
                    { label: 'Excellent (85%+)', min: 85, max: 100, color: '#10b981' },
                    { label: 'Good (70–84%)', min: 70, max: 84, color: '#3b82f6' },
                    { label: 'Fair (55–69%)', min: 55, max: 69, color: '#f59e0b' },
                    { label: 'Low (< 55%)', min: 0, max: 54, color: '#6b7280' },
                  ].map((band) => {
                    const count = jobs.filter((j) => (j.matchScore ?? 0) >= band.min && (j.matchScore ?? 0) <= band.max).length;
                    const pct = jobs.length > 0 ? Math.round((count / jobs.length) * 100) : 0;
                    return (
                      <Stack key={band.label} direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: band.color, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontSize: '0.78rem' }}>
                          {band.label}
                        </Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ color: band.color, fontVariantNumeric: 'tabular-nums', fontSize: '0.78rem' }}>
                          {count} ({pct}%)
                        </Typography>
                      </Stack>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Top tags cloud */}
              {jobs.length > 0 && (() => {
                const tagMap: Record<string, number> = {};
                jobs.forEach((j) => (j.tags ?? []).forEach((t) => { tagMap[t] = (tagMap[t] ?? 0) + 1; }));
                const top = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 16);
                if (top.length === 0) return null;
                return (
                  <Card
                    variant="outlined"
                    sx={{
                      background: 'rgba(255,255,255,0.015)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '8px',
                            bgcolor: 'rgba(6,182,212,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#06b6d4',
                          }}
                        >
                          <TrendingUpIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Trending Tags
                        </Typography>
                      </Stack>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {top.map(([tag, count]) => (
                          <Chip
                            key={tag}
                            label={`${tag} · ${count}`}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.72rem',
                              bgcolor: 'rgba(6,182,212,0.08)',
                              color: '#67e8f9',
                              border: '1px solid rgba(6,182,212,0.15)',
                              '& .MuiChip-label': { px: 1 },
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })()}

            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
