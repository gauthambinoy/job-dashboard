'use client';

import Box from '@mui/material/Box';

interface CVSection {
  title: string;
  content: string;
}

interface CVPreviewProps {
  name: string;
  contact: string;
  sections: CVSection[];
}

/**
 * A4 paper-style CV preview.
 * Renders on a white card with print-friendly proportions.
 */
export default function CVPreview({ name, contact, sections }: CVPreviewProps) {
  return (
    <Box
      sx={{
        width: 794,           // A4 width at 96dpi
        minHeight: 1123,      // A4 height at 96dpi
        bgcolor: '#ffffff',
        borderRadius: '6px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 12px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04)',
        p: '48px 56px',
        color: '#111827',
        fontFamily: "'Inter', 'Geist', -apple-system, sans-serif",
        position: 'relative',
        // Subtle top accent bar
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          borderRadius: '6px 6px 0 0',
          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
        },
      }}
    >
      {/* Name */}
      <Box
        sx={{
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#0f172a',
          lineHeight: 1.2,
        }}
      >
        {name}
      </Box>

      {/* Contact line */}
      {contact && (
        <Box
          sx={{
            fontSize: 11,
            color: '#64748b',
            mt: 0.5,
            mb: 0.5,
            letterSpacing: '0.01em',
          }}
        >
          {contact}
        </Box>
      )}

      {/* Thin rule under header */}
      <Box sx={{ borderBottom: '2px solid #6366f1', mt: 1.5, mb: 0.5, width: '100%' }} />

      {/* Sections */}
      {sections.map((section) => (
        <Box key={section.title} sx={{ mt: 2.5 }}>
          {/* Section title */}
          <Box
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#6366f1',
              pb: 0.5,
              mb: 1,
              borderBottom: '1.5px solid #e5e7eb',
            }}
          >
            {section.title}
          </Box>

          {/* Section content */}
          <Box
            sx={{
              fontSize: 12,
              lineHeight: 1.7,
              color: '#1f2937',
              whiteSpace: 'pre-wrap',
              '& strong': { fontWeight: 600 },
            }}
          >
            {renderContent(section.content)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

/**
 * Render section content with formatting heuristics:
 * - Lines starting with "•" or "-" become styled bullet points
 * - Lines matching "Title | Company | Location | Dates" get bolded
 */
function renderContent(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Bullet point
    if (/^[•\-\*]\s/.test(trimmed)) {
      elements.push(
        <Box key={i} sx={{ display: 'flex', gap: 1, ml: 1.5, mb: 0.3 }}>
          <Box sx={{ color: '#6366f1', fontWeight: 700, flexShrink: 0 }}>•</Box>
          <Box>{trimmed.replace(/^[•\-\*]\s*/, '')}</Box>
        </Box>
      );
    }
    // Experience/project header — contains | separators and looks like a title line
    else if (trimmed.includes('|') && !trimmed.startsWith('•')) {
      const parts = trimmed.split('|').map(p => p.trim());
      elements.push(
        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: i > 0 ? 1.5 : 0, mb: 0.3 }}>
          <Box>
            <Box component="span" sx={{ fontWeight: 700, color: '#0f172a', fontSize: 12.5 }}>{parts[0]}</Box>
            {parts[1] && <Box component="span" sx={{ color: '#475569', fontSize: 12 }}> — {parts[1]}</Box>}
            {parts[2] && <Box component="span" sx={{ color: '#64748b', fontSize: 11.5 }}> — {parts[2]}</Box>}
          </Box>
          {parts[3] && (
            <Box sx={{ fontSize: 11, color: '#6366f1', fontWeight: 600, flexShrink: 0, ml: 2 }}>{parts[3]}</Box>
          )}
        </Box>
      );
    }
    // Skill list with • separators on one line
    else if ((trimmed.match(/•/g) || []).length >= 3) {
      const skills = trimmed.split('•').map(s => s.trim()).filter(Boolean);
      elements.push(
        <Box key={i} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: 0.5 }}>
          {skills.map((skill, si) => (
            <Box key={si} sx={{
              display: 'inline-block', px: 1.2, py: 0.3, borderRadius: '6px', fontSize: 11,
              bgcolor: 'rgba(99,102,241,0.08)', color: '#4338ca', fontWeight: 500,
              border: '1px solid rgba(99,102,241,0.15)',
            }}>
              {skill}
            </Box>
          ))}
        </Box>
      );
    }
    // Empty line → small spacer
    else if (!trimmed) {
      elements.push(<Box key={i} sx={{ height: 6 }} />);
    }
    // Normal text
    else {
      elements.push(
        <Box key={i} sx={{ mb: 0.2 }}>{trimmed}</Box>
      );
    }
  });

  return elements;
}
