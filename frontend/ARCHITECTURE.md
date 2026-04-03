# LazyScaper Frontend - Architecture & Component Hierarchy

## Application Structure

```
frontend/
├── app/
│   ├── layout.tsx
│   │   └── Header (navigation)
│   │       └── NavItems: Profile, Search, Tracker, Analytics
│   │
│   ├── tracker/
│   │   └── page.tsx (Application Tracker Dashboard)
│   │       ├── DashboardCard (6 cards: Saved, Applied, Pending, Interviewing, Rejected, Offered)
│   │       ├── Filters Section (Status dropdown, Sort dropdown)
│   │       └── Table
│   │           ├── StatusBadge (in select)
│   │           ├── MatchScore (circular indicator)
│   │           └── Actions (Edit notes, Delete)
│   │
│   ├── analytics/
│   │   ├── page.tsx (Job Analysis Dashboard)
│   │   │   ├── DashboardCard (3 cards: Total Jobs, Avg Match, Clusters)
│   │   │   ├── Filters Section
│   │   │   ├── Charts
│   │   │   │   ├── Bar Chart (Match Distribution)
│   │   │   │   ├── Bar Chart (Jobs by Country)
│   │   │   │   └── Bar Chart (Salary Distribution)
│   │   │   ├── Top Domains (horizontal bars)
│   │   │   ├── Cluster Table
│   │   │   │   └── SkillTag (top 3 skills)
│   │   │   └── Insights Section (4 cards)
│   │   │
│   │   └── clusters/
│   │       └── page.tsx (Cluster Performance)
│   │           ├── Cluster Selector (4 cluster cards)
│   │           ├── DashboardCard (4 stats)
│   │           ├── Recommendations Box
│   │           ├── Skills Section
│   │           │   └── SkillTag (multiple variants)
│   │           ├── Jobs Table
│   │           │   ├── StatusBadge
│   │           │   ├── MatchScore
│   │           │   └── SkillTag
│   │           └── CV Strategy Guide
│   │
│   └── components/
│       ├── Header.tsx (existing)
│       ├── StatusBadge.tsx (6 status variants)
│       ├── MatchScore.tsx (circular progress)
│       ├── SalaryDisplay.tsx (salary formatting)
│       ├── SkillTag.tsx (3 variants)
│       ├── DashboardCard.tsx (stats display)
│       └── ConversionFunnel.tsx (funnel chart)
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── README files
```

