# Component Usage Guide

## UI Components

### StatusBadge
Display color-coded application status badges.

```tsx
import StatusBadge from '@/app/components/StatusBadge';

// Basic usage
<StatusBadge status="applied" />

// With custom styling
<StatusBadge status="offered" className="text-lg" />

// Available statuses
// 'saved', 'applied', 'pending_response', 'interviewing', 'rejected', 'offered'
```

### MatchScore
Display job match percentage as a circular progress indicator.

```tsx
import MatchScore from '@/app/components/MatchScore';

// Small size (used in tables)
<MatchScore score={92} size="sm" showLabel={false} />

// Medium size (default)
<MatchScore score={85} size="md" />

// Large size (standalone display)
<MatchScore score={78} size="lg" />
```

### SalaryDisplay
Format and display salary ranges professionally.

```tsx
import SalaryDisplay from '@/app/components/SalaryDisplay';

// Range
<SalaryDisplay min={120000} max={160000} />
// Output: "$120K - $160K"

// From salary
<SalaryDisplay min={100000} />
// Output: "From $100K"

// Up to salary
<SalaryDisplay max={150000} />
// Output: "Up to $150K"

// Not specified
<SalaryDisplay />
// Output: "Not specified"
```

### SkillTag
Display individual skills as styled tags.

```tsx
import SkillTag from '@/app/components/SkillTag';

// Secondary variant (default)
<SkillTag skill="React" variant="secondary" />

// Primary variant
<SkillTag skill="AWS" variant="primary" />

// Outline variant
<SkillTag skill="JavaScript" variant="outline" />

// With remove handler
<SkillTag 
  skill="Go" 
  onRemove={() => removeSkill('Go')}
  variant="secondary"
/>
```

### DashboardCard
Reusable card component for displaying statistics and summaries.

```tsx
import DashboardCard from '@/app/components/DashboardCard';

// Basic card
<DashboardCard
  title="Total Applications"
  value="24"
  subtitle="Active applications"
  icon="📊"
/>

// With trend
<DashboardCard
  title="Average Match"
  value="82%"
  subtitle="Across all jobs"
  icon="⭐"
  trend={{ value: 12, direction: 'up' }}
/>
```

### ConversionFunnel
Visual representation of job application funnel.

```tsx
import ConversionFunnel from '@/app/components/ConversionFunnel';

const stages = [
  { label: 'Saved', count: 15, color: 'bg-blue-600' },
  { label: 'Applied', count: 8, color: 'bg-purple-600' },
  { label: 'Interviewing', count: 2, color: 'bg-orange-600' },
  { label: 'Offered', count: 1, color: 'bg-green-600' },
];

<ConversionFunnel stages={stages} />
```

## Page Components

### Tracker Page
Application tracking dashboard at `/tracker`

Features:
- Status overview cards (6 total)
- Filterable, sortable job table
- Inline status changes
- Expandable notes section
- Delete functionality
- Quick statistics

Mock data includes 8 jobs with realistic company data.

### Analytics Page
Job market analysis dashboard at `/analytics`

Features:
- Summary statistics cards
- Match distribution bar chart
- Jobs by country bar chart
- Salary band distribution
- Domain breakdown
- Cluster performance table
- Key insights and recommendations
- Multi-level filtering

Mock data includes 15 jobs across multiple countries and domains.

### Cluster Details Page
Cluster-specific analysis at `/analytics/clusters?cluster=C-001`

Features:
- Cluster selector
- Cluster summary statistics
- Smart recommendations
- Skills analysis
- Job listings for cluster
- CV strategy guide
- Selection via query parameter

Default clusters:
- C-001: Backend Engineering (8 jobs)
- C-002: Cloud Architecture (2 jobs)
- C-003: Mobile Development (3 jobs)
- C-004: Full Stack (2 jobs)

## Data Types

### Job Interface
```typescript
interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  status: 'saved' | 'applied' | 'pending_response' | 'interviewing' | 'rejected' | 'offered';
  match: number;
  cluster: string;
  domain?: string;
  appliedDate?: string;
  nextStep?: string;
  minSalary?: number;
  maxSalary?: number;
  notes?: string;
  skills?: string[];
}
```

