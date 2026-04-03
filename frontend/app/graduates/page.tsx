'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolIcon from '@mui/icons-material/School';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedIcon from '@mui/icons-material/Verified';
import BusinessIcon from '@mui/icons-material/Business';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { COMPANIES, PORTALS } from '../../data/graduate-programmes';

// ── Sector tabs ───────────────────────────────────────────────────────────────

const SECTOR_TABS = [
  'All',
  'Tech',
  'Banking',
  'Professional Services',
  'Pharma / MedTech',
  'Financial Services',
  'Engineering',
  'Food & Agri',
  'Retail',
  'Public Sector',
  'Energy',
  'Law',
  'Aviation',
  'FinTech',
  'Telecoms',
  'Other',
] as const;

const SECTOR_MAP: Record<string, string[]> = {
  Tech: ['Tech'],
  Banking: ['Banking'],
  'Professional Services': ['Professional Services'],
  'Pharma / MedTech': ['Pharma / MedTech'],
  'Financial Services': ['Financial Services'],
  Engineering: ['Engineering'],
  'Food & Agri': ['Food & Agri'],
  Retail: ['Retail'],
  'Public Sector': ['Public Sector'],
  Energy: ['Energy'],
  Law: ['Law'],
  Aviation: ['Aviation'],
  FinTech: ['FinTech'],
  Telecoms: ['Telecoms'],
};

// ── Styles ────────────────────────────────────────────────────────────────────

