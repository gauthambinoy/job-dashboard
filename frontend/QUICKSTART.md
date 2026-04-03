# Quick Start Guide - LazyScaper Frontend

## What's Been Built

A complete job application tracking and analytics dashboard with the following pages:

1. **Application Tracker** (`/tracker`) - Track all your job applications
2. **Analytics Dashboard** (`/analytics`) - Analyze job market opportunities
3. **Cluster Performance** (`/analytics/clusters`) - Deep dive into job clusters

## Getting Started

### 1. Install Dependencies (Already Done)
```bash
cd /home/gautham/lazyscaper/frontend
npm install
# Includes: chart.js, react-chartjs-2, and all base dependencies
```

### 2. Run Development Server
```bash
npm run dev
```
Access at: `http://localhost:3000`

### 3. Navigate to Features
- Tracker Dashboard: Click "Tracker" in navigation
- Analytics: Click "Analytics" in navigation
- Cluster Details: From analytics, click "View" on any cluster row

## File Locations

### Page Components
```
/app/tracker/page.tsx              - Application tracker dashboard
/app/analytics/page.tsx            - Job analysis dashboard
/app/analytics/clusters/page.tsx   - Cluster performance details
```

### UI Components
```
/app/components/StatusBadge.tsx    - Status color badges
/app/components/MatchScore.tsx     - Match percentage circles
/app/components/SalaryDisplay.tsx  - Formatted salary ranges
/app/components/SkillTag.tsx       - Skill tag component
/app/components/DashboardCard.tsx  - Reusable stat cards
/app/components/ConversionFunnel.tsx - Funnel visualization
/app/components/Header.tsx         - Navigation header (pre-existing)
```

## Key Features at a Glance

### Tracker Page Features
- 6 status overview cards with counts and percentages
- Sortable, filterable job table with inline editing
- Color-coded status changes via dropdown
- Expandable notes section for each job
- Delete functionality with confirmation
- Quick stats summary

### Analytics Page Features
- 3 summary statistic cards
- Match score distribution bar chart
- Jobs by country visualization
- Salary band distribution chart
- Top job domains breakdown
- Cluster performance table with skills
- 4 key insight cards with recommendations

### Cluster Detail Features
- Cluster selector with 4 options
- Summary statistics for selected cluster
- Smart recommendations section
- Top 5 required skills with visual priority
- All skills needed listed with count
- Full job listings for the cluster
- CV strategy guide

## Mock Data Included

### Sample Companies
Google, Meta, Amazon, Microsoft, Apple, Netflix, Stripe, Airbnb, Shopify, TikTok, Uber, Spotify, Twitter, LinkedIn, Pinterest

### Sample Data Points
- 15 total jobs across 4 clusters
- 3 countries: Ireland, Dubai, Australia
- Match scores: 75% - 92%
- All job statuses represented
- Realistic skill requirements
- Salary ranges: €100K - €200K

## Component Usage Examples

### Import and Use StatusBadge
```tsx
import StatusBadge from '@/app/components/StatusBadge';

// In your component:
<StatusBadge status="applied" />
<StatusBadge status="offered" className="text-lg" />
```

### Import and Use MatchScore
```tsx
import MatchScore from '@/app/components/MatchScore';

<MatchScore score={85} size="md" />
<MatchScore score={92} size="sm" showLabel={false} />
```

### Import and Use SkillTag
```tsx
import SkillTag from '@/app/components/SkillTag';

<SkillTag skill="React" variant="secondary" />
<SkillTag skill="AWS" variant="primary" />
```

## State Management

All pages use React hooks for state:
- `useState` - Local state management
- `useMemo` - Performance optimization for calculations
- `useSearchParams` - URL-based state for cluster selection

No external state management library needed for current implementation.

## Styling System

All components use Tailwind CSS classes:
- No CSS files needed (all inline)
- Responsive design built-in (sm:, md:, lg: breakpoints)
- Color palette predefined and consistent
- Easy to customize by changing Tailwind classes

## Next Steps to Enhance

### Phase 1: Backend Integration
1. Replace mock data with API calls
2. Implement persistent status changes
3. Add notes persistence
4. Real-time data updates

### Phase 2: User Features
1. User authentication
2. Personal job lists
3. Resume management
4. Interview scheduling

### Phase 3: Advanced Analytics
1. ML-based job recommendations
2. Salary insights
3. Market trend analysis
4. Skill gap identification

### Phase 4: Team Collaboration
1. Shared job tracking
2. Comments and discussions
3. Team analytics
4. Shared recommendations

## Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Chart.js Issues
```bash
# Ensure proper imports
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
```

### TypeScript Errors
- All components are properly typed with interfaces
- Mock data matches defined Job interface
- Check that imports use correct paths with @/ alias

### Styling Issues
- Tailwind classes are applied correctly
- Check that globals.css is imported in layout.tsx
- Ensure tailwind.config has proper content paths

## Testing the Application

### Manual Testing Checklist
- [ ] Load `/tracker` page without errors
- [ ] Filter jobs by different statuses
- [ ] Sort jobs by different columns
- [ ] Change job status via dropdown
- [ ] Expand and edit notes
- [ ] Delete a job with confirmation
- [ ] Load `/analytics` page with charts
- [ ] Filter analytics by country/status
- [ ] View cluster details via `/analytics/clusters?cluster=C-001`
- [ ] Switch between clusters
- [ ] Check responsive layout on mobile (DevTools)

## Database Schema (Future)

When implementing backend, use this schema:

```sql
-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  company VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  location VARCHAR,
  status ENUM('saved', 'applied', 'pending_response', 'interviewing', 'rejected', 'offered'),
  match_percentage INT,
  cluster_id VARCHAR,
  applied_date TIMESTAMP,
  next_step VARCHAR,
  min_salary INT,
  max_salary INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clusters table
CREATE TABLE clusters (
  id VARCHAR PRIMARY KEY,
  domain VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skills table
CREATE TABLE job_skills (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  skill VARCHAR NOT NULL
);
```

## API Endpoints (Future)

```
GET    /api/jobs                    - List all jobs
GET    /api/jobs?status=applied     - Filter jobs
POST   /api/jobs                    - Create job
PATCH  /api/jobs/:id                - Update job
DELETE /api/jobs/:id                - Delete job

GET    /api/analytics/summary       - Summary stats
GET    /api/clusters                - All clusters
GET    /api/clusters/:id            - Cluster details
GET    /api/clusters/:id/jobs       - Jobs in cluster
```

## Environment Variables (Future)

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=LazyScaper
```

## Deployment

Ready to deploy to Vercel:

```bash
# Push to GitHub
git push origin main

# Vercel automatically deploys
# Or use Vercel CLI:
npm install -g vercel
vercel
```

## Documentation Files

- `COMPONENTS_BUILT.md` - Complete component documentation
- `COMPONENT_USAGE.md` - Usage examples and patterns
- `QUICKSTART.md` - This file

## Support & Questions

Refer to the documentation files for:
- Detailed component prop definitions
- Design system and styling conventions
- Code patterns and best practices
- Testing examples
- Accessibility features

