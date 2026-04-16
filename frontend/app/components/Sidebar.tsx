'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BarChartIcon from '@mui/icons-material/BarChart';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import PersonIcon from '@mui/icons-material/Person';
import FlagIcon from '@mui/icons-material/Flag';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Bolt from '@mui/icons-material/Bolt';
import DescriptionIcon from '@mui/icons-material/Description';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: <HomeIcon /> },
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Search Jobs', href: '/search', icon: <SearchIcon /> },
  { label: 'CV Studio', href: '/cv-studio', icon: <DescriptionIcon /> },
  { label: 'Graduates', href: '/graduates', icon: <SchoolIcon /> },
  { label: 'Tracker', href: '/tracker', icon: <BookmarkIcon /> },
  { divider: true },
  { label: 'Analytics', href: '/analytics', icon: <BarChartIcon /> },
  { label: 'Companies', href: '/companies', icon: <BusinessIcon /> },
  { label: 'Profile', href: '/profile', icon: <PersonIcon /> },
  { label: 'Goals', href: '/goals', icon: <FlagIcon /> },
];

const SIDEBAR_WIDTH_OPEN = 220;
const SIDEBAR_WIDTH_CLOSED = 64;

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <Box
      component="nav"
      sx={{
        width: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
        minWidth: open ? SIDEBAR_WIDTH_OPEN : SIDEBAR_WIDTH_CLOSED,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'rgba(3,7,18,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::-webkit-scrollbar': { width: 0 },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          px: open ? 2 : 1.2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          minHeight: 64,
        }}
      >
        {open ? (
          <>
            <Stack direction="row" spacing={1} alignItems="center" component={Link} href="/" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #16a34a, #2563eb)',
                }}
              >
                <Bolt sx={{ fontSize: 18, color: '#fff' }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                LazyScaper
              </Typography>
            </Stack>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.3)', p: 0.5 }}>
              <ChevronLeftIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={() => setOpen(true)} sx={{ color: 'rgba(255,255,255,0.4)', p: 0.5 }}>
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

      {/* Nav Items */}
      <Box sx={{ flex: 1, py: 1.5, px: open ? 1 : 0.5 }}>
        {NAV_ITEMS.map((item, i) => {
          if ('divider' in item) {
            return <Divider key={`d${i}`} sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />;
          }
          const active = isActive(item.href!);
          const btn = (
            <Box
              key={item.label}
              component={Link}
              href={item.href!}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: open ? 1.5 : 0,
                py: 1,
                mb: 0.3,
                borderRadius: '10px',
                textDecoration: 'none',
                justifyContent: open ? 'flex-start' : 'center',
                color: active ? '#22c55e' : 'rgba(156,163,175,1)',
                bgcolor: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                border: '1px solid',
                borderColor: active ? 'rgba(34,197,94,0.2)' : 'transparent',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: active ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#22c55e' : '#f1f5f9',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: 20,
                },
              }}
            >
              {item.icon}
              {open && (
                <Typography sx={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>
                  {item.label}
                </Typography>
              )}
            </Box>
          );

          if (!open) {
            return (
              <Tooltip key={item.label} title={item.label} placement="right" arrow>
                {btn}
              </Tooltip>
            );
          }
          return btn;
        })}
      </Box>

      {/* Footer */}
      {open && (
        <Box sx={{ px: 2, py: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(75,85,99,1)', textAlign: 'center' }}>
            Ireland Graduate Jobs 2026
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export { SIDEBAR_WIDTH_OPEN, SIDEBAR_WIDTH_CLOSED };
