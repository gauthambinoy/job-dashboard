'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Slider,
  Select,
  MenuItem,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const SKILLS_OPTIONS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Go', 'Java',
  'AWS', 'Docker', 'Kubernetes', 'SQL', 'PostgreSQL', 'MongoDB', 'GraphQL',
  'REST', 'CI/CD', 'Git', 'Terraform', 'Rust', 'C++', 'Swift', 'Ruby',
  'Redis', 'Kafka', 'System Design', 'Linux', 'Azure', 'GCP',
];

const COUNTRY_OPTIONS = [
  'United States', 'Canada', 'United Kingdom', 'Ireland', 'Germany',
  'Netherlands', 'Australia', 'Singapore', 'Dubai (UAE)', 'Switzerland',
  'Sweden', 'France', 'Japan', 'India', 'New Zealand',
];

const EDUCATION_OPTIONS = [
  { value: 'high-school', label: 'High School' },
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'self-taught', label: 'Self-taught' },
];

const AVAILABILITY_OPTIONS = [
  'Actively Looking',
  'Passive',
  'Planning to Relocate',
];

interface ProfileFormData {
  skills: string[];
  experienceYears: string;
  education: string;
  salaryRange: number[];
  targetCountries: string[];
  availability: string;
}

const STORAGE_KEY = 'job-dashboard-profile';

function loadProfile(): ProfileFormData {
  if (typeof window === 'undefined') return getDefaults();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return getDefaults();
}

function getDefaults(): ProfileFormData {
  return {
    skills: [],
    experienceYears: '',
    education: '',
    salaryRange: [60, 180],
    targetCountries: [],
    availability: 'Actively Looking',
  };
}

export default function ProfilePage() {
  const [formData, setFormData] = useState<ProfileFormData>(getDefaults);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');
  const [snackMessage, setSnackMessage] = useState('Profile saved successfully!');

  // Load from localStorage on mount
  useEffect(() => {
    setFormData(loadProfile());
    setProfileLoaded(true);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate async save (replace with real API call when ready)
      await new Promise((res) => setTimeout(res, 500));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      setSnackSeverity('success');
      setSnackMessage('Profile saved successfully!');
      setSnackOpen(true);
    } catch {
      setSnackSeverity('error');
      setSnackMessage('Failed to save profile. Please try again.');
      setSnackOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const salaryText = (value: number) => `$${value}K`;

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h4" fontWeight={700} color="white">
          Your Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Skills, experience, and preferences for smarter job matches.
        </Typography>
      </Box>

      {/* Loading skeleton while localStorage data is hydrating */}
      {!profileLoaded && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Stack spacing={4}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i}>
                <Skeleton variant="text" width={100} height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 1 }} />
                <Skeleton variant="rounded" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
              </Box>
            ))}
            <Skeleton variant="rounded" height={52} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
          </Stack>
        </Paper>
      )}

      {profileLoaded && (
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          bgcolor: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Stack spacing={4}>
          {/* Skills */}
          <Box>
            <Typography variant="subtitle2" color="white" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
              Skills
            </Typography>
            <Autocomplete
              multiple
              freeSolo
              options={SKILLS_OPTIONS}
              value={formData.skills}
              onChange={(_, newValue) => setFormData(prev => ({ ...prev, skills: newValue }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option}
                      size="small"
                      color="primary"
                      variant="outlined"
                      {...rest}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Add skills..."
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </Box>

          {/* Experience */}
          <Box>
            <Typography variant="subtitle2" color="white" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
              Experience (Years)
            </Typography>
            <TextField
              type="number"
              fullWidth
              size="small"
              placeholder="e.g. 5"
              value={formData.experienceYears}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
              inputProps={{ min: 0, max: 50 }}
              helperText="Years in tech industry"
            />
          </Box>

          {/* Education */}
          <Box>
            <Typography variant="subtitle2" color="white" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
              Education
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Select level</InputLabel>
              <Select
                value={formData.education}
                label="Select level"
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
              >
                {EDUCATION_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Salary Range */}
          <Box>
            <Typography variant="subtitle2" color="white" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
              Salary Range
            </Typography>
            <Typography variant="caption" color="text.secondary" mb={2} display="block">
              {salaryText(formData.salaryRange[0])} &ndash; {salaryText(formData.salaryRange[1])}
            </Typography>
            <Slider
              value={formData.salaryRange}
              onChange={(_, newValue) => setFormData(prev => ({ ...prev, salaryRange: newValue as number[] }))}
              valueLabelDisplay="auto"
              valueLabelFormat={salaryText}
              min={0}
              max={300}
              step={5}
              sx={{ mx: 1 }}
            />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">$0</Typography>
              <Typography variant="caption" color="text.secondary">$300K</Typography>
            </Stack>
          </Box>

          {/* Target Countries */}
          <Box>
            <Typography variant="subtitle2" color="white" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
              Target Countries
            </Typography>
            <Autocomplete
              multiple
              options={COUNTRY_OPTIONS}
              value={formData.targetCountries}
              onChange={(_, newValue) => setFormData(prev => ({ ...prev, targetCountries: newValue }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...rest } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      label={option}
                      size="small"
                      color="secondary"
                      variant="outlined"
                      {...rest}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Select countries..."
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </Box>

          {/* Availability */}
          <Box>
            <Typography variant="subtitle2" color="white" mb={1.5} sx={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: '0.75rem' }}>
              Availability
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.availability}
                label="Status"
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              >
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Save Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
              },
              '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </Stack>
      </Paper>
      )}

      {/* Snackbar feedback (success or error) */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}
