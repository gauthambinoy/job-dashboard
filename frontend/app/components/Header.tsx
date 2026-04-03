'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Drawer,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Paper,
  Popper,
  ClickAwayListener,
  Grow,
  MenuList,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = '#6366f1';
const GRAY = 'rgba(156, 163, 175, 1)';
const ACTIVE_BG = 'rgba(99, 102, 241, 0.12)';
const HOVER_BG = 'rgba(255, 255, 255, 0.05)';

/** Pages that live outside the Analytics dropdown */
const MAIN_NAV = [
  { label: 'Home', path: '/' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Search Jobs', path: '/search' },
  { label: 'Tracker', path: '/tracker' },
  { label: 'Profile', path: '/profile' },
  { label: 'Goals', path: '/goals' },
  { label: 'Graduates', path: '/graduates' },
] as const;

/** Sub-pages rendered inside the Analytics dropdown */
const ANALYTICS_ITEMS = [
  { label: 'Analytics', path: '/analytics', icon: <BarChartIcon sx={{ fontSize: 18 }} /> },
  { label: 'Clusters', path: '/analytics/clusters', icon: <BubbleChartIcon sx={{ fontSize: 18 }} /> },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true when the current route matches exactly or is a child of `path`. */
function useIsActive(pathname: string) {
  return (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(path + '/');
  };
}

// ─── Desktop Analytics Dropdown ───────────────────────────────────────────────

function AnalyticsDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const isActive = useIsActive(pathname);
  const anyActive = ANALYTICS_ITEMS.some((i) => isActive(i.path));

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (anchorRef.current?.contains(event.target as HTMLElement)) return;
    setOpen(false);
  };

  return (
    <>
      <Button
        ref={anchorRef}
        onClick={handleToggle}
        disableRipple
        endIcon={
          open ? (
            <ExpandLessIcon sx={{ fontSize: '1rem !important', ml: -0.5 }} />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: '1rem !important', ml: -0.5 }} />
          )
        }
        sx={{
          px: 1.75,
          py: 0.75,
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          letterSpacing: '0.01em',
          color: anyActive ? '#fff' : GRAY,
          backgroundColor: anyActive ? ACTIVE_BG : 'transparent',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#fff',
            backgroundColor: anyActive ? ACTIVE_BG : HOVER_BG,
          },
        }}
      >
        Analytics
      </Button>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        disablePortal
        style={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'top left' }}>
            <Paper
              elevation={0}
              sx={{
                mt: 0.75,
                minWidth: 180,
                background: 'rgba(10, 15, 30, 0.98)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} sx={{ py: 0.75, px: 0.75 }}>
                  {ANALYTICS_ITEMS.map((item) => (
                    <MenuItem
                      key={item.path}
                      component={Link}
                      href={item.path}
                      onClick={() => setOpen(false)}
                      sx={{
                        borderRadius: '8px',
                        py: 1,
                        px: 1.5,
                        gap: 1.25,
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: isActive(item.path) ? '#fff' : GRAY,
                        backgroundColor: isActive(item.path) ? ACTIVE_BG : 'transparent',
                        '&:hover': {
                          color: '#fff',
                          backgroundColor: isActive(item.path) ? ACTIVE_BG : HOVER_BG,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: isActive(item.path) ? PRIMARY : 'inherit',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {item.icon}
                      </Box>
                      {item.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

// ─── Shared nav button styles ──────────────────────────────────────────────────

function navButtonSx(active: boolean) {
  return {
    px: 1.75,
    py: 0.75,
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    letterSpacing: '0.01em',
    color: active ? '#fff' : GRAY,
    backgroundColor: active ? ACTIVE_BG : 'transparent',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#fff',
      backgroundColor: active ? ACTIVE_BG : HOVER_BG,
    },
  };
}

// ─── Main Header ──────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const isActive = useIsActive(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);

  const anyAnalyticsActive = ANALYTICS_ITEMS.some((i) => isActive(i.path));

  return (
    <>
      {/* ── AppBar ─────────────────────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(3, 7, 18, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <Toolbar
          sx={{
            maxWidth: '1400px',
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            minHeight: { xs: 60, sm: 64 },
          }}
        >
          {/* ── Brand ──────────────────────────────────────────────────────── */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              flexShrink: 0,
              '&:hover .logo-icon': {
                boxShadow: `0 0 24px ${PRIMARY}80`,
                transform: 'scale(1.05)',
              },
            }}
          >
            <Box
              className="logo-icon"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${PRIMARY}, #8b5cf6)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 14px ${PRIMARY}40`,
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
              }}
            >
              <BoltIcon sx={{ fontSize: 20, color: '#fff' }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.03em',
                color: '#fff',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              Lazy
              <Box component="span" sx={{ color: PRIMARY }}>
                Scaper
              </Box>
            </Typography>
          </Box>

          {/* ── Desktop nav ────────────────────────────────────────────────── */}
          <Box
            component="nav"
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.25,
              mx: 'auto',
              px: 2,
            }}
          >
            {/* Home */}
            <Button
              component={Link}
              href="/"
              disableRipple
              sx={navButtonSx(isActive('/'))}
            >
              Home
            </Button>

            {/* Dashboard */}
            <Button
              component={Link}
              href="/dashboard"
              disableRipple
              sx={navButtonSx(isActive('/dashboard'))}
            >
              Dashboard
            </Button>

            {/* Search Jobs */}
            <Button
              component={Link}
              href="/search"
              disableRipple
              sx={navButtonSx(isActive('/search'))}
            >
              Search Jobs
            </Button>

            {/* Tracker */}
            <Button
              component={Link}
              href="/tracker"
              disableRipple
              sx={navButtonSx(isActive('/tracker'))}
            >
              Tracker
            </Button>

            {/* Analytics dropdown */}
            <AnalyticsDropdown pathname={pathname} />

            {/* Profile */}
            <Button
              component={Link}
              href="/profile"
              disableRipple
              sx={navButtonSx(isActive('/profile'))}
            >
              Profile
            </Button>

            {/* Goals */}
            <Button
              component={Link}
              href="/goals"
              disableRipple
              sx={navButtonSx(isActive('/goals'))}
            >
              Goals
            </Button>

            {/* Graduates */}
            <Button
              component={Link}
              href="/graduates"
              disableRipple
              sx={navButtonSx(isActive('/graduates'))}
            >
              Graduates
            </Button>
          </Box>

          {/* ── Mobile hamburger ───────────────────────────────────────────── */}
          <Box sx={{ ml: 'auto', display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              sx={{
                color: GRAY,
                '&:hover': { color: '#fff', backgroundColor: HOVER_BG },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 290,
            background: 'rgba(3, 7, 18, 0.97)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
          },
        }}
      >
        {/* Drawer header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            height: 64,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '1.125rem',
              letterSpacing: '-0.03em',
              color: '#fff',
              userSelect: 'none',
            }}
          >
            Lazy
            <Box component="span" sx={{ color: PRIMARY }}>
              Scaper
            </Box>
          </Typography>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation menu"
            sx={{
              color: GRAY,
              '&:hover': { color: '#fff', backgroundColor: HOVER_BG },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Drawer nav list */}
        <Box sx={{ overflowY: 'auto', flex: 1, py: 1.5, px: 1.5 }}>
          {/* Section label */}
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgba(100, 116, 139, 1)',
              px: 1.5,
              pb: 0.75,
              pt: 0.25,
            }}
          >
            Navigation
          </Typography>

          <List disablePadding>
            {/* Main nav items (excluding analytics) */}
            {MAIN_NAV.map((item) => (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    borderRadius: '8px',
                    py: 1.1,
                    px: 1.75,
                    color: isActive(item.path) ? '#fff' : GRAY,
                    backgroundColor: isActive(item.path) ? ACTIVE_BG : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      color: '#fff',
                      backgroundColor: isActive(item.path) ? ACTIVE_BG : HOVER_BG,
                    },
                  }}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            {/* Analytics group */}
            <ListItem disablePadding sx={{ mb: 0.25, mt: 0.5 }}>
              <ListItemButton
                onClick={() => setAnalyticsOpen((p) => !p)}
                sx={{
                  borderRadius: '8px',
                  py: 1.1,
                  px: 1.75,
                  color: anyAnalyticsActive ? '#fff' : GRAY,
                  backgroundColor: anyAnalyticsActive ? ACTIVE_BG : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: '#fff',
                    backgroundColor: anyAnalyticsActive ? ACTIVE_BG : HOVER_BG,
                  },
                }}
              >
                <ListItemText
                  primary="Analytics"
                  primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                />
                {analyticsOpen ? (
                  <ExpandLessIcon sx={{ fontSize: 18, color: GRAY }} />
                ) : (
                  <ExpandMoreIcon sx={{ fontSize: 18, color: GRAY }} />
                )}
              </ListItemButton>
            </ListItem>

            <Collapse in={analyticsOpen || anyAnalyticsActive} timeout="auto">
              <List disablePadding sx={{ pl: 1.5, pb: 0.25 }}>
                {ANALYTICS_ITEMS.map((item) => (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      href={item.path}
                      onClick={() => setDrawerOpen(false)}
                      sx={{
                        borderRadius: '8px',
                        py: 0.9,
                        px: 1.5,
                        gap: 1,
                        color: isActive(item.path) ? '#fff' : GRAY,
                        backgroundColor: isActive(item.path) ? ACTIVE_BG : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          color: '#fff',
                          backgroundColor: isActive(item.path) ? ACTIVE_BG : HOVER_BG,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: isActive(item.path) ? PRIMARY : GRAY,
                          display: 'flex',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </Box>

        {/* Drawer footer */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{ fontSize: '0.72rem', color: 'rgba(100, 116, 139, 0.8)', letterSpacing: '0.02em' }}
          >
            LazyScaper — AI-powered job hunting
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
