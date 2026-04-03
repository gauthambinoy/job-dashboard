'use client';

import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
    secondary: { main: '#a855f7', light: '#c084fc', dark: '#9333ea' },
    background: { default: '#030712', paper: '#0a0f1e' },
    text: { primary: '#f1f5f9', secondary: '#94a3b8', disabled: '#475569' },
    divider: 'rgba(255,255,255,0.06)',
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#06b6d4' },
  },
  typography: {
    fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontWeight: 600, letterSpacing: '-0.02em' },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#030712' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, padding: '10px 24px', fontSize: '0.875rem' },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 20px rgba(99,102,241,0.3)' },
        },
        outlined: {
          borderColor: 'rgba(255,255,255,0.12)',
          '&:hover': { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.04)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 500, fontSize: '0.75rem' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.03)',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.12)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, minHeight: 44 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
      },
    },
  },
});

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