## Component Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                     Root Layout                             │
│                   (layout.tsx)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Header (Navigation)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│            ┌─────────────┼─────────────┬──────────────┐    │
│            ▼             ▼             ▼              ▼    │
│         Tracker      Analytics      Clusters       Profile  │
│         Page        Page             Page           Page    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Tracker Page (/tracker)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   DashboardCard x6 (Status Overview)                  │ │
│  │   ├─ Saved (15)         ├─ Pending (3)              │ │
│  │   ├─ Applied (8)        ├─ Interviewing (2)        │ │
│  │   ├─ Rejected (1)       ├─ Offered (1)             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Filter & Sort Controls                              │ │
│  │   ├─ Status Filter Dropdown                          │ │
│  │   └─ Sort Dropdown (5 options)                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Jobs Table                                           │ │
│  │   ├─ Company (text)                                  │ │
│  │   ├─ Title (text)                                    │ │
│  │   ├─ Location (text)                                 │ │
│  │   ├─ Status (StatusBadge + Dropdown)                │ │
│  │   ├─ Match (MatchScore)                             │ │
│  │   ├─ Cluster (text)                                 │ │
│  │   ├─ Applied Date (text)                            │ │
│  │   ├─ Next Step (text)                               │ │
│  │   └─ Actions                                         │ │
│  │       ├─ Notes (expandable)                         │ │
│  │       └─ Delete (with confirmation)                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Quick Stats                                         │ │
│  │   ├─ Average Match Score                            │ │
│  │   ├─ Total Applications                             │ │
│  │   └─ Active Interviews                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Analytics Page (/analytics)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Summary Cards                                       │ │
│  │   ├─ Total Discovered (15)                          │ │
│  │   ├─ Avg Match Score (82.3%)                        │ │
│  │   └─ Total Clusters (4)                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Filters                                             │ │
│  │   ├─ Country Filter (All/Ireland/Dubai/Australia)   │ │
│  │   ├─ Status Filter (All/Saved/Applied/etc)         │ │
│  │   └─ Reset Button                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Charts Grid (2x2)                                  │ │
│  │   ├─ Match Distribution Chart                       │ │
│  │   │   ├─ 80%+ (histogram bars)                     │ │
│  │   │   ├─ 60-80% (bars)                             │ │
│  │   │   ├─ 40-60% (bars)                             │ │
│  │   │   └─ <40% (bars)                               │ │
│  │   ├─ Jobs by Country Chart                         │ │
│  │   │   ├─ Ireland (bar)                             │ │
│  │   │   ├─ Dubai (bar)                               │ │
│  │   │   └─ Australia (bar)                           │ │
│  │   ├─ Salary Distribution Chart                     │ │
│  │   └─ Top Domains (horizontal bar chart)            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Cluster Breakdown Table                            │ │
│  │   ├─ Cluster | Domain | Count | Avg% | Applied | ... │ │
│  │   ├─ C-001 | Backend | 8 | 85% | 3 | ... [View]   │ │
│  │   ├─ C-002 | Cloud | 2 | 82% | 1 | ... [View]     │ │
│  │   ├─ C-003 | Mobile | 3 | 77% | 1 | ... [View]    │ │
│  │   └─ C-004 | Full Stack | 2 | 87% | 1 | ... [View]│ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Key Insights (4 insight cards)                      │ │
│  │   ├─ Most matches in Backend Engineering           │ │
│  │   ├─ Best cluster conversion: C-001 (3/3)          │ │
│  │   ├─ Salary opportunity comparison                 │ │
│  │   └─ Top skill gap: GraphQL                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│        Cluster Details Page (/analytics/clusters)            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Cluster Selector (4 buttons)                       │ │
│  │   ├─ C-001: Backend Engineering [SELECTED]          │ │
│  │   ├─ C-002: Cloud Architecture                      │ │
│  │   ├─ C-003: Mobile Development                      │ │
│  │   └─ C-004: Full Stack                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Summary Cards (4)                                  │ │
│  │   ├─ Jobs in Cluster (8)                           │ │
│  │   ├─ Avg Match % (85%)                             │ │
│  │   ├─ Applied (3)                                    │ │
│  │   └─ Offers (1) [33% conversion]                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Smart Recommendations Box                          │ │
│  │   ├─ Use unified CV strategy                        │ │
│  │   ├─ Target priority opportunities                  │ │
│  │   └─ Conversion insights                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Skills Section                                     │ │
│  │   ├─ Top 5 Skills (with SkillTag)                  │ │
│  │   │   ├─ 1. Go (priority)                          │ │
│  │   │   ├─ 2. Kubernetes (priority)                  │ │
│  │   │   ├─ 3. AWS (priority)                         │ │
│  │   │   ├─ 4. SQL (secondary)                        │ │
│  │   │   └─ 5. GraphQL (secondary)                    │ │
│  │   └─ All Skills (15 total with SkillTag)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   Jobs Table (8 rows)                               │ │
│  │   ├─ Company | Title | Location | Status | Match% │ │
│  │   ├─ Google | Senior Backend | Dublin | Applied | 92% │ │
│  │   ├─ Meta | Backend Engineer | Dublin | Saved | 88%   │ │
│  │   ├─ Netflix | Senior Backend | Dubai | Interview | 86%│ │
│  │   └─ ... (5 more rows)                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │   CV Strategy Guide                                  │ │
│  │   ├─ Summary of Qualifications                      │ │
│  │   ├─ Experience to Highlight                        │ │
│  │   └─ Application Tips                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Component Reusability Matrix

| Component | Tracker | Analytics | Clusters | Times Used |
|-----------|---------|-----------|----------|------------|
| DashboardCard | 6x | 3x | 4x | 13 |
| StatusBadge | inline | - | inline | 2+ tables |
| MatchScore | inline | - | inline | 2+ tables |
| SkillTag | - | inline | 15+ uses | 15+ |
| SalaryDisplay | inline | - | - | 1 |
| ConversionFunnel | - | - | - | future |

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Mock Data (Current)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ jobs: Job[] (15 items)                          │  │
│  │ ├─ id, company, title, location                 │  │
│  │ ├─ status, match, cluster, domain               │  │
│  │ ├─ appliedDate, nextStep                        │  │
│  │ ├─ minSalary, maxSalary                         │  │
│  │ ├─ notes, skills                                │  │
│  │                                                  │  │
│  │ clusters: Cluster[] (4 items)                   │  │
│  │ ├─ id, domain, jobCount                         │  │
│  │ └─ avgMatch, topSkills, conversion stats        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
   │   Tracker   │ │  Analytics   │ │   Clusters   │
   │    Page     │ │     Page     │ │     Page     │
   │             │ │              │ │              │
   │ useMemo()   │ │ useMemo()    │ │ useMemo()    │
   │ filter      │ │ filter       │ │ filter       │
   │ sort        │ │ aggregate    │ │ aggregate    │
   │             │ │ calculate    │ │ calculate    │
   └────────────┬┘ └──────────────┘ └──────────────┘
                │
        ┌───────┴─────────┐
        ▼                 ▼
   ┌──────────────┐ ┌──────────────┐
   │   Local      │ │    Charts    │
   │   State      │ │ (Chart.js)   │
   │ (useState)   │ │              │
   │              │ │ Bar charts   │
   │ Filtering    │ │ Funnels      │
   │ Sorting      │ │ Visuals      │
   │ Editing      │ │              │
   └──────────────┘ └──────────────┘

