'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  FormControl,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewListIcon from '@mui/icons-material/ViewList';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// ── Types ──────────────────────────────────────────────────────

interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  status: Status;
  match: number;
  appliedDate: string;
  nextStep: string;
  minSalary: number;
  maxSalary: number;
  notes: string;
}

type Status = 'saved' | 'applied' | 'interviewing' | 'offered' | 'rejected';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLOR: Record<Status, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  saved: 'default',
  applied: 'info',
  interviewing: 'warning',
  offered: 'success',
  rejected: 'error',
};

// ── Mock Data ──────────────────────────────────────────────────

const mockJobs: Job[] = [
  {
    id: '1', company: 'Google', title: 'Senior Backend Engineer',
    location: 'Dublin, Ireland', status: 'applied', match: 92,
    appliedDate: '2024-03-28', nextStep: 'Phone screening scheduled for Apr 5',
    minSalary: 120000, maxSalary: 160000, notes: 'Great match for Golang expertise',
  },
  {
    id: '2', company: 'Meta', title: 'Backend Software Engineer',
    location: 'Dublin, Ireland', status: 'saved', match: 88,
    appliedDate: '', nextStep: 'Ready to apply',
    minSalary: 130000, maxSalary: 170000, notes: 'Requires GraphQL experience',
  },
  {
    id: '3', company: 'Amazon', title: 'Backend Engineer',
    location: 'Dublin, Ireland', status: 'applied', match: 85,
    appliedDate: '2024-03-25', nextStep: 'Awaiting response',
    minSalary: 110000, maxSalary: 150000, notes: 'Good AWS experience match',
  },
  {
    id: '4', company: 'Microsoft', title: 'Cloud Solutions Architect',
    location: 'Dublin, Ireland', status: 'interviewing', match: 82,
    appliedDate: '2024-03-20', nextStep: 'Technical interview on Apr 3',
    minSalary: 140000, maxSalary: 180000, notes: 'Azure background required',
  },
  {
    id: '5', company: 'Apple', title: 'iOS Developer',
    location: 'Dublin, Ireland', status: 'interviewing', match: 78,
    appliedDate: '2024-03-22', nextStep: 'Waiting for HR response',
    minSalary: 100000, maxSalary: 140000, notes: 'Swift expertise important',
  },
  {
    id: '6', company: 'Netflix', title: 'Senior Backend Engineer',
    location: 'Dubai, UAE', status: 'interviewing', match: 86,
    appliedDate: '2024-03-18', nextStep: 'Round 2 interview scheduled for Apr 10',
    minSalary: 150000, maxSalary: 200000, notes: 'Streaming platform experience valued',
  },
  {
    id: '7', company: 'Stripe', title: 'Backend Engineer',
    location: 'Dublin, Ireland', status: 'saved', match: 89,
    appliedDate: '', nextStep: 'Ready to apply',
    minSalary: 125000, maxSalary: 165000, notes: 'Payment systems background perfect',
  },
  {
    id: '8', company: 'Airbnb', title: 'Full Stack Engineer',
    location: 'Dublin, Ireland', status: 'offered', match: 87,
    appliedDate: '2024-03-10', nextStep: 'Offer received - Decision due Apr 15',
    minSalary: 115000, maxSalary: 155000, notes: 'Excellent cultural fit',
  },
  {
    id: '9', company: 'Shopify', title: 'Staff Engineer',
    location: 'Remote', status: 'rejected', match: 74,
    appliedDate: '2024-03-05', nextStep: 'Closed',
    minSalary: 130000, maxSalary: 175000, notes: 'Ruby on Rails heavy stack',
  },
];

// ── Helpers ────────────────────────────────────────────────────

function formatSalary(min: number, max: number) {
  const fmt = (n: number) => `${Math.round(n / 1000)}k`;
  return `$${fmt(min)} - $${fmt(max)}`;
}

// ── Component ──────────────────────────────────────────────────

