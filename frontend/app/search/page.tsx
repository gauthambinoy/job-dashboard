'use client';

import { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Button, Chip, Stack, Paper, Checkbox,
  FormControlLabel, Divider, Alert, CircularProgress, Collapse, TextField, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchResults from './results';

// ── 10 Domains × 4 subcategories × ~13 titles = 50+ titles per domain ──────

interface SubDomain { name: string; titles: string[] }
interface Domain { name: string; icon: string; subs: SubDomain[] }

const DOMAINS: Domain[] = [
  { name: 'Software Engineering', icon: '💻', subs: [
    { name: 'General', titles: ['Software Engineer', 'Software Developer', 'Application Developer', 'Web Developer', 'Programmer', 'Systems Developer', 'Platform Engineer', 'R&D Engineer', 'Solutions Developer', 'Automation Engineer', 'Integration Developer', 'Software Consultant', 'Research Engineer'] },
    { name: 'Languages', titles: ['Python Developer', 'Java Developer', 'C++ Developer', 'C# Developer', '.NET Developer', 'Go Developer', 'Rust Developer', 'PHP Developer', 'Ruby Developer', 'Kotlin Developer', 'Scala Developer', 'Elixir Developer', 'TypeScript Developer'] },
    { name: 'Embedded & Systems', titles: ['Embedded Software Engineer', 'Firmware Engineer', 'Systems Programmer', 'RTOS Developer', 'Device Driver Developer', 'IoT Developer', 'Embedded C Developer', 'Microcontroller Engineer', 'FPGA Developer', 'Real-Time Systems Engineer', 'BSP Engineer', 'Embedded Linux Developer'] },
    { name: 'Tools & Testing', titles: ['Build Engineer', 'Release Engineer', 'Toolchain Developer', 'SDK Developer', 'CI/CD Developer', 'Test Framework Developer', 'Static Analysis Engineer', 'Compiler Engineer', 'IDE Plugin Developer', 'Developer Tools Engineer', 'Infrastructure Developer', 'Package Maintainer'] },
  ]},
  { name: 'Frontend Development', icon: '🎨', subs: [
    { name: 'Core', titles: ['Frontend Developer', 'Frontend Engineer', 'UI Developer', 'UI Engineer', 'Web UI Developer', 'JavaScript Developer', 'TypeScript Developer', 'HTML/CSS Developer', 'Web Developer', 'Browser Engineer', 'Frontend Architect', 'Design Technologist'] },
    { name: 'React Ecosystem', titles: ['React Developer', 'React Engineer', 'Next.js Developer', 'React Native Developer', 'Redux Developer', 'Gatsby Developer', 'Remix Developer', 'React Full Stack Developer', 'React UI Engineer', 'React Component Developer', 'Server Components Developer', 'React Performance Engineer'] },
    { name: 'Other Frameworks', titles: ['Angular Developer', 'Vue Developer', 'Vue.js Engineer', 'Svelte Developer', 'Nuxt.js Developer', 'Ember Developer', 'Backbone Developer', 'Lit Developer', 'Solid.js Developer', 'Qwik Developer', 'Astro Developer', 'Alpine.js Developer', 'HTMX Developer'] },
    { name: 'Styling & Motion', titles: ['CSS Engineer', 'SASS Developer', 'Tailwind Developer', 'Styled Components Developer', 'Motion Designer', 'Animation Developer', 'WebGL Developer', 'Three.js Developer', 'Canvas Developer', 'SVG Developer', 'Accessibility Engineer', 'Web Performance Engineer', 'Progressive Web App Developer'] },
  ]},
  { name: 'Backend Development', icon: '⚙️', subs: [
    { name: 'Node.js / JS', titles: ['Backend Developer', 'Backend Engineer', 'Node.js Developer', 'Node.js Engineer', 'Express.js Developer', 'NestJS Developer', 'Fastify Developer', 'Deno Developer', 'Bun Developer', 'Koa Developer', 'Hapi Developer', 'API Developer', 'Server-Side Developer'] },
    { name: 'Python', titles: ['Python Developer', 'Python Engineer', 'Django Developer', 'Flask Developer', 'FastAPI Developer', 'Tornado Developer', 'Celery Developer', 'Python Backend Developer', 'Python API Developer', 'Pyramid Developer', 'SQLAlchemy Developer', 'Python Microservices Developer'] },
    { name: 'Java / JVM', titles: ['Java Developer', 'Java Engineer', 'Spring Developer', 'Spring Boot Developer', 'Hibernate Developer', 'Quarkus Developer', 'Micronaut Developer', 'Kotlin Backend Developer', 'Scala Developer', 'Groovy Developer', 'Apache Kafka Developer', 'Java Microservices Developer', 'JVM Performance Engineer'] },
    { name: 'Other Languages', titles: ['Go Developer', 'Golang Developer', 'Rust Backend Developer', 'C# Backend Developer', 'ASP.NET Developer', 'PHP Developer', 'Laravel Developer', 'Symfony Developer', 'Ruby on Rails Developer', 'Ruby Developer', 'Elixir Developer', 'Phoenix Developer', 'Haskell Developer'] },
  ]},
  { name: 'Full Stack Development', icon: '🔗', subs: [
    { name: 'JavaScript Stack', titles: ['Full Stack Developer', 'Full Stack Engineer', 'MERN Stack Developer', 'MEAN Stack Developer', 'MEVN Stack Developer', 'T3 Stack Developer', 'JAMstack Developer', 'Full Stack TypeScript Developer', 'Full Stack React Developer', 'Full Stack Next.js Developer', 'Full Stack Node Developer', 'Isomorphic Developer'] },
    { name: 'Python Stack', titles: ['Full Stack Python Developer', 'Django Full Stack Developer', 'Flask Full Stack Developer', 'FastAPI Full Stack Developer', 'Python Web Developer', 'Wagtail Developer', 'Python Application Developer', 'Streamlit Developer', 'Python + React Developer', 'Data Web Application Developer', 'Python Product Engineer'] },
    { name: 'Other Stacks', titles: ['Full Stack Java Developer', 'Full Stack .NET Developer', 'Full Stack Ruby Developer', 'Full Stack PHP Developer', 'Full Stack Go Developer', 'Laravel Full Stack Developer', 'Rails Full Stack Developer', 'Blazor Developer', 'Spring + React Developer', 'Polyglot Developer', 'Multi-Stack Developer'] },
    { name: 'Product & Startup', titles: ['Product Engineer', 'Startup Engineer', 'Solo Developer', 'Founding Engineer', 'Generalist Engineer', 'Platform Engineer', 'Growth Engineer', 'Internal Tools Developer', 'Rapid Prototyper', 'MVP Developer', 'Technical Co-Founder', 'Indie Developer'] },
  ]},
  { name: 'Data Engineering & Science', icon: '📊', subs: [
    { name: 'Data Engineering', titles: ['Data Engineer', 'Data Pipeline Engineer', 'Data Platform Engineer', 'Big Data Engineer', 'ETL Developer', 'Data Integration Engineer', 'Data Architect', 'Data Warehouse Engineer', 'Streaming Engineer', 'Data Infrastructure Engineer', 'Data Modeler', 'Data Ops Engineer'] },
    { name: 'Analytics & BI', titles: ['Data Analyst', 'Business Analyst', 'BI Developer', 'BI Engineer', 'Analytics Engineer', 'Reporting Analyst', 'Insights Analyst', 'Product Analyst', 'Marketing Analyst', 'Financial Analyst', 'Tableau Developer', 'Power BI Developer', 'Looker Developer'] },
    { name: 'Data Science', titles: ['Data Scientist', 'Research Scientist', 'Applied Scientist', 'Quantitative Analyst', 'Statistical Analyst', 'Statistician', 'Quantitative Developer', 'Econometrician', 'Operations Research Analyst', 'Predictive Modeler', 'Risk Analyst', 'Actuarial Data Scientist'] },
    { name: 'Tools & Platforms', titles: ['Snowflake Developer', 'Databricks Engineer', 'BigQuery Engineer', 'Spark Developer', 'Kafka Engineer', 'Airflow Developer', 'dbt Developer', 'Hadoop Developer', 'Flink Developer', 'Redshift Developer', 'Fivetran Developer', 'Data Lake Engineer', 'Delta Lake Engineer'] },
  ]},
  { name: 'AI / Machine Learning', icon: '🧠', subs: [
    { name: 'ML Engineering', titles: ['Machine Learning Engineer', 'ML Engineer', 'MLOps Engineer', 'ML Platform Engineer', 'ML Infrastructure Engineer', 'Feature Store Engineer', 'Model Serving Engineer', 'ML Pipeline Developer', 'AutoML Developer', 'ML Reliability Engineer', 'Applied ML Engineer'] },
    { name: 'AI Engineering', titles: ['AI Engineer', 'AI Developer', 'AI Research Engineer', 'Applied AI Engineer', 'AI Architect', 'Generative AI Engineer', 'LLM Engineer', 'Prompt Engineer', 'AI Agent Developer', 'RAG Engineer', 'AI Solutions Engineer', 'Conversational AI Engineer', 'AI Product Engineer'] },
    { name: 'Deep Learning / NLP / CV', titles: ['Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer', 'Speech Recognition Engineer', 'Recommendation Systems Engineer', 'Neural Network Engineer', 'Transformer Engineer', 'Multimodal AI Engineer', 'Image Processing Engineer', 'OCR Developer', 'Video AI Engineer', 'Audio ML Engineer'] },
    { name: 'Research', titles: ['AI Researcher', 'ML Researcher', 'Research Scientist', 'AI Safety Engineer', 'AI Ethics Researcher', 'Alignment Researcher', 'Reinforcement Learning Engineer', 'Robotics Engineer', 'Autonomous Systems Engineer', 'Simulation Engineer', 'Computational Scientist', 'Algorithm Developer'] },
  ]},
  { name: 'DevOps & Cloud', icon: '☁️', subs: [
    { name: 'DevOps', titles: ['DevOps Engineer', 'DevOps Architect', 'DevOps Consultant', 'Site Reliability Engineer', 'SRE', 'Production Engineer', 'Reliability Engineer', 'Release Engineer', 'Build Engineer', 'CI/CD Engineer', 'Deployment Engineer', 'Platform Ops Engineer'] },
    { name: 'Cloud', titles: ['Cloud Engineer', 'Cloud Architect', 'Cloud Solutions Architect', 'AWS Engineer', 'AWS Solutions Architect', 'Azure Engineer', 'Azure Architect', 'GCP Engineer', 'Google Cloud Architect', 'Cloud Migration Engineer', 'Cloud Consultant', 'Multi-Cloud Engineer', 'FinOps Engineer'] },
    { name: 'Containers & IaC', titles: ['Kubernetes Engineer', 'Docker Engineer', 'Container Platform Engineer', 'Terraform Engineer', 'Ansible Engineer', 'Pulumi Developer', 'Helm Developer', 'Infrastructure as Code Engineer', 'GitOps Engineer', 'Service Mesh Engineer', 'Istio Developer', 'OpenShift Engineer'] },
    { name: 'Observability', titles: ['Infrastructure Engineer', 'Systems Engineer', 'Observability Engineer', 'Monitoring Engineer', 'Logging Engineer', 'Prometheus Engineer', 'Grafana Developer', 'Datadog Engineer', 'Incident Response Engineer', 'Chaos Engineer', 'Performance Engineer', 'Capacity Planning Engineer'] },
  ]},
  { name: 'Cybersecurity', icon: '🔒', subs: [
    { name: 'Application Security', titles: ['Security Engineer', 'Application Security Engineer', 'DevSecOps Engineer', 'Security Architect', 'Security Developer', 'Secure Code Reviewer', 'SAST/DAST Engineer', 'API Security Engineer', 'Container Security Engineer', 'Supply Chain Security Engineer', 'Security Automation Engineer'] },
    { name: 'Operations & Response', titles: ['SOC Analyst', 'Security Operations Engineer', 'Incident Response Analyst', 'SIEM Engineer', 'Cybersecurity Analyst', 'Threat Hunter', 'Threat Intelligence Analyst', 'Malware Analyst', 'Digital Forensics Analyst', 'Cyber Incident Manager', 'Blue Team Engineer'] },
    { name: 'Offensive Security', titles: ['Penetration Tester', 'Red Team Engineer', 'Ethical Hacker', 'Vulnerability Researcher', 'Bug Bounty Hunter', 'Exploit Developer', 'Offensive Security Engineer', 'Security Researcher', 'Attack Simulation Engineer', 'Social Engineering Tester', 'Web Application Pentester'] },
    { name: 'GRC & Identity', titles: ['IAM Engineer', 'Identity & Access Engineer', 'GRC Analyst', 'Privacy Engineer', 'Compliance Analyst', 'Risk Analyst', 'Cryptography Engineer', 'PKI Engineer', 'Cloud Security Engineer', 'Zero Trust Engineer', 'Data Protection Officer', 'Security Auditor'] },
  ]},
  { name: 'Mobile Development', icon: '📱', subs: [
    { name: 'iOS', titles: ['iOS Developer', 'iOS Engineer', 'Swift Developer', 'SwiftUI Developer', 'Objective-C Developer', 'iOS Architect', 'iOS Platform Engineer', 'Apple Watch Developer', 'tvOS Developer', 'iOS Performance Engineer', 'iOS Security Engineer', 'Apple Framework Developer'] },
    { name: 'Android', titles: ['Android Developer', 'Android Engineer', 'Kotlin Mobile Developer', 'Jetpack Compose Developer', 'Android Architect', 'Android Platform Engineer', 'Android NDK Developer', 'Wear OS Developer', 'Android TV Developer', 'Android Security Engineer', 'Android Performance Engineer'] },
    { name: 'Cross-Platform', titles: ['React Native Developer', 'Flutter Developer', 'Xamarin Developer', 'Ionic Developer', 'MAUI Developer', 'KMP Developer', 'Cross-Platform Developer', 'Capacitor Developer', 'Expo Developer', 'Progressive Web App Developer', 'Hybrid Mobile Developer', 'Mobile Web Developer'] },
    { name: 'General Mobile', titles: ['Mobile Developer', 'Mobile Engineer', 'Mobile Application Developer', 'Mobile Architect', 'Mobile QA Engineer', 'Mobile DevOps Engineer', 'Mobile Security Engineer', 'Mobile Platform Engineer', 'Mobile Performance Engineer', 'Mobile UI Developer', 'Mobile SDK Developer'] },
  ]},
  { name: 'QA & Testing', icon: '✅', subs: [
    { name: 'Automation', titles: ['Test Automation Engineer', 'Automation Engineer', 'SDET', 'Selenium Developer', 'Cypress Developer', 'Playwright Developer', 'Appium Developer', 'Robot Framework Developer', 'Test Framework Developer', 'E2E Test Engineer', 'Integration Test Engineer', 'Automation Architect'] },
    { name: 'Performance & Security', titles: ['Performance Test Engineer', 'Load Test Engineer', 'Performance Engineer', 'JMeter Developer', 'Gatling Developer', 'k6 Developer', 'Security Tester', 'Penetration Tester', 'Accessibility Tester', 'Chaos Test Engineer', 'Reliability Test Engineer', 'Stress Test Engineer'] },
    { name: 'Manual & Exploratory', titles: ['QA Engineer', 'QA Analyst', 'Quality Assurance Analyst', 'Test Analyst', 'Manual Tester', 'Exploratory Tester', 'Regression Tester', 'User Acceptance Tester', 'Beta Test Coordinator', 'Test Manager', 'QA Lead', 'Test Coordinator'] },
    { name: 'Specialized', titles: ['API Test Engineer', 'Database Tester', 'Mobile Test Engineer', 'Game Tester', 'Localization Tester', 'Embedded QA Engineer', 'Hardware Test Engineer', 'Visual Regression Tester', 'Contract Tester', 'Mutation Test Engineer', 'Test Data Engineer', 'Quality Coach'] },
  ]},
];

const EXPERIENCE_LEVELS = [
  { label: 'Graduate / Entry', value: 'graduate', color: '#22c55e' },
  { label: 'Junior (0-2 yrs)', value: 'junior', color: '#60a5fa' },
  { label: 'Mid-Level (2-5 yrs)', value: 'mid', color: '#a78bfa' },
  { label: 'Senior (5+ yrs)', value: 'senior', color: '#fb923c' },
  { label: 'Lead / Principal', value: 'lead', color: '#f472b6' },
];

const COUNTRIES = [
  { label: '🇮🇪 Ireland', value: 'Ireland', primary: true },
  { label: '🇬🇧 United Kingdom', value: 'United Kingdom', primary: true },
  { label: '🌍 Remote', value: 'Remote', primary: true },
  { label: '🇺🇸 USA', value: 'United States' },
  { label: '🇩🇪 Germany', value: 'Germany' },
  { label: '🇨🇦 Canada', value: 'Canada' },
  { label: '🇳🇱 Netherlands', value: 'Netherlands' },
  { label: '🇦🇺 Australia', value: 'Australia' },
  { label: '🇦🇪 Dubai', value: 'Dubai' },
];

export default function SearchPage() {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['graduate']);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['Ireland']);
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleSearch, setTitleSearch] = useState('');

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) =>
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item]);

  const toggleDomain = (d: Domain) => {
    const allTitles = d.subs.flatMap(s => s.titles);
    const allSelected = allTitles.every(t => selectedTitles.includes(t));
    if (allSelected) {
      setSelectedTitles(prev => prev.filter(t => !allTitles.includes(t)));
      setSelectedDomains(prev => prev.filter(x => x !== d.name));
    } else {
      setSelectedTitles(prev => [...new Set([...prev, ...allTitles])]);
      setSelectedDomains(prev => [...new Set([...prev, d.name])]);
    }
  };

  const toggleSub = (sub: SubDomain) => {
    const allSelected = sub.titles.every(t => selectedTitles.includes(t));
    setSelectedTitles(prev =>
      allSelected ? prev.filter(t => !sub.titles.includes(t)) : [...new Set([...prev, ...sub.titles])],
    );
  };

  const isDomainChecked = (d: Domain) => d.subs.flatMap(s => s.titles).every(t => selectedTitles.includes(t));
  const isDomainPartial = (d: Domain) => {
    const all = d.subs.flatMap(s => s.titles);
    const count = all.filter(t => selectedTitles.includes(t)).length;
    return count > 0 && count < all.length;
  };
  const isSubChecked = (s: SubDomain) => s.titles.every(t => selectedTitles.includes(t));
  const isSubPartial = (s: SubDomain) => {
    const count = s.titles.filter(t => selectedTitles.includes(t)).length;
    return count > 0 && count < s.titles.length;
  };

  const totalTitleCount = DOMAINS.reduce((sum, d) => sum + d.subs.reduce((s2, sub) => s2 + sub.titles.length, 0), 0);

  const selectAll = () => {
    const all = DOMAINS.flatMap(d => d.subs.flatMap(s => s.titles));
    setSelectedTitles(all);
    setSelectedDomains(DOMAINS.map(d => d.name));
  };
  const deselectAll = () => { setSelectedTitles([]); setSelectedDomains([]); };

  const handleSearch = () => {
    if (selectedTitles.length === 0) { setError('Select at least one domain or title.'); return; }
    setError(null);
    setSearching(true);
    setTimeout(() => { setSearching(false); setShowResults(true); }, 300);
  };

  if (showResults) {
    return <SearchResults filters={{ titles: selectedTitles.slice(0, 30), countries: selectedCountries, sources: [] }} onBack={() => setShowResults(false)} />;
  }

  const glass = { bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px' };

  return (
    <Box sx={{ minHeight: '100vh', py: 5, px: 2 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 42, height: 42, borderRadius: '12px', background: 'linear-gradient(135deg, #16a34a, #2563eb)' }}>
              <SearchIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="white">Search Jobs</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">10 domains · {totalTitleCount} job titles · Expandable with subcategories</Typography>
        </Box>

        <Stack spacing={3}>
          {/* ═══ DOMAINS ═══ */}
          <Paper elevation={0} sx={{ ...glass, p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={700} color="white">
                Tech Domains ({selectedTitles.length} titles selected)
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="Select All" size="small" clickable onClick={selectAll} sx={{ fontSize: '0.7rem', bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }} />
                <Chip label="Clear" size="small" clickable onClick={deselectAll} sx={{ fontSize: '0.7rem', bgcolor: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }} />
              </Stack>
            </Stack>

            <Stack spacing={0.5}>
              {DOMAINS.map((d) => {
                const isExpanded = expandedDomains.includes(d.name);
                const checked = isDomainChecked(d);
                const partial = isDomainPartial(d);
                const titleCount = d.subs.reduce((s, sub) => s + sub.titles.length, 0);
                const selectedCount = d.subs.flatMap(s => s.titles).filter(t => selectedTitles.includes(t)).length;

                return (
                  <Box key={d.name} sx={{ borderRadius: '12px', border: '1px solid', borderColor: checked ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.04)', bgcolor: checked ? 'rgba(34,197,94,0.04)' : 'transparent', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" sx={{ px: 2, py: 1.2, cursor: 'pointer', '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' } }} onClick={() => toggle(expandedDomains, d.name, setExpandedDomains)}>
                      <Checkbox size="small" checked={checked} indeterminate={partial} onClick={e => { e.stopPropagation(); toggleDomain(d); }} sx={{ p: 0.3, mr: 1, color: 'rgba(255,255,255,0.2)', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#22c55e' } }} />
                      <Typography sx={{ fontSize: '1.2rem', mr: 1 }}>{d.icon}</Typography>
                      <Typography sx={{ flex: 1, fontSize: '0.9rem', fontWeight: checked ? 700 : 600, color: checked ? '#f1f5f9' : 'rgba(156,163,175,1)' }}>{d.name}</Typography>
                      {selectedCount > 0 && <Chip label={`${selectedCount}/${titleCount}`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(34,197,94,0.12)', color: '#22c55e', mr: 1, '& .MuiChip-label': { px: 0.6 } }} />}
                      <Typography sx={{ fontSize: '0.7rem', color: 'rgba(107,114,128,1)', mr: 1 }}>{titleCount} titles</Typography>
                      {isExpanded ? <ExpandLessIcon sx={{ fontSize: 18, color: 'rgba(107,114,128,1)' }} /> : <ExpandMoreIcon sx={{ fontSize: 18, color: 'rgba(107,114,128,1)' }} />}
                    </Stack>

                    <Collapse in={isExpanded}>
                      <Box sx={{ px: 2, pb: 2 }}>
                        {d.subs.map((sub) => (
                          <Box key={sub.name} sx={{ mb: 1.5 }}>
                            <Stack direction="row" alignItems="center" sx={{ mb: 0.5, cursor: 'pointer' }} onClick={() => toggleSub(sub)}>
                              <Checkbox size="small" checked={isSubChecked(sub)} indeterminate={isSubPartial(sub)} onClick={e => { e.stopPropagation(); toggleSub(sub); }} sx={{ p: 0.2, mr: 0.8, color: 'rgba(255,255,255,0.15)', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#60a5fa' } }} />
                              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#60a5fa' }}>{sub.name}</Typography>
                              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(107,114,128,1)', ml: 1 }}>({sub.titles.length})</Typography>
                            </Stack>
                            <Stack direction="row" flexWrap="wrap" gap={0.4} sx={{ pl: 3.5 }}>
                              {sub.titles.map(t => {
                                const sel = selectedTitles.includes(t);
                                return (
                                  <Chip key={t} label={t} size="small" clickable onClick={() => toggle(selectedTitles, t, setSelectedTitles)}
                                    sx={{
                                      fontSize: '0.68rem', height: 24, fontWeight: sel ? 600 : 400, borderRadius: '8px',
                                      bgcolor: sel ? 'rgba(34,197,94,0.12)' : 'transparent',
                                      color: sel ? '#22c55e' : 'rgba(156,163,175,0.8)',
                                      border: `1px solid ${sel ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                      '&:hover': { bgcolor: sel ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.05)' },
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          </Box>
                        ))}
                      </Box>
                    </Collapse>
                  </Box>
                );
              })}
            </Stack>
          </Paper>

          {/* ═══ EXPERIENCE ═══ */}
          <Paper elevation={0} sx={{ ...glass, p: 3 }}>
            <Typography variant="body2" fontWeight={700} color="white" sx={{ mb: 2 }}>Experience Level</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {EXPERIENCE_LEVELS.map(lvl => {
                const sel = selectedLevels.includes(lvl.value);
                return <Chip key={lvl.value} label={lvl.label} clickable onClick={() => toggle(selectedLevels, lvl.value, setSelectedLevels)}
                  sx={{ px: 1, fontWeight: 600, fontSize: '0.82rem', height: 36, borderRadius: '10px', border: '1px solid', borderColor: sel ? `${lvl.color}50` : 'rgba(255,255,255,0.1)', bgcolor: sel ? `${lvl.color}15` : 'transparent', color: sel ? lvl.color : 'rgba(156,163,175,1)' }} />;
              })}
            </Stack>
          </Paper>

          {/* ═══ COUNTRIES ═══ */}
          <Paper elevation={0} sx={{ ...glass, p: 3 }}>
            <Typography variant="body2" fontWeight={700} color="white" sx={{ mb: 2 }}>Location</Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {COUNTRIES.map(c => {
                const sel = selectedCountries.includes(c.value);
                return <Chip key={c.value} label={c.label} clickable onClick={() => toggle(selectedCountries, c.value, setSelectedCountries)}
                  sx={{ fontWeight: 600, fontSize: '0.82rem', height: 36, borderRadius: '10px', border: '1px solid', borderColor: sel ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)', bgcolor: sel ? 'rgba(34,197,94,0.12)' : 'transparent', color: sel ? '#22c55e' : 'rgba(156,163,175,1)' }} />;
              })}
            </Stack>
          </Paper>

          {error && <Alert severity="warning" onClose={() => setError(null)} sx={{ borderRadius: '12px' }}>{error}</Alert>}

          {/* ═══ SEARCH ═══ */}
          <Button variant="contained" startIcon={searching ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />} onClick={handleSearch} disabled={searching} fullWidth
            sx={{ py: 1.6, fontWeight: 700, textTransform: 'none', borderRadius: '14px', fontSize: '1rem', background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', boxShadow: '0 6px 24px rgba(22,163,74,0.3)', '&:hover': { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' } }}>
            {searching ? 'Searching...' : `Search ${selectedTitles.length} Titles across ${selectedCountries.length || 'All'} Countries`}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