┌─────────────────────────────────────────────────────────┐
│        Future API Integration (Phase 2)                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Backend API Endpoints                           │  │
│  │ ├─ GET /api/jobs                               │  │
│  │ ├─ PATCH /api/jobs/:id                         │  │
│  │ ├─ DELETE /api/jobs/:id                        │  │
│  │ ├─ GET /api/analytics/summary                  │  │
│  │ ├─ GET /api/clusters                           │  │
│  │ └─ GET /api/clusters/:id                       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## State Management Strategy

### Tracker Page
- Local state with useState
- useMemo for filtered/sorted jobs
- Handlers for status change, notes edit, delete

### Analytics Page
- Local state for filter selections
- useMemo for data aggregation
- Computed statistics from filtered data

### Cluster Details Page
- useSearchParams for cluster selection via URL
- useMemo for cluster-specific calculations
- Derived data from selected cluster

## Styling Architecture

```
Tailwind CSS Utility-First Approach
└─ Consistent color palette
   ├─ Blue: #3b82f6 (primary)
   ├─ Purple: #a855f7 (applied)
   ├─ Green: #10b981 (success)
   ├─ Red: #ef4444 (error)
   ├─ Orange: #f97316 (warning)
   ├─ Yellow: #eab308 (caution)
   └─ Gray: #6b7280 (neutral)

└─ Responsive Breakpoints
   ├─ Mobile: default
   ├─ Tablet: sm (640px), md (768px)
   └─ Desktop: lg (1024px), xl (1280px)

└─ Component Styling Patterns
   ├─ Rounded corners: rounded-lg
   ├─ Shadows: shadow-sm, shadow-md
   ├─ Borders: border border-gray-200
   ├─ Spacing: px-6 py-4 gap-4
   └─ Transitions: transition-colors, transition-all
```

## Performance Optimization Strategy

```
React Performance
├─ useMemo for calculations
│  ├─ Filtered job lists
│  ├─ Sorted data
│  ├─ Statistics aggregation
│  └─ Chart data generation
│
├─ Client-side operations
│  ├─ No unnecessary API calls
│  ├─ Efficient filtering logic
│  └─ Memoized re-renders
│
└─ Ready for optimization
   ├─ Code splitting (dynamic imports)
   ├─ Image optimization (next/image)
   ├─ Pagination (for large datasets)
   └─ Virtual scrolling (for long lists)
```

## Testing Architecture

```
Manual Testing
├─ Component rendering
├─ User interactions (click, type, select)
├─ Data filtering and sorting
├─ Chart rendering
├─ Responsive design
└─ Accessibility (keyboard nav, labels)

Automated Testing (Future)
├─ Unit tests (components)
├─ Integration tests (pages)
├─ E2E tests (user flows)
└─ Visual regression tests
```

## TypeScript Architecture

```
Type Safety
├─ Job interface
│  ├─ id: string
│  ├─ company: string
│  ├─ status: 'saved' | 'applied' | ...
│  ├─ match: number
│  ├─ cluster: string
│  └─ skills: string[]
│
├─ Component Props interfaces
│  ├─ StatusBadgeProps
│  ├─ MatchScoreProps
│  ├─ SkillTagProps
│  └─ DashboardCardProps
│
└─ Type-safe handlers
   ├─ handleStatusChange
   ├─ handleDelete
   └─ handleNotesChange
```

## Scalability Plan

```
Current Implementation (15 jobs)
└─ Works well for <100 jobs

Phase 1: 100-1000 jobs
├─ Add pagination
├─ Implement virtual scrolling
└─ Optimize table rendering

Phase 2: 1000-10,000 jobs
├─ Add search functionality
├─ Implement advanced filtering
├─ Database indexing
└─ Caching strategy

Phase 3: 10,000+ jobs
├─ Server-side rendering (SSR)
├─ Data streaming
├─ Advanced analytics engine
└─ ML recommendations
```

