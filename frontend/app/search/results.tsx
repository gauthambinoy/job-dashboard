'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Pagination,
  CircularProgress,
  Stack,
  LinearProgress,
  Button,
  Tooltip,
  Alert,
  Collapse,
  Divider,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LaunchIcon from '@mui/icons-material/Launch';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import WifiIcon from '@mui/icons-material/Wifi';
import PublicIcon from '@mui/icons-material/Public';
import SearchIcon from '@mui/icons-material/Search';
import ScheduleIcon from '@mui/icons-material/Schedule';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import LinkIcon from '@mui/icons-material/Link';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SearchResultsProps {
  filters: {
    titles: string[];
    countries: string[];
    experienceLevel?: string;
    sources?: string[];
  };
  onBack: () => void;
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_min?: number;
  salary_max?: number;
  currency?: string;
  url: string;
  source: string;
  type?: string;
  remote?: boolean;
  posted_at?: string;
  tags?: string[];
  matchScore: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMatchColor(pct: number): string {
  if (pct >= 80) return '#22c55e';
  if (pct >= 60) return '#fbbf24';
  return '#6b7280';
}

function formatSalary(min?: number, max?: number, currency?: string): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : String(n));
  const sym: Record<string, string> = { GBP: '\u00A3', EUR: '\u20AC', AUD: 'A$', CAD: 'C$', INR: '\u20B9', USD: '$' };
  const s = sym[currency ?? ''] ?? '$';
  if (min && max) return `${s}${fmt(min)} \u2013 ${s}${fmt(max)}`;
  if (min) return `${s}${fmt(min)}+`;
  return `Up to ${s}${fmt(max!)}`;
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '';
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const SOURCE_LABELS: Record<string, string> = {
  RemoteOK: 'RemoteOK', Arbeitnow: 'Arbeitnow', Jobicy: 'Jobicy', TheMuse: 'The Muse',
  LinkedIn: 'LinkedIn', GradIreland: 'GradIreland', JobsIe: 'Jobs.ie', Adzuna: 'Adzuna',
  IrishJobs: 'IrishJobs', Glassdoor: 'Glassdoor', Indeed: 'Indeed', Bayt: 'Bayt', Seek: 'Seek',
  sample: 'Sample', backend: 'Database',
  workingnomads: 'WorkingNomads', nofluffjobs: 'NoFluffJobs', landingjobs: 'LandingJobs',
  hackernews: 'HackerNews', devitjobs: 'DevITjobs',
};

const SOURCE_COLORS: Record<string, string> = {
  RemoteOK: '#ec4899', Arbeitnow: '#06b6d4', Jobicy: '#10b981', TheMuse: '#14b8a6',
  LinkedIn: '#0a66c2', GradIreland: '#22c55e', JobsIe: '#ff6b35', Adzuna: '#97C024',
  IrishJobs: '#e44d26', Glassdoor: '#0CAA41', Indeed: '#2164f3', sample: '#6b7280',
  workingnomads: '#e67e22', nofluffjobs: '#2ecc71', landingjobs: '#9b59b6',
  hackernews: '#ff6600', devitjobs: '#6366f1',
};

/* ------------------------------------------------------------------ */
/*  Expandable Job Card                                                */
/* ------------------------------------------------------------------ */