export default function TrackerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0); // 0=Board, 1=List
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Simulate loading tracked jobs (replace with real fetch when API is ready)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setJobs(mockJobs);
      } catch {
        setError('Failed to load your tracked applications. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // ── Filtered jobs ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.company.toLowerCase().includes(q) ||
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q),
    );
  }, [jobs, search]);

  // ── Handlers ──
  const handleStatusChange = (id: string, status: Status) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, notes } : j)));
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  // ── Board columns ──
  const columns: { status: Status; label: string }[] = [
    { status: 'saved', label: 'Saved' },
    { status: 'applied', label: 'Applied' },
    { status: 'interviewing', label: 'Interviewing' },
    { status: 'offered', label: 'Offered' },
    { status: 'rejected', label: 'Rejected' },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} color="white" gutterBottom>
        Application Tracker
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Monitor and manage your job applications
      </Typography>

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Box>
          <Stack direction="row" spacing={2} mb={3}>
            <Skeleton variant="rounded" width={300} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
            <Skeleton variant="rounded" width={160} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          </Stack>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={i}>
                <Skeleton
                  variant="rounded"
                  height={350}
                  sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2 }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Empty state — no tracked jobs at all */}
      {!loading && !error && jobs.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            py: 10,
            textAlign: 'center',
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.10)',
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tracked applications yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7, mb: 3 }}>
            Jobs you save or apply to from the Search page will appear here.
          </Typography>
          <Button
            variant="outlined"
            href="/search"
            sx={{
              textTransform: 'none',
              borderRadius: 2,
              borderColor: 'rgba(255,255,255,0.15)',
              color: 'text.secondary',
              '&:hover': { borderColor: 'rgba(255,255,255,0.3)', color: 'white', bgcolor: 'rgba(255,255,255,0.04)' },
            }}
          >
            Browse Jobs
          </Button>
        </Paper>
      )}

      {/* Search + Tabs + Board + List */}
      {!loading && !error && jobs.length > 0 && (
      <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={3}>
        <TextField
          size="small"
          placeholder="Search company, title, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Tabs
          value={tabIndex}
          onChange={(_, v) => setTabIndex(v)}
          sx={{
            minHeight: 36,
            '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' },
          }}
        >
          <Tab icon={<ViewColumnIcon fontSize="small" />} iconPosition="start" label="Board" />
          <Tab icon={<ViewListIcon fontSize="small" />} iconPosition="start" label="List" />
        </Tabs>
      </Stack>

      {/* ── Board View ── */}
      {tabIndex === 0 && (
        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          {columns.map((col) => {
            const colJobs = filtered.filter((j) => j.status === col.status);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={col.status}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    minHeight: 350,
                  }}
                >
                  {/* Column header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} px={0.5}>
                    <Chip label={col.label} color={STATUS_COLOR[col.status]} size="small" variant="outlined" />
                    <Typography variant="caption" color="text.secondary">
                      {colJobs.length}
                    </Typography>
                  </Stack>

                  {/* Cards */}
                  <Stack spacing={1.5}>
                    {colJobs.map((job) => (
                      <Card
                        key={job.id}
                        elevation={0}
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: 2,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' },
                        }}
                      >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography variant="subtitle2" color="white" noWrap>
                                {job.company}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap display="block">
                                {job.title}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${job.match}%`}
                              size="small"
                              color={job.match >= 85 ? 'success' : job.match >= 70 ? 'warning' : 'default'}
                              sx={{ ml: 1, fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                            <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {job.location}
                            </Typography>
                          </Stack>

                          <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                            <AttachMoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {formatSalary(job.minSalary, job.maxSalary)}
                            </Typography>
                          </Stack>

                          {/* Status select */}
                          <FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
                            <Select
                              value={job.status}
                              onChange={(e) => handleStatusChange(job.id, e.target.value as Status)}
                              sx={{ fontSize: '0.75rem', height: 30 }}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.75rem' }}>
                                  {s.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {/* Notes */}
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={1}
                            maxRows={3}
                            placeholder="Notes..."
                            value={job.notes}
                            onChange={(e) => handleNotesChange(job.id, e.target.value)}
                            sx={{ mt: 1, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
                          />

                          {/* Delete */}
                          <Box textAlign="right" mt={0.5}>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(job.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}

                    {colJobs.length === 0 && (
                      <Box
                        sx={{
                          border: '1px dashed rgba(255,255,255,0.08)',
                          borderRadius: 2,
                          py: 4,
                          textAlign: 'center',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          No jobs
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── List View ── */}
      {tabIndex === 1 && (
        <Stack spacing={2}>
          {filtered.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Typography color="text.secondary">No applications match your search.</Typography>
            </Paper>
          )}
          {filtered.map((job) => (
            <Card
              key={job.id}
              elevation={0}
              sx={{
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 2,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Grid container spacing={2} alignItems="center">
                  {/* Info */}
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="white">
                      {job.company}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {job.title}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                      <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {job.location}
                      </Typography>
                    </Stack>
                  </Grid>

                  {/* Match + Status */}
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Chip
                      label={`${job.match}% match`}
                      size="small"
                      color={job.match >= 85 ? 'success' : job.match >= 70 ? 'warning' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Chip label={job.status} size="small" color={STATUS_COLOR[job.status]} />
                  </Grid>

                  {/* Salary + Date */}
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatSalary(job.minSalary, job.maxSalary)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {job.appliedDate
                        ? new Date(job.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Not applied'}
                    </Typography>
                  </Grid>

                  {/* Actions */}
                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                      <FormControl size="small" sx={{ minWidth: 110 }}>
                        <Select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value as Status)}
                          sx={{ fontSize: '0.75rem', height: 32 }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <MenuItem key={s.value} value={s.value} sx={{ fontSize: '0.75rem' }}>
                              {s.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(job.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Notes row */}
                <Box mt={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    maxRows={3}
                    placeholder="Add notes..."
                    value={job.notes}
                    onChange={(e) => handleNotesChange(job.id, e.target.value)}
                    sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      </>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this job from your tracker? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