const glassCard = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.07)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
  },
};

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function GraduatesPage() {
  const [search, setSearch] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  const filteredCompanies = useMemo(() => {
    const activeTab = SECTOR_TABS[tabIndex];
    const q = search.toLowerCase();
    return COMPANIES.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.sector.toLowerCase().includes(q) ||
        c.howToApply.toLowerCase().includes(q);

      if (!matchesSearch) return false;
      if (activeTab === 'All') return true;

      const mapped = SECTOR_MAP[activeTab];
      if (mapped) return mapped.includes(c.sector);

      // "Other" — sectors not in any map
      const allMapped = Object.values(SECTOR_MAP).flat();
      return !allMapped.includes(c.sector);
    });
  }, [search, tabIndex]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712', color: '#f1f5f9', pb: 12 }}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          pt: { xs: 6, md: 10 },
          pb: { xs: 5, md: 7 },
          textAlign: 'center',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(22,163,74,0.12) 0%, transparent 60%)',
        }}
      >
        <Container maxWidth="lg">
          <IrishFlag />

          <Stack direction="row" spacing={1.5} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
            <SchoolIcon sx={{ fontSize: { xs: 28, md: 36 }, color: '#22c55e' }} />
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #86efac 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.6rem', sm: '2.1rem', md: '2.8rem' },
                lineHeight: 1.2,
              }}
            >
              Ireland Graduate & Internship Hub 2026
            </Typography>
          </Stack>

          <Typography
            sx={{
              color: 'rgba(241,245,249,0.55)',
              mb: 4,
              fontSize: { xs: '0.9rem', md: '1.05rem' },
              fontWeight: 400,
            }}
          >
            {COMPANIES.length} companies · Direct application links · Verified for 2026
          </Typography>

          {/* Stats chips */}
          <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ mb: 4, gap: 1 }}>
            <Chip
              icon={<BusinessIcon sx={{ fontSize: 15 }} />}
              label={`${COMPANIES.length} Companies`}
              sx={{ bgcolor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)', fontWeight: 600 }}
            />
            <Chip
              icon={<PublicIcon sx={{ fontSize: 15 }} />}
              label={`${PORTALS.length} Job Portals`}
              sx={{ bgcolor: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', fontWeight: 600 }}
            />
            <Chip
              icon={<VerifiedIcon sx={{ fontSize: 15 }} />}
              label="All Links Verified ✓"
              sx={{ bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontWeight: 600 }}
            />
          </Stack>

          {/* Search */}
          <TextField
            placeholder="Search companies, sectors, or how to apply..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{
              maxWidth: 580,
              mx: 'auto',
              display: 'block',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: '14px',
                color: '#f1f5f9',
                fontSize: '0.95rem',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                '&.Mui-focused fieldset': { borderColor: '#22c55e' },
              },
              '& .MuiInputAdornment-root': { color: 'rgba(241,245,249,0.4)' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg">

        {/* ── Sector tabs ─────────────────────────────────────────────────── */}
        <Paper
          sx={{
            bgcolor: 'rgba(255,255,255,0.03)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.06)',
            mb: 3,
            overflow: 'hidden',
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(241,245,249,0.45)',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.87rem',
                minHeight: 48,
                px: 2,
                '&.Mui-selected': { color: '#22c55e' },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#22c55e',
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            {SECTOR_TABS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Paper>

        {/* Count */}
        <Typography sx={{ mb: 3, color: 'rgba(241,245,249,0.4)', fontSize: '0.85rem' }}>
          Showing <strong style={{ color: '#22c55e' }}>{filteredCompanies.length}</strong> compan
          {filteredCompanies.length === 1 ? 'y' : 'ies'}
          {search && ` matching "${search}"`}
        </Typography>

        {/* ── Company grid ─────────────────────────────────────────────────── */}
        <Grid container spacing={2.5}>
          {filteredCompanies.map((company) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={company.name}>
              <Card sx={{ ...glassCard, height: '100%' }}>
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: 2.5,
                    height: '100%',
                    '&:last-child': { pb: 2.5 },
                  }}
                >
                  {/* Header row */}
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.08))',
                        border: '1px solid rgba(34,197,94,0.2)',
                        flexShrink: 0,
                      }}
                    >
                      {company.logo}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.98rem',
                          lineHeight: 1.3,
                          color: '#f1f5f9',
                          mb: 0.5,
                        }}
                      >
                        {company.name}
                      </Typography>
                      <Chip
                        label={company.sector}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.06)',
                          color: 'rgba(241,245,249,0.6)',
                          fontSize: '0.72rem',
                          height: 22,
                          border: '1px solid rgba(255,255,255,0.08)',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />

                  {/* How to Apply */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#22c55e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        mb: 0.5,
                      }}
                    >
                      How to Apply
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        color: 'rgba(241,245,249,0.55)',
                        lineHeight: 1.55,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {company.howToApply}
                    </Typography>
                  </Box>

                  {/* Apply button */}
                  <Button
                    variant="contained"
                    href={company.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                    fullWidth
                    sx={{
                      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: '10px',
                      py: 0.9,
                      fontSize: '0.88rem',
                      boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
                      },
                    }}
                  >
                    Apply Direct
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredCompanies.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography sx={{ color: 'rgba(241,245,249,0.3)', fontSize: '1.1rem' }}>
              No companies match your search. Try a different term.
            </Typography>
          </Box>
        )}

        {/* ── Job Portals ──────────────────────────────────────────────────── */}
        <Box sx={{ mt: 10 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
            <PublicIcon sx={{ color: '#818cf8', fontSize: 28 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.4rem', md: '1.8rem' },
              }}
            >
              Irish Job Portals
            </Typography>
          </Stack>
          <Typography sx={{ color: 'rgba(241,245,249,0.45)', mb: 4, fontSize: '0.93rem' }}>
            {PORTALS.length} verified job boards to widen your search
          </Typography>

          <Grid container spacing={2}>
            {PORTALS.map((portal) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={portal.name}>
                <Card
                  sx={{
                    ...glassCard,
                    height: '100%',
                    cursor: 'pointer',
                    ...(portal.niche && {
                      border: '1px solid rgba(245,158,11,0.2)',
                      background: 'rgba(245,158,11,0.03)',
                    }),
                  }}
                  onClick={() => window.open(portal.url, '_blank', 'noopener,noreferrer')}
                >
                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.93rem', color: '#f1f5f9' }}>
                        {portal.name}
                      </Typography>
                      {portal.niche && (
                        <Tooltip title="Niche job board — primarily trades & blue-collar roles" arrow>
                          <Chip
                            icon={<InfoOutlinedIcon sx={{ fontSize: 12 }} />}
                            label="Trades"
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245,158,11,0.15)',
                              color: '#f59e0b',
                              border: '1px solid rgba(245,158,11,0.3)',
                              fontSize: '0.7rem',
                              height: 20,
                              ml: 0.5,
                              '& .MuiChip-label': { px: 0.8 },
                            }}
                          />
                        </Tooltip>
                      )}
                    </Stack>
                    <Typography sx={{ color: 'rgba(241,245,249,0.5)', fontSize: '0.8rem', lineHeight: 1.4, mb: 1 }}>
                      {portal.desc}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(241,245,249,0.35)',
                        fontSize: '0.75rem',
                        lineHeight: 1.4,
                        fontStyle: 'italic',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        pt: 1,
                      }}
                    >
                      💡 {portal.tip}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <Box sx={{ mt: 10, textAlign: 'center' }}>
          <IrishFlag width={80} height={4} />
          <Typography sx={{ color: 'rgba(241,245,249,0.25)', fontSize: '0.8rem', mt: 1 }}>
            All links go directly to each company&apos;s official careers page. Last verified April 2026. Good luck! 🍀
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}
