'use client';

import { useState, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditNoteIcon from '@mui/icons-material/EditNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import CVPreview from '../components/CVPreview';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
interface CVSection {
  title: string;
  content: string;
}

function parseCVText(raw: string): { name: string; contact: string; sections: CVSection[] } {
  const lines = raw.trim().split('\n');
  if (!lines.length) return { name: '', contact: '', sections: [] };

  const name = lines[0]?.trim() || '';
  let contact = '';
  let startIdx = 1;

  // Second line is contact if it contains | or @ separators
  if (lines[1] && (lines[1].includes('|') || lines[1].includes('@'))) {
    contact = lines[1].trim();
    startIdx = 2;
  }

  const sections: CVSection[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect section headers: lines that are ALL CAPS and > 3 chars
    if (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /^[A-Z\s\/&]+$/.test(trimmed)) {
      if (currentTitle || currentLines.length) {
        sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
      }
      currentTitle = trimmed;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentTitle || currentLines.length) {
    sections.push({ title: currentTitle, content: currentLines.join('\n').trim() });
  }

  return { name, contact, sections };
}

// ------------------------------------------------------------------
// ATS keyword matcher
// ------------------------------------------------------------------
function calculateATSScore(cvText: string, jdText: string): { score: number; matched: string[]; missing: string[] } {
  if (!jdText.trim()) return { score: 0, matched: [], missing: [] };

  // Extract meaningful keywords from JD (multi-word and single-word)
  const jdLower = jdText.toLowerCase();
  const techPatterns = [
    'python', 'typescript', 'javascript', 'react', 'next.js', 'node.js',
    'langgraph', 'langchain', 'pytorch', 'tensorflow', 'openai',
    'aws', 'docker', 'kubernetes', 'terraform', 'ci/cd',
    'fastapi', 'flask', 'django', 'postgresql', 'redis', 'mongodb',
    'rag', 'multi-agent', 'agentic ai', 'llm', 'nlp', 'machine learning',
    'deep learning', 'data pipeline', 'microservices', 'rest api',
    'git', 'github actions', 'agile', 'scrum',
    'sql', 'nosql', 'graphql', 'gcp', 'azure',
  ];

  const jdKeywords = techPatterns.filter(kw => jdLower.includes(kw));
  // Also grab capitalized multi-word terms from JD
  const customMatches = jdText.match(/[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+/g) || [];
  customMatches.forEach(m => {
    const lower = m.toLowerCase();
    if (!jdKeywords.includes(lower) && lower.length > 5) jdKeywords.push(lower);
  });

  if (!jdKeywords.length) return { score: 0, matched: [], missing: [] };

  const cvLower = cvText.toLowerCase();
  const matched = jdKeywords.filter(kw => cvLower.includes(kw));
  const missing = jdKeywords.filter(kw => !cvLower.includes(kw));
  const score = Math.round((matched.length / jdKeywords.length) * 100);

  return { score, matched, missing };
}

// ------------------------------------------------------------------
// Main Page
// ------------------------------------------------------------------
export default function CVStudioPage() {
  const [cvText, setCvText] = useState('');
  const [jdText, setJdText] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' | 'info' }>({
    open: false, msg: '', severity: 'info',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const parsed = parseCVText(cvText);
  const ats = calculateATSScore(cvText, jdText);

  // Load a .txt file
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCvText(text);
      setSnackbar({ open: true, msg: `Loaded ${file.name}`, severity: 'success' });
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(cvText);
    setSnackbar({ open: true, msg: 'CV copied to clipboard', severity: 'success' });
  }, [cvText]);

  // Download as .txt
  const handleDownloadTxt = useCallback(() => {
    const blob = new Blob([cvText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${parsed.name.replace(/\s+/g, '_') || 'Untitled'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cvText, parsed.name]);

  // Print / PDF via browser
  const handlePrint = useCallback(() => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>CV — ${parsed.name}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; color: #111827; padding: 48px 56px; max-width: 794px; margin: 0 auto; }
        .cv-name { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 2px; }
        .cv-contact { font-size: 11px; color: #6b7280; margin-bottom: 20px; }
        .cv-section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 4px; margin: 18px 0 10px; }
        .cv-section-content { font-size: 12px; line-height: 1.65; white-space: pre-wrap; }
        .cv-section-content strong { font-weight: 600; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="cv-name">${parsed.name}</div>
      ${parsed.contact ? `<div class="cv-contact">${parsed.contact}</div>` : ''}
      ${parsed.sections.map(s => `
        <div class="cv-section-title">${s.title}</div>
        <div class="cv-section-content">${s.content.replace(/</g, '&lt;')}</div>
      `).join('')}
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }, [parsed]);

  // Mock generate — replace with real API call
  const handleGenerate = useCallback(async () => {
    if (!jdText.trim()) {
      setSnackbar({ open: true, msg: 'Paste a job description first', severity: 'error' });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: jdText }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `API returned ${res.status}`);
      }
      const data = await res.json();
      setCvText(data.cv_text);
      setActiveTab('preview');
      setSnackbar({ open: true, msg: 'CV generated!', severity: 'success' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed';
      setSnackbar({ open: true, msg, severity: 'error' });
    } finally {
      setGenerating(false);
    }
  }, [jdText]);

  const atsColor = ats.score >= 80 ? '#10b981' : ats.score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#030712' }}>
      {/* Top bar */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(12px)',
          bgcolor: 'rgba(3,7,18,0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
          CV Studio
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Upload .txt CV">
            <IconButton onClick={() => fileInputRef.current?.click()} sx={{ color: '#94a3b8' }}>
              <UploadFileIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy text">
            <IconButton onClick={handleCopy} disabled={!cvText} sx={{ color: '#94a3b8' }}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download .txt">
            <IconButton onClick={handleDownloadTxt} disabled={!cvText} sx={{ color: '#94a3b8' }}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton onClick={handlePrint} disabled={!cvText} sx={{ color: '#94a3b8' }}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <input ref={fileInputRef} type="file" accept=".txt,.text" hidden onChange={handleFileUpload} />
        </Box>
      </Box>

      {/* Main two-panel layout */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
        {/* ========== LEFT PANEL — Controls ========== */}
        <Box
          sx={{
            width: 420,
            minWidth: 420,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* JD input */}
          <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Job Description
            </Typography>
            <TextField
              multiline
              rows={6}
              fullWidth
              placeholder="Paste the job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.03)',
                  fontSize: '0.82rem',
                  color: '#e2e8f0',
                  borderRadius: '10px',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                  '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                },
              }}
            />
            <Button
              variant="contained"
              fullWidth
              startIcon={generating ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <AutoFixHighIcon />}
              disabled={generating || !jdText.trim()}
              onClick={handleGenerate}
              sx={{
                mt: 1.5,
                py: 1.2,
                fontWeight: 600,
                fontSize: '0.85rem',
                borderRadius: '10px',
                textTransform: 'none',
                bgcolor: '#6366f1',
                '&:hover': { bgcolor: '#4f46e5' },
                '&.Mui-disabled': { bgcolor: 'rgba(99,102,241,0.3)', color: 'rgba(255,255,255,0.4)' },
              }}
            >
              {generating ? 'Generating...' : 'Generate CV'}
            </Button>
          </Box>

          {/* ATS Score */}
          {cvText && jdText && (
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ATS Readiness
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={ats.score}
                    size={64}
                    thickness={5}
                    sx={{ color: atsColor, '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }}
                  />
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: atsColor }}>{ats.score}%</Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>
                    {ats.matched.length}/{ats.matched.length + ats.missing.length} keywords matched
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {ats.score >= 80 ? 'Strong match' : ats.score >= 50 ? 'Needs improvement' : 'Weak match'}
                  </Typography>
                </Box>
              </Box>
              {ats.matched.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5 }}>Matched</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {ats.matched.map(kw => (
                      <Chip key={kw} label={kw} size="small" sx={{
                        height: 22, fontSize: '0.68rem', bgcolor: 'rgba(16,185,129,0.12)', color: '#10b981',
                        border: '1px solid rgba(16,185,129,0.25)', '& .MuiChip-label': { px: 1 },
                      }} />
                    ))}
                  </Box>
                </Box>
              )}
              {ats.missing.length > 0 && (
                <Box>
                  <Typography sx={{ fontSize: '0.68rem', color: '#64748b', mb: 0.5 }}>Missing</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {ats.missing.map(kw => (
                      <Chip key={kw} label={kw} size="small" sx={{
                        height: 22, fontSize: '0.68rem', bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        border: '1px solid rgba(239,68,68,0.2)', '& .MuiChip-label': { px: 1 },
                      }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {/* Section chips */}
          {cvText && (
            <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sections
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                {parsed.sections.map((s) => (
                  <Chip key={s.title} label={s.title} size="small" sx={{
                    height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: 'rgba(99,102,241,0.1)',
                    color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)',
                    '& .MuiChip-label': { px: 1.2 },
                  }} />
                ))}
              </Box>
            </Box>
          )}

          {/* Edit / Preview toggle + raw editor */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {(['edit', 'preview'] as const).map(tab => (
                <Box
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  sx={{
                    flex: 1, py: 1.2, textAlign: 'center', cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize',
                    color: activeTab === tab ? '#6366f1' : '#64748b',
                    borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
                    '&:hover': { color: activeTab === tab ? '#6366f1' : '#94a3b8' },
                  }}
                >
                  {tab === 'edit' ? <EditNoteIcon sx={{ fontSize: 16 }} /> : <VisibilityIcon sx={{ fontSize: 16 }} />}
                  {tab}
                </Box>
              ))}
            </Box>
            {activeTab === 'edit' ? (
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <textarea
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder={'Paste your CV text here, or click Generate to create one from a job description...'}
                  style={{
                    width: '100%', height: '100%', minHeight: 400,
                    background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                    color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.7,
                    padding: '16px', fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {cvText ? (
                  <Box sx={{
                    bgcolor: '#fff', borderRadius: '8px', p: '36px 40px', color: '#111827',
                    maxWidth: 520, mx: 'auto', fontSize: '0.72rem', lineHeight: 1.6,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  }}>
                    <Box sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.02em' }}>{parsed.name}</Box>
                    {parsed.contact && (
                      <Box sx={{ fontSize: '0.68rem', color: '#6b7280', mt: 0.3 }}>{parsed.contact}</Box>
                    )}
                    {parsed.sections.map((s) => (
                      <Box key={s.title} sx={{ mt: 1.8 }}>
                        <Box sx={{
                          fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em',
                          color: '#6366f1', borderBottom: '2px solid #6366f1',
                          pb: 0.3, mb: 0.8, textTransform: 'uppercase',
                        }}>
                          {s.title}
                        </Box>
                        <Box sx={{ whiteSpace: 'pre-wrap', fontSize: '0.72rem', lineHeight: 1.6, color: '#1f2937' }}>
                          {s.content}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569', fontSize: '0.85rem' }}>
                    Paste a JD and generate, or upload a .txt file
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* ========== RIGHT PANEL — A4 Preview ========== */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            py: 4,
            px: 3,
            bgcolor: 'rgba(255,255,255,0.02)',
          }}
        >
          {cvText ? (
            <Box ref={printRef}>
              <CVPreview name={parsed.name} contact={parsed.contact} sections={parsed.sections} />
            </Box>
          ) : (
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%', maxWidth: 400, textAlign: 'center', gap: 2,
            }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <EditNoteIcon sx={{ fontSize: 36, color: '#6366f1' }} />
              </Box>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>
                No CV loaded
              </Typography>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
                Paste a job description on the left and hit Generate, or upload an existing .txt CV file.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '10px' }}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