### Cluster Interface
```typescript
interface Cluster {
  id: string;
  domain: string;
  jobCount: number;
  avgMatch: number;
  topSkills: string[];
  appliedCount: number;
  offeredCount: number;
}
```

## Styling Customization

### Tailwind Classes Used
- **Spacing**: px-6, py-4, gap-4, etc.
- **Colors**: bg-blue-600, text-gray-900, border-gray-200, etc.
- **Layout**: grid, flex, w-full, h-screen, etc.
- **Typography**: text-lg, font-semibold, font-mono, etc.
- **Effects**: shadow-sm, rounded-lg, border, etc.
- **Responsive**: sm:, md:, lg: prefixes

### Color Palette
```css
/* Primary Colors */
Blue: #3b82f6 (bg-blue-600)
Purple: #a855f7 (bg-purple-600)
Green: #10b981 (bg-green-600)
Red: #ef4444 (bg-red-600)
Orange: #f97316 (bg-orange-600)
Yellow: #eab308 (bg-yellow-400)

/* Neutral Colors */
Gray-50: #f9fafb
Gray-100: #f3f4f6
Gray-200: #e5e7eb
Gray-600: #4b5563
Gray-900: #111827
```

## Common Patterns

### Filtering and Sorting
```typescript
// Filtering
const filtered = jobs.filter(j => j.status === filterValue);

// Sorting
const sorted = filtered.sort((a, b) => {
  if (sortBy === 'match') return b.match - a.match;
  return a.company.localeCompare(b.company);
});
```

### Status Change Handler
```typescript
const handleStatusChange = (jobId: string, newStatus: string) => {
  setJobs(jobs.map(j => 
    j.id === jobId ? { ...j, status: newStatus } : j
  ));
  // TODO: Call API endpoint to persist change
};
```

### Notes Update Handler
```typescript
const handleNotesChange = (jobId: string, notes: string) => {
  setJobs(jobs.map(j => 
    j.id === jobId ? { ...j, notes } : j
  ));
  // TODO: Call API endpoint to persist change
};
```

## API Integration Checklist

When connecting to a real backend, implement:

1. **Fetch Jobs**
   - GET `/api/jobs` - Get all jobs
   - GET `/api/jobs?status=applied` - Filter by status
   - GET `/api/jobs?cluster=C-001` - Filter by cluster

2. **Update Job**
   - PATCH `/api/jobs/{id}` - Update job details
   - Include: status, notes, appliedDate, nextStep

3. **Delete Job**
   - DELETE `/api/jobs/{id}` - Remove job

4. **Get Analytics**
   - GET `/api/analytics/summary` - Summary statistics
   - GET `/api/analytics/clusters` - Cluster breakdown
   - GET `/api/analytics/match-distribution` - Distribution data

5. **Get Cluster Details**
   - GET `/api/clusters/{id}` - Specific cluster
   - GET `/api/clusters/{id}/jobs` - Jobs in cluster

## Performance Optimization Tips

1. **Memoization**: Use useMemo for expensive calculations
2. **Pagination**: Add pagination for large job lists
3. **Virtualization**: Use react-window for large tables
4. **Image Optimization**: Use Next.js Image component for logos
5. **Code Splitting**: Use dynamic imports for heavy components
6. **Caching**: Implement query caching for API responses

## Accessibility Features

- Semantic HTML elements (table, thead, tbody, th, td)
- Proper heading hierarchy (h1, h2, h3)
- Form labels and aria-labels where needed
- Color contrast ratios meet WCAG standards
- Keyboard navigation support
- Focus visible states

## Testing Examples

```typescript
// Test status badge rendering
it('renders correct color for status', () => {
  const { container } = render(<StatusBadge status="offered" />);
  expect(container).toHaveClass('bg-green-100');
});

// Test match score calculation
it('displays correct percentage', () => {
  const { container } = render(<MatchScore score={85} />);
  expect(container).toHaveTextContent('85%');
});

// Test table filtering
it('filters jobs by status', () => {
  // Set filter to 'applied'
  // Expect only applied jobs to show
});
```

