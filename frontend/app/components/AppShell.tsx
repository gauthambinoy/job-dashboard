'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Sidebar, { SIDEBAR_WIDTH_OPEN, SIDEBAR_WIDTH_CLOSED } from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{children}</>;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          ml: `${SIDEBAR_WIDTH_OPEN}px`,
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