function JobCard({ job }: { job: Job }) {
  const [expanded, setExpanded] = useState(false);
  const salary = formatSalary(job.salary_min, job.salary_max, job.currency);
  const sourceLabel = SOURCE_LABELS[job.source] || job.source;
  const sourceColor = SOURCE_COLORS[job.source] || '#6b7280';
  const postedLabel = timeAgo(job.posted_at);
  const matchColor = getMatchColor(job.matchScore);

  const companySearchUrl = `https://www.google.com/search?q=${encodeURIComponent(job.company + ' careers ireland')}`;
  const applyUrl = job.url && job.url.startsWith('http') ? job.url : companySearchUrl;

  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: 'rgba(255,255,255,0.02)',
        border: '1px solid',
        borderColor: expanded ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)',
        borderRadius: '14px',
        transition: 'all 0.25s',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.04)',
          borderColor: expanded ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.12)',
        },
      }}
    >
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        {/* Collapsed header - always visible */}
        <Box
          onClick={() => setExpanded(!expanded)}
          sx={{ px: 2.5, py: 2, cursor: 'pointer' }}
        >
          {/* Top row: match score + source */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={sourceLabel}
                size="small"
                sx={{
                  fontSize: '0.65rem', height: 20, fontWeight: 700,
                  bgcolor: `${sourceColor}15`, color: sourceColor,
                  border: `1px solid ${sourceColor}35`,
                  '& .MuiChip-label': { px: 0.8 },
                }}
              />
              {job.remote && (
                <Chip
                  icon={<WifiIcon sx={{ fontSize: 11, color: '#22d3ee !important' }} />}
                  label="Remote"
                  size="small"
                  sx={{
                    fontSize: '0.6rem', height: 20, fontWeight: 600,
                    bgcolor: 'rgba(34,211,238,0.1)', color: '#22d3ee',
                    border: '1px solid rgba(34,211,238,0.25)',
                    '& .MuiChip-label': { px: 0.6 },
                  }}
                />
              )}
              {postedLabel && (
                <Typography sx={{ fontSize: '0.7rem', color: postedLabel === 'Today' ? '#a3e635' : 'rgba(107,114,128,1)', fontWeight: postedLabel === 'Today' ? 600 : 400 }}>
                  {postedLabel}
                </Typography>
              )}
            </Stack>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: matchColor }}>{job.matchScore}%</Typography>
              {expanded ? <ExpandLessIcon sx={{ fontSize: 18, color: 'rgba(107,114,128,1)' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: 'rgba(107,114,128,1)' }} />}
            </Stack>
          </Stack>

          {/* Title */}
          <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', mb: 0.5 }}>
            {job.title}
          </Typography>

          {/* Company + Location */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <BusinessIcon sx={{ fontSize: 14, color: '#22c55e' }} />
              <Typography sx={{ fontSize: '0.82rem', color: '#22c55e', fontWeight: 600 }}>{job.company}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <LocationOnIcon sx={{ fontSize: 14, color: 'rgba(107,114,128,1)' }} />
              <Typography sx={{ fontSize: '0.8rem', color: 'rgba(156,163,175,1)' }}>{job.location}</Typography>
            </Stack>
            {salary && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AttachMoneyIcon sx={{ fontSize: 14, color: '#34d399' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>{salary}</Typography>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Expanded details */}
        <Collapse in={expanded}>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ px: 2.5, py: 2 }}>
            {/* Description */}
            {job.description && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5 }}>
                  Description
                </Typography>
                <Typography sx={{
                  fontSize: '0.82rem', color: 'rgba(209,213,219,1)', lineHeight: 1.7,
                  maxHeight: 200, overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
                }}>
                  {job.description}
                </Typography>
              </Box>
            )}

            {/* Skills / Tags */}
            {job.tags && job.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8 }}>
                  Skills & Technologies
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {job.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        fontSize: '0.7rem', height: 24, fontWeight: 600,
                        bgcolor: 'rgba(96,165,250,0.1)', color: '#60a5fa',
                        border: '1px solid rgba(96,165,250,0.2)',
                        '& .MuiChip-label': { px: 0.8 },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {/* Details grid */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {job.type && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Job Type</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#f1f5f9', fontWeight: 600 }}>{job.type}</Typography>
                  </Box>
                </Grid>
              )}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: sourceColor, fontWeight: 600 }}>{sourceLabel}</Typography>
                </Box>
              </Grid>
              {salary && (
                <Grid size={{ xs: 6, sm: 4 }}>
                  <Box sx={{ p: 1.5, borderRadius: '10px', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography sx={{ fontSize: '0.6rem', color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salary</Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>{salary}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>

            {/* Action buttons */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                size="small"
                startIcon={<LaunchIcon sx={{ fontSize: 16 }} />}
                onClick={() => window.open(applyUrl, '_blank')}
                sx={{
                  textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 2.5, py: 0.8,
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 4px 12px rgba(22,163,74,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
                }}
              >
                Apply Now
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TravelExploreIcon sx={{ fontSize: 16 }} />}
                onClick={() => window.open(companySearchUrl, '_blank')}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 2, py: 0.8,
                  borderColor: 'rgba(99,102,241,0.3)', color: '#818cf8',
                  '&:hover': { borderColor: '#6366f1', bgcolor: 'rgba(99,102,241,0.08)' },
                }}
              >
                {job.company} Careers
              </Button>
              {job.url && job.url.startsWith('http') && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<LinkIcon sx={{ fontSize: 16 }} />}
                  onClick={() => window.open(job.url, '_blank')}
                  sx={{
                    textTransform: 'none', fontWeight: 600, borderRadius: '10px', px: 2, py: 0.8,
                    borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(156,163,175,1)',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.25)', color: '#f1f5f9' },
                  }}
                >
                  Original Listing
                </Button>
              )}
            </Stack>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SearchResults({ filters, onBack }: SearchResultsProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sourceBreakdown, setSourceBreakdown] = useState<Record<string, number>>({});
  const [countryBreakdown, setCountryBreakdown] = useState<Record<string, number>>({});

  const fetchJobs = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.titles?.length) params.set('titles', filters.titles.join(','));
        if (filters.countries?.length) params.set('countries', filters.countries.join(','));
        if (filters.experienceLevel) params.set('level', filters.experienceLevel);
        if (filters.sources?.length) params.set('source', filters.sources.join(','));
        params.set('page', String(p));
        params.set('limit', '20');

        const res = await fetch(`/api/jobs?${params}`);
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        const data = await res.json();
        setJobs(data.results ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setSourceBreakdown(data.sourceBreakdown ?? {});
        setCountryBreakdown(data.countryBreakdown ?? {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load jobs.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => { fetchJobs(page); }, [page, fetchJobs]);

  return (
    <Box sx={{ minHeight: '100vh', py: 5, px: 2 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
            sx={{ mb: 2, textTransform: 'none', color: 'rgba(156,163,175,1)', '&:hover': { color: '#f1f5f9' } }}
          >
            Back to Filters
          </Button>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="white">
                {loading ? 'Searching...' : `${total.toLocaleString()} Jobs Found`}
              </Typography>
              {!loading && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  From {Object.keys(sourceBreakdown).length} sources · Click any card to expand
                </Typography>
              )}
            </Box>

            {!loading && Object.keys(sourceBreakdown).length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {Object.entries(sourceBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([src, count]) => (
                    <Chip
                      key={src}
                      label={`${SOURCE_LABELS[src] || src}: ${count}`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem', height: 22, fontWeight: 600,
                        bgcolor: `${SOURCE_COLORS[src] || '#6b7280'}12`,
                        color: SOURCE_COLORS[src] || '#6b7280',
                        border: `1px solid ${SOURCE_COLORS[src] || '#6b7280'}30`,
                      }}
                    />
                  ))}
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Country breakdown */}
        {!loading && Object.keys(countryBreakdown).length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
            {Object.entries(countryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .filter(([c]) => c !== 'Other')
              .slice(0, 8)
              .map(([country, count]) => (
                <Stack key={country} direction="row" spacing={0.5} alignItems="center">
                  <PublicIcon sx={{ fontSize: 14, color: 'rgba(107,114,128,1)' }} />
                  <Typography variant="caption" color="text.secondary">{country}:</Typography>
                  <Typography variant="caption" fontWeight={700} color="#f1f5f9">{count}</Typography>
                </Stack>
              ))}
          </Stack>
        )}

        {/* Error */}
        {!loading && error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}
            action={<Button color="inherit" size="small" onClick={() => fetchJobs(page)}>Retry</Button>}
          >
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
            <CircularProgress size={40} sx={{ mb: 2, color: '#22c55e' }} />
            <Typography color="text.secondary">Searching real jobs from all sources...</Typography>
          </Box>
        )}

        {/* Job Cards */}
        {!loading && jobs.length > 0 && (
          <Stack spacing={1.5}>
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </Stack>
        )}

        {/* Empty */}
        {!loading && jobs.length === 0 && !error && (
          <Card elevation={0} sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', py: 8, textAlign: 'center' }}>
            <CardContent>
              <Typography color="text.secondary" sx={{ mb: 1 }}>No jobs found matching your criteria.</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, opacity: 0.6 }}>Try broadening your filters or adding more countries.</Typography>
              <Button variant="outlined" onClick={onBack} sx={{ textTransform: 'none', borderRadius: '10px', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(156,163,175,1)' }}>
                Adjust Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Page {page} of {totalPages} ({total.toLocaleString()} total)
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: 'rgba(156,163,175,1)', borderColor: 'rgba(255,255,255,0.08)',
                  '&.Mui-selected': { bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e' },
                },
              }}
            />
          </Stack>
        )}
      </Container>
    </Box>
  );
}
