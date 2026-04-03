'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  TextField,
  Stack,
  Chip,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  TrackChanges,
  EmojiEvents,
  LocalFireDepartment,
  TrendingUp,
  CheckCircle,
  WorkOutline,
  Business,
  People,
  School,
  MenuBook,
  Edit,
  Add,
  Remove,
} from '@mui/icons-material';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Goal {
  id: string;
  label: string;
  icon: string;
  target: number;
  current: number;
  color: string;
}

interface WeekHistory {
  week: string;
  goals: { id: string; achieved: number }[];
}

interface GoalsData {
  goals: Goal[];
  dailyCheckins: boolean[];
  weekHistory: WeekHistory[];
  streak: number;
  statsCards: { applicationsThisWeek: number; interviewsScheduled: number; responseRate: number };
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_GOALS: Goal[] = [
  { id: 'apply', label: 'Jobs to Apply', icon: 'WorkOutline', target: 10, current: 0, color: '#6366f1' },
  { id: 'research', label: 'Companies to Research', icon: 'Business', target: 5, current: 0, color: '#a855f7' },
  { id: 'network', label: 'Networking Contacts', icon: 'People', target: 3, current: 0, color: '#06b6d4' },
  { id: 'interview', label: 'Interview Prep Sessions', icon: 'School', target: 2, current: 0, color: '#10b981' },
  { id: 'skills', label: 'Skills to Learn', icon: 'MenuBook', target: 1, current: 0, color: '#f59e0b' },
];

const STORAGE_KEY = 'lazyscaper-goals';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDefaultData(): GoalsData {
  return {
    goals: DEFAULT_GOALS,
    dailyCheckins: [false, false, false, false, false, false, false],
    weekHistory: [],
    streak: 0,
    statsCards: { applicationsThisWeek: 0, interviewsScheduled: 0, responseRate: 0 },
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const iconMap: Record<string, React.ReactNode> = {
  WorkOutline: <WorkOutline />,
  Business: <Business />,
  People: <People />,
  School: <School />,
  MenuBook: <MenuBook />,
};

function getCurrentWeekLabel(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay() + 1);
  return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Glassmorphism card sx
// ---------------------------------------------------------------------------

const glassCard = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  p: 3,
  transition: 'all 0.35s cubic-bezier(.4,0,.2,1)',
  '&:hover': {
    background: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.12)',
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
  },
};

// ---------------------------------------------------------------------------
// SVG Progress Ring
// ---------------------------------------------------------------------------

function ProgressRing({
  progress,
  color,
  size = 140,
  strokeWidth = 10,
  children,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(progress, 100);
  const offset = circumference - (circumference * (mounted ? clampedProgress : 0)) / 100;
  const gradientId = `ring-grad-${color.replace('#', '')}`;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', filter: `drop-shadow(0 0 10px ${color}55)` }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Motivational Widget
// ---------------------------------------------------------------------------

function getMotivation(goals: Goal[]): { message: string; emoji: string } {
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalCurrent = goals.reduce((s, g) => s + Math.min(g.current, g.target), 0);
  const pct = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  if (pct >= 100) return { message: 'All goals crushed! You are unstoppable.', emoji: 'trophy' };
  if (pct >= 80) return { message: "You're on fire! Almost there.", emoji: 'fire' };
  if (pct >= 50) return { message: 'Solid progress. Keep the momentum.', emoji: 'rocket' };
  if (pct >= 25) return { message: "Good start. Let's push further.", emoji: 'muscle' };
  return { message: 'A new week awaits. Time to make it count.', emoji: 'sunrise' };
}

const motivationIcons: Record<string, React.ReactNode> = {
  trophy: <EmojiEvents sx={{ fontSize: 36, color: '#f59e0b' }} />,
  fire: <LocalFireDepartment sx={{ fontSize: 36, color: '#ef4444' }} />,
  rocket: <TrendingUp sx={{ fontSize: 36, color: '#6366f1' }} />,
  muscle: <TrackChanges sx={{ fontSize: 36, color: '#10b981' }} />,
  sunrise: <TrackChanges sx={{ fontSize: 36, color: '#06b6d4' }} />,
};

// ---------------------------------------------------------------------------
// Mini bar chart for weekly history
// ---------------------------------------------------------------------------

function MiniBarChart({ weeks, goalId, color }: { weeks: WeekHistory[]; goalId: string; color: string }) {
  const maxVal = Math.max(1, ...weeks.map((w) => {
    const g = w.goals.find((x) => x.id === goalId);
    return g ? g.achieved : 0;
  }));

  return (
    <Stack direction="row" spacing={0.5} alignItems="flex-end" sx={{ height: 48 }}>
      {weeks.map((w, i) => {
        const g = w.goals.find((x) => x.id === goalId);
        const val = g ? g.achieved : 0;
        const h = Math.max(4, (val / maxVal) * 44);
        return (
          <Tooltip key={i} title={`${w.week}: ${val}`} arrow>
            <Box
              sx={{
                width: 14,
                height: h,
                borderRadius: '4px 4px 2px 2px',
                background: `linear-gradient(180deg, ${color}, ${color}55)`,
                transition: 'height 0.6s cubic-bezier(.4,0,.2,1)',
                cursor: 'pointer',
                '&:hover': { filter: 'brightness(1.3)' },
              }}
            />
          </Tooltip>
        );
      })}
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function GoalsPage() {
  const [data, setData] = useState<GoalsData>(getDefaultData);
  const [loaded, setLoaded] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editGoals, setEditGoals] = useState<Goal[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GoalsData;
        // Ensure all default goal IDs exist
        const ids = parsed.goals.map((g) => g.id);
        DEFAULT_GOALS.forEach((dg) => {
          if (!ids.includes(dg.id)) parsed.goals.push({ ...dg });
        });
        setData(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Persist
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, loaded]);

  const updateGoalCurrent = useCallback((id: string, delta: number) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, current: Math.max(0, g.current + delta) } : g)),
    }));
  }, []);

  const toggleCheckin = useCallback((dayIndex: number) => {
    setData((prev) => {
      const next = [...prev.dailyCheckins];
      next[dayIndex] = !next[dayIndex];
      return { ...prev, dailyCheckins: next };
    });
  }, []);

  const updateStats = useCallback((field: keyof GoalsData['statsCards'], value: number) => {
    setData((prev) => ({
      ...prev,
      statsCards: { ...prev.statsCards, [field]: Math.max(0, value) },
    }));
  }, []);

  const openEditDialog = useCallback(() => {
    setEditGoals(data.goals.map((g) => ({ ...g })));
    setEditDialog(true);
  }, [data.goals]);

  const saveEditDialog = useCallback(() => {
    setData((prev) => ({ ...prev, goals: editGoals }));
    setEditDialog(false);
  }, [editGoals]);

  const completeWeek = useCallback(() => {
    const weekLabel = getCurrentWeekLabel();
    const entry: WeekHistory = {
      week: weekLabel,
      goals: data.goals.map((g) => ({ id: g.id, achieved: g.current })),
    };
    const allMet = data.goals.every((g) => g.current >= g.target);
    setData((prev) => ({
      ...prev,
      weekHistory: [...prev.weekHistory.slice(-7), entry],
      streak: allMet ? prev.streak + 1 : 0,
      goals: prev.goals.map((g) => ({ ...g, current: 0 })),
      dailyCheckins: [false, false, false, false, false, false, false],
    }));
  }, [data.goals]);

  // Derived
  const totalPct = useMemo(() => {
    const t = data.goals.reduce((s, g) => s + g.target, 0);
    const c = data.goals.reduce((s, g) => s + Math.min(g.current, g.target), 0);
    return t > 0 ? Math.round((c / t) * 100) : 0;
  }, [data.goals]);

  const motivation = useMemo(() => getMotivation(data.goals), [data.goals]);
  const activeDays = data.dailyCheckins.filter(Boolean).length;
  const last8 = data.weekHistory.slice(-8);

  if (!loaded) return null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        pb: 10,
        // Animated gradient orbs - CSS only
        '&::before': {
          content: '""',
          position: 'fixed',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          animation: 'orbFloat1 18s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'fixed',
          bottom: '-15%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          animation: 'orbFloat2 22s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '@keyframes orbFloat1': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(80px,60px) scale(1.1)' },
          '66%': { transform: 'translate(-40px,100px) scale(0.95)' },
        },
        '@keyframes orbFloat2': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%': { transform: 'translate(-60px,-80px) scale(1.08)' },
        },
      }}
    >
      {/* Third orb */}
      <Box
        sx={{
          position: 'fixed',
          top: '40%',
          left: '50%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
          animation: 'orbFloat3 25s ease-in-out infinite',
          pointerEvents: 'none',
          zIndex: 0,
          '@keyframes orbFloat3': {
            '0%,100%': { transform: 'translate(-50%,-50%) scale(1)' },
            '40%': { transform: 'translate(-30%,-40%) scale(1.12)' },
            '70%': { transform: 'translate(-60%,-55%) scale(0.9)' },
          },
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 5 }}>
        {/* ---- Header ---- */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Weekly Goals
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Week of {getCurrentWeekLabel()} &mdash; {activeDays}/7 days active
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<Edit />} onClick={openEditDialog} sx={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              Edit Targets
            </Button>
            <Button variant="contained" onClick={completeWeek} sx={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #9333ea)' } }}>
              Complete Week
            </Button>
          </Stack>
        </Stack>

        {/* ---- Overall Progress + Motivation ---- */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ ...glassCard, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 5 }}>
              <ProgressRing progress={totalPct} color="#6366f1" size={180} strokeWidth={12}>
                <Typography sx={{ fontSize: 56, fontWeight: 800, lineHeight: 1, color: '#f1f5f9' }}>
                  {totalPct}
                  <Typography component="span" sx={{ fontSize: 22, fontWeight: 500, color: 'text.secondary' }}>%</Typography>
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>overall</Typography>
              </ProgressRing>
            </Paper>
          </Grid>

          {/* Motivation */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ ...glassCard, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                {motivationIcons[motivation.emoji]}
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Motivation</Typography>
              </Stack>
              <Typography sx={{ fontSize: 20, fontWeight: 500, color: 'text.secondary', lineHeight: 1.5 }}>
                {motivation.message}
              </Typography>
              <Box sx={{ mt: 3 }}>
                <LinearProgress
                  variant="determinate"
                  value={totalPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Streak */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ ...glassCard, display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <LocalFireDepartment sx={{ fontSize: 32, color: '#f59e0b' }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Week Streak</Typography>
              </Stack>
              <Typography sx={{ fontSize: 72, fontWeight: 800, lineHeight: 1, color: '#f59e0b', filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.35))' }}>
                {data.streak}
              </Typography>
              <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 1 }}>
                {data.streak === 0 ? 'Complete all goals this week to start a streak' : `consecutive week${data.streak > 1 ? 's' : ''} of crushing it`}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ---- Goal Progress Rings ---- */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, color: '#f1f5f9' }}>Goal Progress</Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {data.goals.map((goal) => {
            const pct = goal.target > 0 ? Math.round((Math.min(goal.current, goal.target) / goal.target) * 100) : 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={goal.id}>
                <Paper sx={{ ...glassCard, textAlign: 'center' }}>
                  <ProgressRing progress={pct} color={goal.color} size={120} strokeWidth={9}>
                    <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{goal.current}</Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>/ {goal.target}</Typography>
                  </ProgressRing>
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                    <Box sx={{ color: goal.color, display: 'flex' }}>{iconMap[goal.icon]}</Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{goal.label}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateGoalCurrent(goal.id, -1)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <Remove sx={{ fontSize: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => updateGoalCurrent(goal.id, 1)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: `${goal.color}33` } }}
                    >
                      <Add sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Stack>
                  {pct >= 100 && (
                    <Chip
                      icon={<CheckCircle sx={{ fontSize: 14 }} />}
                      label="Complete"
                      size="small"
                      sx={{ mt: 1.5, bgcolor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11 }}
                    />
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* ---- Daily Check-in + Stats ---- */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Daily Check-in */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={glassCard}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#f1f5f9' }}>Daily Check-in</Typography>
              <Stack direction="row" spacing={1.5} justifyContent="space-between">
                {DAYS.map((day, i) => {
                  const checked = data.dailyCheckins[i];
                  return (
                    <Box
                      key={day}
                      onClick={() => toggleCheckin(i)}
                      sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 2.5,
                        px: 1,
                        borderRadius: '14px',
                        cursor: 'pointer',
                        background: checked
                          ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))'
                          : 'rgba(255,255,255,0.03)',
                        border: checked ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: checked
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(168,85,247,0.2))'
                            : 'rgba(255,255,255,0.06)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: 1 }}>{day}</Typography>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          mx: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: checked ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.05)',
                          transition: 'all 0.3s ease',
                          boxShadow: checked ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                        }}
                      >
                        {checked && <CheckCircle sx={{ fontSize: 18, color: '#fff' }} />}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
              <Typography sx={{ mt: 2, fontSize: 13, color: 'text.secondary' }}>
                {activeDays === 7 ? 'Perfect week! Every day counted.' : `${activeDays} of 7 days completed`}
              </Typography>
            </Paper>
          </Grid>

          {/* Stats Cards */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              {([
                { label: 'Applications This Week', field: 'applicationsThisWeek' as const, color: '#6366f1', icon: <WorkOutline sx={{ fontSize: 28, color: '#6366f1' }} /> },
                { label: 'Interviews Scheduled', field: 'interviewsScheduled' as const, color: '#10b981', icon: <EmojiEvents sx={{ fontSize: 28, color: '#10b981' }} /> },
                { label: 'Response Rate', field: 'responseRate' as const, color: '#f59e0b', icon: <TrendingUp sx={{ fontSize: 28, color: '#f59e0b' }} /> },
              ]).map((stat) => (
                <Paper key={stat.field} sx={{ ...glassCard, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: `${stat.color}15`, display: 'flex' }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 500 }}>{stat.label}</Typography>
                      <Typography sx={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, color: '#f1f5f9' }}>
                        {data.statsCards[stat.field]}{stat.field === 'responseRate' ? '%' : ''}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => updateStats(stat.field, data.statsCards[stat.field] - 1)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                    >
                      <Remove sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => updateStats(stat.field, data.statsCards[stat.field] + 1)}
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: `${stat.color}22` } }}
                    >
                      <Add sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* ---- Weekly History ---- */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5, color: '#f1f5f9' }}>Weekly History</Typography>
        {last8.length === 0 ? (
          <Paper sx={{ ...glassCard, textAlign: 'center', py: 6 }}>
            <TrackChanges sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography sx={{ color: 'text.secondary' }}>No history yet. Complete your first week to see trends here.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {data.goals.map((goal) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={goal.id}>
                <Paper sx={glassCard}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ color: goal.color, display: 'flex' }}>{iconMap[goal.icon]}</Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{goal.label}</Typography>
                  </Stack>
                  <MiniBarChart weeks={last8} goalId={goal.id} color={goal.color} />
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 1 }}>Last {last8.length} weeks</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ---- Edit Targets Dialog ---- */}
        <Dialog
          open={editDialog}
          onClose={() => setEditDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(10,15,30,0.95)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Edit Weekly Targets</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              {editGoals.map((goal, i) => (
                <Stack key={goal.id} direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ color: goal.color, display: 'flex' }}>{iconMap[goal.icon]}</Box>
                  <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{goal.label}</Typography>
                  <TextField
                    type="number"
                    value={goal.target}
                    onChange={(e) => {
                      const next = [...editGoals];
                      next[i] = { ...next[i], target: Math.max(1, parseInt(e.target.value) || 1) };
                      setEditGoals(next);
                    }}
                    sx={{ width: 80 }}
                    inputProps={{ min: 1, style: { textAlign: 'center' } }}
                  />
                </Stack>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setEditDialog(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={saveEditDialog}
              sx={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', '&:hover': { background: 'linear-gradient(135deg, #4f46e5, #9333ea)' } }}
            >
              Save Targets
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
