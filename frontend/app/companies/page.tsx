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
  CircularProgress,
  Paper,
  TextField,
  Button,
  Divider,
  InputAdornment,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  url?: string;
  source: string;
  posted_at?: string;
  tags?: string[];
  matchScore: number;
}

interface ApiResponse {
  results: Job[];
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Sector definitions & colours
// ---------------------------------------------------------------------------

type Sector =
  | 'Banking'
  | 'Consulting'
  | 'Technology'
  | 'Pharma'
  | 'Public Sector'
  | 'Retail'
  | 'Insurance'
  | 'Accountancy'
  | 'Legal'
  | 'Energy'
  | 'Media'
  | 'Food & Beverage'
  | 'Healthcare'
  | 'Aviation'
  | 'Engineering'
  | 'Other';

const SECTOR_COLORS: Record<Sector, string> = {
  Banking: '#3b82f6',
  Consulting: '#a855f7',
  Technology: '#10b981',
  Pharma: '#06b6d4',
  'Public Sector': '#f59e0b',
  Retail: '#f43f5e',
  Insurance: '#6366f1',
  Accountancy: '#14b8a6',
  Legal: '#8b5cf6',
  Energy: '#f97316',
  Media: '#ec4899',
  'Food & Beverage': '#84cc16',
  Healthcare: '#22d3ee',
  Aviation: '#60a5fa',
  Engineering: '#fb923c',
  Other: '#6b7280',
};

const ALL_SECTORS = Object.keys(SECTOR_COLORS) as Sector[];

// ---------------------------------------------------------------------------
// Hardcoded Irish companies list (50+)
// ---------------------------------------------------------------------------

interface CompanyInfo {
  name: string;
  sector: Sector;
  careers_url: string;
  grad_programme_url: string;
}

const IRISH_COMPANIES: CompanyInfo[] = [
  // Banking
  { name: 'Bank of Ireland', sector: 'Banking', careers_url: 'https://careers.bankofireland.com', grad_programme_url: 'https://careers.bankofireland.com/early-careers' },
  { name: 'AIB', sector: 'Banking', careers_url: 'https://aib.ie/careers', grad_programme_url: 'https://aib.ie/careers/graduate-programme' },
  { name: 'Ulster Bank', sector: 'Banking', careers_url: 'https://jobs.ulsterbank.ie', grad_programme_url: 'https://jobs.ulsterbank.ie/graduates' },
  { name: 'Permanent TSB', sector: 'Banking', careers_url: 'https://permanenttsb.ie/careers', grad_programme_url: 'https://permanenttsb.ie/careers/graduates' },
  { name: 'KBC Bank Ireland', sector: 'Banking', careers_url: 'https://kbc.ie/careers', grad_programme_url: 'https://kbc.ie/careers/graduates' },

  // Consulting
  { name: 'Accenture Ireland', sector: 'Consulting', careers_url: 'https://accenture.com/ie-en/careers', grad_programme_url: 'https://accenture.com/ie-en/careers/local/ireland-graduates' },
  { name: 'Deloitte Ireland', sector: 'Consulting', careers_url: 'https://deloitte.com/ie/en/careers.html', grad_programme_url: 'https://jobs2.deloitte.com/ie/en/graduates' },
  { name: 'PwC Ireland', sector: 'Consulting', careers_url: 'https://pwc.ie/careers', grad_programme_url: 'https://pwc.ie/careers/graduates' },
  { name: 'EY Ireland', sector: 'Consulting', careers_url: 'https://ey.com/ie/en/careers', grad_programme_url: 'https://ey.com/ie/en/careers/students' },
  { name: 'KPMG Ireland', sector: 'Consulting', careers_url: 'https://kpmg.com/ie/en/home/careers.html', grad_programme_url: 'https://kpmg.com/ie/en/home/careers/graduates.html' },
  { name: 'Grant Thornton Ireland', sector: 'Consulting', careers_url: 'https://grantthornton.ie/careers', grad_programme_url: 'https://grantthornton.ie/careers/graduates' },
  { name: 'McKinsey Ireland', sector: 'Consulting', careers_url: 'https://mckinsey.com/careers', grad_programme_url: 'https://mckinsey.com/careers/students' },
  { name: 'Boston Consulting Group Dublin', sector: 'Consulting', careers_url: 'https://bcg.com/careers', grad_programme_url: 'https://bcg.com/careers/students' },

  // Technology
  { name: 'Google Ireland', sector: 'Technology', careers_url: 'https://careers.google.com', grad_programme_url: 'https://careers.google.com/students' },
  { name: 'Meta Ireland', sector: 'Technology', careers_url: 'https://metacareers.com', grad_programme_url: 'https://metacareers.com/students' },
  { name: 'Microsoft Ireland', sector: 'Technology', careers_url: 'https://careers.microsoft.com', grad_programme_url: 'https://careers.microsoft.com/students' },
  { name: 'Amazon Dublin', sector: 'Technology', careers_url: 'https://amazon.jobs/en/locations/dublin', grad_programme_url: 'https://amazon.jobs/en/business_categories/university-recruiting' },
  { name: 'LinkedIn Dublin', sector: 'Technology', careers_url: 'https://careers.linkedin.com', grad_programme_url: 'https://careers.linkedin.com/students' },
  { name: 'Salesforce Dublin', sector: 'Technology', careers_url: 'https://salesforce.com/company/careers', grad_programme_url: 'https://salesforce.com/company/careers/university' },
  { name: 'HubSpot Dublin', sector: 'Technology', careers_url: 'https://hubspot.com/jobs', grad_programme_url: 'https://hubspot.com/jobs/early-careers' },
  { name: 'Stripe Dublin', sector: 'Technology', careers_url: 'https://stripe.com/jobs', grad_programme_url: 'https://stripe.com/jobs/university' },
  { name: 'Workday Dublin', sector: 'Technology', careers_url: 'https://workday.com/en-us/company/careers.html', grad_programme_url: 'https://workday.com/en-us/company/careers/early-careers.html' },
  { name: 'Oracle Ireland', sector: 'Technology', careers_url: 'https://oracle.com/careers', grad_programme_url: 'https://oracle.com/corporate/careers/students-grads' },
  { name: 'SAP Ireland', sector: 'Technology', careers_url: 'https://jobs.sap.com', grad_programme_url: 'https://jobs.sap.com/go/students' },
  { name: 'IBM Ireland', sector: 'Technology', careers_url: 'https://ibm.com/employment', grad_programme_url: 'https://ibm.com/employment/entrylevel' },
  { name: 'Dell Technologies Ireland', sector: 'Technology', careers_url: 'https://dell.com/en-us/dt/careers', grad_programme_url: 'https://dell.com/en-us/dt/careers/students.htm' },
  { name: 'Intercom', sector: 'Technology', careers_url: 'https://intercom.com/careers', grad_programme_url: 'https://intercom.com/careers#open-roles' },
  { name: 'Zendesk Dublin', sector: 'Technology', careers_url: 'https://jobs.zendesk.com', grad_programme_url: 'https://jobs.zendesk.com/early-careers' },

  // Pharma / Life Sciences
  { name: 'Pfizer Ireland', sector: 'Pharma', careers_url: 'https://pfizer.com/careers', grad_programme_url: 'https://pfizer.com/careers/students-and-graduates' },
  { name: 'Johnson & Johnson Ireland', sector: 'Pharma', careers_url: 'https://jobs.jnj.com', grad_programme_url: 'https://jobs.jnj.com/students-and-graduates' },
  { name: 'Abbott Ireland', sector: 'Pharma', careers_url: 'https://abbott.com/careers.html', grad_programme_url: 'https://abbott.com/careers/students-and-graduates.html' },
  { name: 'AstraZeneca Ireland', sector: 'Pharma', careers_url: 'https://astrazeneca.com/careers.html', grad_programme_url: 'https://astrazeneca.com/careers/early-talent.html' },
  { name: 'MSD Ireland', sector: 'Pharma', careers_url: 'https://jobs.msd.com', grad_programme_url: 'https://jobs.msd.com/early-talent' },
  { name: 'Bausch & Lomb Ireland', sector: 'Pharma', careers_url: 'https://bausch.com/careers', grad_programme_url: 'https://bausch.com/careers/students' },

  // Public Sector
  { name: 'Civil Service', sector: 'Public Sector', careers_url: 'https://publicjobs.ie', grad_programme_url: 'https://publicjobs.ie/en/graduates' },
  { name: 'IDA Ireland', sector: 'Public Sector', careers_url: 'https://idaireland.com/about-ida/careers', grad_programme_url: 'https://idaireland.com/about-ida/careers/graduates' },
  { name: 'Enterprise Ireland', sector: 'Public Sector', careers_url: 'https://enterprise-ireland.com/en/about-us/careers', grad_programme_url: 'https://enterprise-ireland.com/en/about-us/careers/graduates' },
  { name: 'Health Service Executive', sector: 'Public Sector', careers_url: 'https://hse.ie/eng/staff/jobs', grad_programme_url: 'https://hse.ie/eng/staff/jobs/graduates' },
  { name: 'Bord na Mona', sector: 'Energy', careers_url: 'https://bordnamona.ie/careers', grad_programme_url: 'https://bordnamona.ie/careers/graduates' },

  // Retail
  { name: 'Dunnes Stores', sector: 'Retail', careers_url: 'https://dunnesstores.com/content/careers', grad_programme_url: 'https://dunnesstores.com/content/careers/graduates' },
  { name: 'Penneys / Primark Ireland', sector: 'Retail', careers_url: 'https://primark.com/en/careers', grad_programme_url: 'https://primark.com/en/careers/graduates' },
  { name: 'Lidl Ireland', sector: 'Retail', careers_url: 'https://lidl.ie/careers', grad_programme_url: 'https://lidl.ie/careers/graduates' },
  { name: 'Aldi Ireland', sector: 'Retail', careers_url: 'https://aldi.ie/careers', grad_programme_url: 'https://aldi.ie/careers/graduates' },
  { name: 'Tesco Ireland', sector: 'Retail', careers_url: 'https://tesco.ie/careers', grad_programme_url: 'https://tesco.ie/careers/graduates' },
  { name: 'SuperValu', sector: 'Retail', careers_url: 'https://supervalu.ie/careers', grad_programme_url: 'https://supervalu.ie/careers/graduates' },

  // Insurance
  { name: 'Zurich Insurance Ireland', sector: 'Insurance', careers_url: 'https://zurich.ie/careers', grad_programme_url: 'https://zurich.ie/careers/graduates' },
  { name: 'Aon Ireland', sector: 'Insurance', careers_url: 'https://aon.com/careers', grad_programme_url: 'https://aon.com/careers/students-and-graduates' },
  { name: 'Willis Towers Watson Ireland', sector: 'Insurance', careers_url: 'https://wtwco.com/en-US/Careers', grad_programme_url: 'https://wtwco.com/en-US/Careers/early-careers' },
  { name: 'Irish Life', sector: 'Insurance', careers_url: 'https://irishlife.ie/careers', grad_programme_url: 'https://irishlife.ie/careers/graduates' },

  // Accountancy
  { name: 'BDO Ireland', sector: 'Accountancy', careers_url: 'https://bdo.ie/careers', grad_programme_url: 'https://bdo.ie/careers/graduates' },
  { name: 'Mazars Ireland', sector: 'Accountancy', careers_url: 'https://mazars.ie/careers', grad_programme_url: 'https://mazars.ie/careers/graduates' },

  // Energy
  { name: 'ESB', sector: 'Energy', careers_url: 'https://esb.ie/careers', grad_programme_url: 'https://esb.ie/careers/graduates' },
  { name: 'Gas Networks Ireland', sector: 'Energy', careers_url: 'https://gasnetworks.ie/careers', grad_programme_url: 'https://gasnetworks.ie/careers/graduates' },
  { name: 'SSE Airtricity', sector: 'Energy', careers_url: 'https://sseairtricity.com/ie/home/about-us/careers', grad_programme_url: 'https://sseairtricity.com/ie/home/about-us/careers/graduates' },

  // Aviation / Engineering
  { name: 'Ryanair', sector: 'Aviation', careers_url: 'https://ryanair.com/ie/en/careers', grad_programme_url: 'https://ryanair.com/ie/en/careers/graduates' },
  { name: 'Aer Lingus', sector: 'Aviation', careers_url: 'https://aerlingus.com/careers', grad_programme_url: 'https://aerlingus.com/careers/graduates' },
  { name: 'CRH plc', sector: 'Engineering', careers_url: 'https://crh.com/careers', grad_programme_url: 'https://crh.com/careers/graduates' },
  { name: 'Kerry Group', sector: 'Food & Beverage', careers_url: 'https://kerrygroup.com/careers', grad_programme_url: 'https://kerrygroup.com/careers/graduates' },
  { name: 'Glanbia', sector: 'Food & Beverage', careers_url: 'https://glanbia.com/careers', grad_programme_url: 'https://glanbia.com/careers/graduates' },

  // Media
  { name: 'RTE', sector: 'Media', careers_url: 'https://rte.ie/about/en/jobs', grad_programme_url: 'https://rte.ie/about/en/jobs/graduates' },
  { name: 'Mediahuis Ireland', sector: 'Media', careers_url: 'https://mediahuis.ie/careers', grad_programme_url: 'https://mediahuis.ie/careers/graduates' },

  // Legal
  { name: 'A&L Goodbody', sector: 'Legal', careers_url: 'https://algoodbody.com/careers', grad_programme_url: 'https://algoodbody.com/careers/trainee-solicitors' },
  { name: 'Arthur Cox', sector: 'Legal', careers_url: 'https://arthurcox.com/careers', grad_programme_url: 'https://arthurcox.com/careers/trainee-solicitors' },
  { name: 'Matheson', sector: 'Legal', careers_url: 'https://matheson.com/careers', grad_programme_url: 'https://matheson.com/careers/trainee-solicitors' },
  { name: "McCann FitzGerald", sector: 'Legal', careers_url: 'https://mccannfitzgerald.com/careers', grad_programme_url: 'https://mccannfitzgerald.com/careers/trainee-solicitors' },
];

// ---------------------------------------------------------------------------
// Derived company card type (merged API + static)
// ---------------------------------------------------------------------------

interface CompanyCard extends CompanyInfo {
  openRoles: number;
  jobTitles: string[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalise(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Try to match a job's company string to one of our static entries */
function matchCompany(jobCompany: string): CompanyInfo | undefined {
  const jobNorm = normalise(jobCompany);
  return IRISH_COMPANIES.find((c) => {
    const cNorm = normalise(c.name);
    return jobNorm.includes(cNorm) || cNorm.includes(jobNorm);
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CompaniesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [activeSector, setActiveSector] = useState<Sector | 'All'>('All');

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/jobs?limit=200&page=1');
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const data: ApiResponse = await res.json();
        setJobs(data.results || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load jobs';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  /** Build company cards: start from static list, overlay live job counts */
  const companyCards = useMemo<CompanyCard[]>(() => {
    // Group live jobs by matched static company name
    const grouped: Record<string, { count: number; titles: string[] }> = {};
    for (const job of jobs) {
      const match = matchCompany(job.company);
      if (match) {
        if (!grouped[match.name]) grouped[match.name] = { count: 0, titles: [] };
        grouped[match.name].count += 1;
        if (grouped[match.name].titles.length < 10) {
          grouped[match.name].titles.push(job.title);
        }
      }
    }

    return IRISH_COMPANIES.map((c) => ({
      ...c,
      openRoles: grouped[c.name]?.count ?? 0,
      jobTitles: grouped[c.name]?.titles ?? [],
    }));
  }, [jobs]);

  const filteredCards = useMemo(() => {
    return companyCards.filter((c) => {
      const matchesSector = activeSector === 'All' || c.sector === activeSector;
      const matchesSearch =
        search.trim() === '' ||
        c.name.toLowerCase().includes(search.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [companyCards, activeSector, search]);

  const sectorCounts = useMemo(() => {
    const counts: Partial<Record<Sector | 'All', number>> = { All: companyCards.length };
    for (const c of companyCards) {
      counts[c.sector] = (counts[c.sector] ?? 0) + 1;
    }
    return counts;
  }, [companyCards]);

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={40} />
          <Typography variant="body2" color="text.secondary">Loading companies...</Typography>
        </Stack>
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Error state — still render the page with static data
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box sx={{ minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: 5 }}>

        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-end' }} justifyContent="space-between" spacing={1} sx={{ mb: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Irish Companies Hiring Graduates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {companyCards.length} companies tracked across all sectors
              {error && (
                <Typography component="span" variant="body2" sx={{ color: 'warning.main', ml: 1 }}>
                  (live job data unavailable — showing static directory)
                </Typography>
              )}
            </Typography>
          </Box>
          <Chip
            icon={<BusinessIcon />}
            label={`${filteredCards.length} shown`}
            variant="outlined"
            sx={{ mb: { xs: 0, sm: 0.5 } }}
          />
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mb: 2, mt: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Sector filter chips */}
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            label={`All (${sectorCounts['All'] ?? 0})`}
            onClick={() => setActiveSector('All')}
            variant={activeSector === 'All' ? 'filled' : 'outlined'}
            sx={{
              fontWeight: activeSector === 'All' ? 700 : 400,
              bgcolor: activeSector === 'All' ? 'primary.main' : undefined,
            }}
          />
          {ALL_SECTORS.filter((s) => sectorCounts[s]).map((sector) => (
            <Chip
              key={sector}
              label={`${sector} (${sectorCounts[sector] ?? 0})`}
              onClick={() => setActiveSector(sector === activeSector ? 'All' : sector)}
              variant={activeSector === sector ? 'filled' : 'outlined'}
              sx={{
                fontWeight: activeSector === sector ? 700 : 400,
                bgcolor: activeSector === sector ? SECTOR_COLORS[sector] : undefined,
                borderColor: SECTOR_COLORS[sector],
                color: activeSector === sector ? '#fff' : SECTOR_COLORS[sector],
                '&:hover': {
                  bgcolor: activeSector === sector
                    ? SECTOR_COLORS[sector]
                    : `${SECTOR_COLORS[sector]}22`,
                },
              }}
            />
          ))}
        </Box>

        {/* Company Grid */}
        {filteredCards.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <BusinessIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">No companies match your filters.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredCards.map((company) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={company.name}>
                <CompanyCardItem company={company} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Company card sub-component
// ---------------------------------------------------------------------------

function CompanyCardItem({ company }: { company: CompanyCard }) {
  const MAX_TITLES = 3;
  const shownTitles = company.jobTitles.slice(0, MAX_TITLES);
  const extraCount = company.jobTitles.length - MAX_TITLES;

  const sectorColor = SECTOR_COLORS[company.sector] ?? '#6b7280';

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: sectorColor },
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Company name + sector badge */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {company.name}
          </Typography>
          <Chip
            label={company.sector}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: `${sectorColor}22`,
              color: sectorColor,
              borderColor: sectorColor,
              border: '1px solid',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        {/* Open roles count */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <WorkIcon sx={{ fontSize: 16, color: company.openRoles > 0 ? '#10b981' : 'text.disabled' }} />
          <Typography
            variant="body2"
            sx={{ color: company.openRoles > 0 ? '#10b981' : 'text.disabled', fontWeight: 600 }}
          >
            {company.openRoles > 0
              ? `${company.openRoles} open graduate role${company.openRoles !== 1 ? 's' : ''}`
              : 'No live roles indexed'}
          </Typography>
        </Stack>

        {/* Job titles list */}
        {shownTitles.length > 0 && (
          <Box>
            <Stack spacing={0.5}>
              {shownTitles.map((title, i) => (
                <Typography
                  key={i}
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={title}
                >
                  • {title}
                </Typography>
              ))}
              {extraCount > 0 && (
                <Typography variant="caption" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
                  and {extraCount} more...
                </Typography>
              )}
            </Stack>
          </Box>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Divider sx={{ my: 0.5 }} />

        {/* Action buttons */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="outlined"
            endIcon={<OpenInNewIcon fontSize="inherit" />}
            href={company.careers_url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: '0.75rem', flex: 1 }}
          >
            Careers Page
          </Button>
          <Button
            size="small"
            variant="contained"
            endIcon={<SchoolIcon fontSize="inherit" />}
            href={company.grad_programme_url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              fontSize: '0.75rem',
              flex: 1,
              bgcolor: sectorColor,
              '&:hover': { bgcolor: sectorColor, filter: 'brightness(1.15)' },
            }}
          >
            Grad Programme
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
