'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import ArrowForward from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import WorkOutline from '@mui/icons-material/WorkOutline';
import LocationOn from '@mui/icons-material/LocationOn';
import TrendingUp from '@mui/icons-material/TrendingUp';
import BusinessIcon from '@mui/icons-material/Business';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import PublicIcon from '@mui/icons-material/Public';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import CircularProgress from '@mui/material/CircularProgress';
import { COMPANIES } from '../data/graduate-programmes';

// ── Source Health Types ──────────────────────────────────────────────────────

interface SourceHealthItem {
  name: string;
  status: 'ok' | 'error';
  latencyMs: number;
  jobCount?: number;
  error?: string;
}

interface SourceHealthData {
  sources: SourceHealthItem[];
  summary: { total: number; working: number; failed: number };
  checkedAt: string;
}

// ── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const start = Date.now();
          const step = () => {
            const progress = Math.min((Date.now() - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(target * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          step();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <Box component="span" ref={ref} sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {prefix}{count}{suffix}
    </Box>
  );
}

// ── Irish Flag Bar ───────────────────────────────────────────────────────────

const IrishFlag = ({ width = 120, height = 6 }: { width?: number; height?: number }) => (
  <Box
    sx={{
      mx: 'auto',
      mb: 3,
      width,
      height,
      borderRadius: height / 2,
      background: 'linear-gradient(90deg, #169B62 33%, #FFFFFF 33%, #FFFFFF 66%, #FF883E 66%)',
    }}
  />
);

// ── Styles ───────────────────────────────────────────────────────────────────

const greenGradientText = {
  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 40%, #86efac 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const blueGradientText = {
  background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #22d3ee 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const glassCard = {
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
  '&:hover': {
    background: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.15)',
    transform: 'translateY(-4px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
  },
};

// ── Data ─────────────────────────────────────────────────────────────────────

// Sources are now fetched live from /api/source-health

const SECTORS = [
  { name: 'Tech & Software', count: 0, color: '#60a5fa', icon: '💻' },
  { name: 'Banking & Finance', count: 0, color: '#22c55e', icon: '🏦' },
  { name: 'Professional Services', count: 0, color: '#a78bfa', icon: '💼' },
  { name: 'Pharma & MedTech', count: 0, color: '#f472b6', icon: '💊' },
  { name: 'Engineering', count: 0, color: '#fb923c', icon: '🏗️' },
  { name: 'Public Sector', count: 0, color: '#34d399', icon: '🏛️' },
];

const LOCATIONS = [
  { city: 'Dublin', pct: 62 },
  { city: 'Cork', pct: 16 },
  { city: 'Galway', pct: 8 },
  { city: 'Limerick', pct: 7 },
  { city: 'Other', pct: 7 },
];

const TOP_COMPANIES = [
  { name: 'Google', sector: 'Tech', logo: '🔍' },
  { name: 'Microsoft', sector: 'Tech', logo: '🪟' },
  { name: 'Accenture', sector: 'Consulting', logo: '💼' },
  { name: 'Deloitte', sector: 'Big 4', logo: '💼' },
  { name: 'Stripe', sector: 'FinTech', logo: '💳' },
  { name: 'AIB', sector: 'Banking', logo: '🏦' },
  { name: 'ESB', sector: 'Energy', logo: '⚡' },
  { name: 'Pfizer', sector: 'Pharma', logo: '💊' },
  { name: 'Salesforce', sector: 'Tech', logo: '☁️' },
  { name: 'KPMG', sector: 'Big 4', logo: '💼' },
  { name: 'PwC', sector: 'Big 4', logo: '💼' },
  { name: 'Vodafone', sector: 'Telecom', logo: '📶' },
];

const STEPS = [
  { n: '01', title: 'We Scrape 10+ Sources', desc: 'Every 8 hours, we pull graduate roles from LinkedIn, GradIreland, Indeed, IrishJobs, and 6 more portals across Ireland.', icon: <SearchIcon /> , color: '#60a5fa' },
  { n: '02', title: 'Cluster & Categorize', desc: 'AI groups similar roles together — so one tailored CV covers an entire cluster of matching jobs.', icon: <AutoAwesome />, color: '#a78bfa' },
  { n: '03', title: 'Match to Your Profile', desc: 'Your skills, experience, and preferences scored against every role. See your top matches first.', icon: <TrendingUp />, color: '#22c55e' },
  { n: '04', title: 'Apply & Track', desc: 'Direct links to apply. Track saved, applied, interviewing, and offered — all in one place.', icon: <RocketLaunchIcon />, color: '#fb923c' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [liveStats, setLiveStats] = useState<any>(null);
  const [sourceHealth, setSourceHealth] = useState<SourceHealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const companyCount = COMPANIES.length;

  // Count sectors from COMPANIES data
  const sectorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    COMPANIES.forEach((c) => {
      const s = c.sector;
      if (s.includes('Tech') || s === 'FinTech') counts['Tech & Software'] = (counts['Tech & Software'] || 0) + 1;
      else if (s.includes('Banking') || s.includes('Financial')) counts['Banking & Finance'] = (counts['Banking & Finance'] || 0) + 1;
      else if (s.includes('Professional')) counts['Professional Services'] = (counts['Professional Services'] || 0) + 1;
      else if (s.includes('Pharma') || s.includes('MedTech')) counts['Pharma & MedTech'] = (counts['Pharma & MedTech'] || 0) + 1;
      else if (s.includes('Engineering')) counts['Engineering'] = (counts['Engineering'] || 0) + 1;
      else if (s.includes('Public')) counts['Public Sector'] = (counts['Public Sector'] || 0) + 1;
    });
    return counts;
  }, []);

  useEffect(() => {
    setMounted(true);
    // Fetch live stats
    fetch('/api/dashboard')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLiveStats(data); })
      .catch(() => {});
    // Fetch live source health
    setHealthLoading(true);
    fetch('/api/source-health')
      .then(r => r.ok ? r.json() : null)
      .then((data: SourceHealthData | null) => { if (data) setSourceHealth(data); })
      .catch(() => {})
      .finally(() => setHealthLoading(false));
  }, []);

  if (!mounted) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', position: 'relative', overflowX: 'hidden' }}>

      {/* ── Ambient Blobs ─────────────────────────────────────────────── */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '-15%', left: '-5%', width: 700, height: 700, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(140px)' }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(37,99,235,0.06)', filter: 'blur(120px)' }} />
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(168,85,247,0.04)', filter: 'blur(120px)' }} />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 1 — HERO
            ════════════════════════════════════════════════════════════ */}
        <Box
          component="section"
          sx={{
            pt: { xs: 10, md: 14 },
            pb: { xs: 8, md: 12 },
            textAlign: 'center',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(22,163,74,0.1) 0%, transparent 55%)',
          }}
        >
          <Container maxWidth="lg">
            <IrishFlag width={140} height={7} />

            <Chip
              icon={<SchoolIcon sx={{ fontSize: 16, color: '#22c55e !important' }} />}
              label="Ireland Graduate Roles 2026"
              sx={{
                mb: 4,
                bgcolor: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                color: '#22c55e',
                fontWeight: 600,
                fontSize: '0.9rem',
                height: 36,
                '& .MuiChip-label': { px: 1.5 },
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.2rem', lg: '4.2rem' },
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                color: '#fff',
                mb: 3,
              }}
            >
              Every Graduate Role in Ireland.{' '}
              <Box component="span" sx={greenGradientText}>
                One Dashboard.
              </Box>
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.15rem' },
                color: 'rgba(156,163,175,1)',
                maxWidth: 640,
                mx: 'auto',
                mb: 5,
                lineHeight: 1.8,
              }}
            >
              We scrape <strong style={{ color: '#22c55e' }}>10 job portals</strong> across Ireland every 8 hours,
              pulling graduate and entry-level roles from{' '}
              <strong style={{ color: '#f1f5f9' }}>{companyCount}+ companies</strong> — so you never miss an opening.
            </Typography>

            {/* CTA buttons */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 7 }}>
              <Button
                component={Link}
                href="/graduates"
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4.5, py: 1.7,
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  boxShadow: '0 8px 32px rgba(22,163,74,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    boxShadow: '0 12px 40px rgba(22,163,74,0.45)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Browse {companyCount}+ Companies
              </Button>
              <Button
                component={Link}
                href="/search"
                variant="outlined"
                endIcon={<SearchIcon />}
                sx={{
                  px: 4.5, py: 1.7,
                  borderRadius: '14px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.05rem',
                  color: 'rgba(209,213,219,1)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.3)',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Search Jobs
              </Button>
            </Stack>

            {/* Hero stats */}
            <Grid container spacing={3} justifyContent="center" sx={{ maxWidth: 700, mx: 'auto' }}>
              {[
                { target: companyCount, suffix: '+', label: 'Companies', color: '#22c55e' },
                { target: 10, suffix: '', label: 'Job Sources', color: '#60a5fa' },
                { target: 16, suffix: '', label: 'Sectors', color: '#a78bfa' },
                { target: 3, suffix: 'x', label: 'Daily Refresh', color: '#fb923c' },
              ].map((stat) => (
                <Grid size={{ xs: 6, sm: 3 }} key={stat.label}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: { xs: '2rem', sm: '2.4rem' }, fontWeight: 800, color: stat.color }}>
                      <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(107,114,128,1)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', mt: 0.5 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 2 — SECTORS & LOCATIONS
            ════════════════════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={6}>
              {/* Sectors */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, color: '#fff', mb: 1 }}>
                  Graduate Roles by Sector
                </Typography>
                <Typography sx={{ color: 'rgba(107,114,128,1)', mb: 4, fontSize: '0.95rem' }}>
                  {companyCount}+ companies across {SECTORS.length} major industries hiring graduates in 2026
                </Typography>

                <Grid container spacing={2}>
                  {SECTORS.map((s) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={s.name}>
                      <Card sx={{ ...glassCard, cursor: 'pointer' }} component={Link} href="/graduates" style={{ textDecoration: 'none' }}>
                        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                          <Typography sx={{ fontSize: '1.8rem', mb: 1 }}>{s.icon}</Typography>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9', mb: 0.5 }}>
                            {s.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.8rem', color: s.color, fontWeight: 600 }}>
                            {sectorCounts[s.name] || 0} companies
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>

              {/* Locations */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, color: '#fff', mb: 1 }}>
                  Across All of Ireland
                </Typography>
                <Typography sx={{ color: 'rgba(107,114,128,1)', mb: 4, fontSize: '0.95rem' }}>
                  Graduate opportunities from Dublin to Galway
                </Typography>

                <Card sx={{ ...glassCard, '&:hover': { transform: 'none' } }}>
                  <CardContent sx={{ p: 3 }}>
                    {LOCATIONS.map((loc) => (
                      <Box key={loc.city} sx={{ mb: loc.city === 'Other' ? 0 : 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.7 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOn sx={{ fontSize: 16, color: '#22c55e' }} />
                            <Typography sx={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 600 }}>{loc.city}</Typography>
                          </Stack>
                          <Typography sx={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 700 }}>{loc.pct}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={loc.pct}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.06)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, #16a34a 0%, #22c55e ${loc.pct}%)`,
                            },
                          }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 3 — TOP COMPANIES
            ════════════════════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, transparent, rgba(22,163,74,0.03), transparent)' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, color: '#fff', mb: 1 }}>
                Top Companies Hiring Graduates
              </Typography>
              <Typography sx={{ color: 'rgba(107,114,128,1)', fontSize: '0.95rem' }}>
                Ireland&apos;s biggest employers — all with active 2026 graduate programmes
              </Typography>
            </Box>

            <Grid container spacing={2} justifyContent="center">
              {TOP_COMPANIES.map((c) => (
                <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2 }} key={c.name}>
                  <Card
                    sx={{
                      ...glassCard,
                      textAlign: 'center',
                      cursor: 'pointer',
                    }}
                    component={Link}
                    href="/graduates"
                    style={{ textDecoration: 'none' }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography sx={{ fontSize: '2rem', mb: 0.8 }}>{c.logo}</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9', mb: 0.3 }}>
                        {c.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: 'rgba(107,114,128,1)', fontWeight: 500 }}>
                        {c.sector}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                component={Link}
                href="/graduates"
                endIcon={<ArrowForward />}
                sx={{
                  color: '#22c55e',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  '&:hover': { bgcolor: 'rgba(34,197,94,0.08)' },
                }}
              >
                View all {companyCount} companies
              </Button>
            </Box>
          </Container>
        </Box>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 4 — LIVE SOURCE HEALTH DASHBOARD
            ════════════════════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, color: '#fff', mb: 1 }}>
                Live Source Status
              </Typography>
              <Typography sx={{ color: 'rgba(107,114,128,1)', fontSize: '0.95rem', maxWidth: 550, mx: 'auto' }}>
                Real-time health check of every job source — tested on page load
              </Typography>
            </Box>

            {/* Summary banner */}
            {sourceHealth ? (
              <Box
                sx={{
                  mb: 4, p: 2.5, borderRadius: '14px', textAlign: 'center',
                  bgcolor: sourceHealth.summary.working >= sourceHealth.summary.total * 0.6 ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${sourceHealth.summary.working >= sourceHealth.summary.total * 0.6 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                <Stack direction="row" justifyContent="center" spacing={4} flexWrap="wrap" useFlexGap>
                  <Box>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{sourceHealth.summary.working}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Online</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{sourceHealth.summary.failed}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Offline</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>{sourceHealth.summary.total}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(107,114,128,1)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Sources</Typography>
                  </Box>
                </Stack>
                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(107,114,128,0.7)', mt: 1.5 }}>
                  Checked: {new Date(sourceHealth.checkedAt).toLocaleTimeString()}
                </Typography>
              </Box>
            ) : healthLoading ? (
              <Box sx={{ textAlign: 'center', mb: 4, py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#22c55e', mb: 1 }} />
                <Typography sx={{ fontSize: '0.8rem', color: 'rgba(107,114,128,1)' }}>Testing {22} sources live...</Typography>
              </Box>
            ) : null}

            {/* Source grid */}
            {sourceHealth && (
              <Grid container spacing={1.5}>
                {sourceHealth.sources.map((src) => {
                  const isUp = src.status === 'ok';
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={src.name}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: isUp ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                          border: `1px solid ${isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' },
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
                          <Stack direction="row" spacing={0.8} alignItems="center">
                            <CircleIcon sx={{ fontSize: 8, color: isUp ? '#22c55e' : '#ef4444' }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>
                              {src.name}
                            </Typography>
                          </Stack>
                          <Chip
                            label={isUp ? 'LIVE' : 'DOWN'}
                            size="small"
                            sx={{
                              height: 18, fontSize: '0.55rem', fontWeight: 800,
                              bgcolor: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                              color: isUp ? '#22c55e' : '#ef4444',
                              border: `1px solid ${isUp ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                              '& .MuiChip-label': { px: 0.6 },
                            }}
                          />
                        </Stack>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Typography sx={{ fontSize: '0.68rem', color: 'rgba(107,114,128,1)' }}>
                            {src.type === 'api' ? 'API' : src.type === 'scrape' ? 'Scrape' : 'Portal'}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: 'rgba(107,114,128,0.7)' }}>
                            {src.latencyMs}ms
                          </Typography>
                          {src.jobCount !== undefined && (
                            <Typography sx={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 600 }}>
                              {src.jobCount} jobs
                            </Typography>
                          )}
                          {src.error && (
                            <Typography sx={{ fontSize: '0.62rem', color: '#ef4444' }}>
                              {src.error}
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Container>
        </Box>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 5 — HOW IT WORKS
            ════════════════════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, transparent, rgba(37,99,235,0.03), transparent)' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, color: '#fff', mb: 1 }}>
                How It Works
              </Typography>
              <Typography sx={{ color: 'rgba(107,114,128,1)', fontSize: '0.95rem' }}>
                From 10+ sources to your perfect match — fully automated
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {STEPS.map((step) => (
                <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={step.n}>
                  <Card sx={{ ...glassCard, height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${step.color}15`,
                            border: `1px solid ${step.color}30`,
                            color: step.color,
                            '& .MuiSvgIcon-root': { fontSize: 20 },
                          }}
                        >
                          {step.icon}
                        </Box>
                        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: `${step.color}99` }}>
                          STEP {step.n}
                        </Typography>
                      </Stack>
                      <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', mb: 1 }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(156,163,175,1)', lineHeight: 1.65 }}>
                        {step.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 6 — FEATURES / WHY THIS DASHBOARD
            ════════════════════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 7 }}>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2rem' }, fontWeight: 700, color: '#fff', mb: 1 }}>
                Built for Irish Graduates
              </Typography>
              <Typography sx={{ color: 'rgba(107,114,128,1)', fontSize: '0.95rem' }}>
                Not another generic job board. Purpose-built for your graduate job search.
              </Typography>
            </Box>

            <Grid container spacing={2.5}>
              {[
                { icon: <AccessTimeIcon />, title: 'Refreshed 3x Daily', desc: 'New roles scraped every 8 hours. Never miss an opening — even if it\'s posted at midnight.', color: '#22c55e' },
                { icon: <GroupsIcon />, title: `${companyCount}+ Companies Tracked`, desc: 'From Google and Stripe to AIB and Deloitte — every company with an active graduate programme in Ireland.', color: '#60a5fa' },
                { icon: <BarChartIcon />, title: 'Smart Matching', desc: 'Your skills scored against every role. See match percentage, missing skills, and salary insights instantly.', color: '#a78bfa' },
                { icon: <StarIcon />, title: 'All Experience Levels', desc: 'Graduate, intern, entry-level, and junior roles — filtered and categorized so you find exactly what fits.', color: '#fbbf24' },
                { icon: <PublicIcon />, title: 'All of Ireland', desc: 'Dublin, Cork, Galway, Limerick, and remote — with location-based filtering and salary normalization.', color: '#f472b6' },
                { icon: <CheckCircleIcon />, title: 'Direct Apply Links', desc: 'Every listing links directly to the company\'s career page. No middlemen, no redirects, no account walls.', color: '#34d399' },
              ].map((f, i) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={i}>
                  <Card sx={{ ...glassCard, height: '100%' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          width: 44, height: 44, borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: `${f.color}12`,
                          border: `1px solid ${f.color}25`,
                          color: f.color,
                          mb: 2,
                          '& .MuiSvgIcon-root': { fontSize: 22 },
                        }}
                      >
                        {f.icon}
                      </Box>
                      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#fff', mb: 0.8 }}>
                        {f.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(156,163,175,1)', lineHeight: 1.65 }}>
                        {f.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* ════════════════════════════════════════════════════════════════
            SECTION 7 — FINAL CTA
            ════════════════════════════════════════════════════════════ */}
        <Box component="section" sx={{ py: { xs: 10, md: 14 }, textAlign: 'center' }}>
          <Container maxWidth="md">
            <Box
              sx={{
                borderRadius: '20px',
                border: '1px solid rgba(34,197,94,0.15)',
                background: 'linear-gradient(135deg, rgba(22,163,74,0.06) 0%, rgba(37,99,235,0.06) 100%)',
                p: { xs: 5, sm: 7 },
              }}
            >
              <IrishFlag width={100} height={5} />
              <Typography variant="h2" sx={{ fontSize: { xs: '1.6rem', sm: '2.2rem' }, fontWeight: 700, color: '#fff', mb: 2 }}>
                Your graduate career starts here.
              </Typography>
              <Typography sx={{ color: 'rgba(156,163,175,1)', mb: 5, fontSize: '1.05rem', maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}>
                {companyCount}+ companies. 10 job portals. 16 sectors. Every graduate role in Ireland — updated 3 times a day.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  component={Link}
                  href="/graduates"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  sx={{
                    px: 5, py: 1.8,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    boxShadow: '0 8px 32px rgba(22,163,74,0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                      boxShadow: '0 12px 40px rgba(22,163,74,0.45)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Explore Companies
                </Button>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="outlined"
                  endIcon={<BarChartIcon />}
                  sx={{
                    px: 5, py: 1.8,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: 'rgba(209,213,219,1)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.3)',
                      bgcolor: 'rgba(255,255,255,0.05)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  View Dashboard
                </Button>
              </Stack>

              <Typography sx={{ color: 'rgba(75,85,99,1)', fontSize: '0.85rem', mt: 3 }}>
                100% free — no credit card, no sign-up wall
              </Typography>
            </Box>
          </Container>
        </Box>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <Box
          component="footer"
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            py: 5,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <IrishFlag width={60} height={3} />
            <Typography sx={{ fontSize: '0.85rem', color: 'rgba(75,85,99,1)', mt: 1 }}>
              LazyScaper — Every graduate role in Ireland, one dashboard.
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(55,65,81,1)', mt: 1 }}>
              Built by Gautham  ·  Updated 3x daily  ·  {companyCount}+ companies  ·  10 sources
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
