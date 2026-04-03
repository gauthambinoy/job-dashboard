# Dashboard Visual Guide & Component Architecture

## Tracker Dashboard Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    PREMIUM HEADER                           │
│            Application Tracker (5xl, bold)                  │
│      Monitor applications in real-time (indigo text)        │
│  Background: Indigo->Purple gradient with blur effects     │
└─────────────────────────────────────────────────────────────┘

┌─────┬─────┬─────┬─────┬─────┬─────┐
│ Saved │Applied│Pending│Interview│Rejected│Offered│
│  [0]  │ [100] │ [200] │  [300]  │ [400] │ [500] │
│ Gradient gradient gradient gradient gradient gradient │
│ Blue  Cyan Yellow Purple  Red  Green  │
│ Animated counters - Hover scale + glow │
└─────┴─────┴─────┴─────┴─────┴─────┘

┌────────────────────────────────────────────────────────┐
│              FILTER SECTION (Glassmorphic)            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Search   │ │ Status   │ │ Sort By  │ │  Reset   │ │
│  │ Company  │ │ Dropdown │ │ Dropdown │ │ Button   │ │
│  │ Title    │ │          │ │          │ │ Indigo   │ │
│  │ Location │ │          │ │          │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  White/10 bg, White/20 borders, Indigo focus rings   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│         PREMIUM DATA TABLE (Glassmorphic)             │
│ ┌───────────────────────────────────────────────────┐ │
│ │ Company │ Title │ Location │ Status │ Match │ ... │ │
│ ├───────────────────────────────────────────────────┤ │
│ │ Google  │Senior│ Dublin   │ Applied│ 92%   │ ... │ │ ← Row 1
│ │         │      │          │        │       │     │ │   Hover: bg-white/5
│ ├───────────────────────────────────────────────────┤ │
│ │ Meta    │Backend│ Dublin  │ Saved  │ 88%   │ ... │ │ ← Row 2
│ ├───────────────────────────────────────────────────┤ │
│ │ [Expandable row - Notes editor]                  │ │
│ └───────────────────────────────────────────────────┘ │
│ Each row clickable to expand notes                    │
└────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  Avg Match Score │ Total Apps       │ Active Interviews│
│                  │                  │                  │
│      85.2%       │        5         │        2         │
│  (Cyan gradient) │  (Cyan color)    │  (Green color)   │
│                  │                  │                  │
└──────────────────┴──────────────────┴──────────────────┘
     Footer Stats Section
```

## Analytics Dashboard Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    PREMIUM HEADER                           │
│             Analytics Dashboard (5xl, bold)                 │
│      Deep insights into your job opportunities             │
│  Background: Indigo->Purple gradient with blur effects     │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│              FILTER SECTION (Glasmorphic)             │
│  ┌──────────────────┐ ┌────────────────────────────┐ │
│  │ Country Filter   │ │ Status Filter │ Reset Btn │ │
│  │ All/Ireland/UAE  │ │ All/Saved/etc │ Indigo    │ │
│  └──────────────────┘ └────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│   Total Jobs     │  Avg Match       │   Job Clusters   │
│      [0ms]       │     [100ms]      │     [200ms]      │
│       15         │      82.5%       │        4         │
│  (Blue grad)     │  (Purple grad)   │  (Green grad)    │
└──────────────────┴──────────────────┴──────────────────┘

┌────────────────────────────┬────────────────────────────┐
│  Match Score Distribution  │   Jobs by Country          │
│     [300ms delay]          │      [400ms delay]         │
│  ┌──────────────────────┐  │  ┌──────────────────────┐ │
│  │  Bar Chart           │  │  │  Bar Chart           │ │
│  │  80-100%: 8          │  │  │  Ireland: 9          │ │
│  │  60-80%: 5           │  │  │  UAE: 4              │ │
│  │  40-60%: 2           │  │  │  Australia: 2        │ │
│  │  <40%: 0             │  │  │                      │ │
│  └──────────────────────┘  │  └──────────────────────┘ │
└────────────────────────────┴────────────────────────────┘

┌────────────────────────────┬────────────────────────────┐
│  Salary Band Distribution  │   Domain Distribution      │
│     [500ms delay]          │      [600ms delay]         │
│  ┌──────────────────────┐  │  ┌──────────────────────┐ │
│  │  Bar Chart           │  │  │  Pie Chart           │ │
│  │  80-100K: 1          │  │  │  Backend: 8          │ │
│  │  100-120K: 3         │  │  │  Mobile: 3           │ │
│  │  120-150K: 6         │  │  │  Full Stack: 3       │ │
│  │  150-180K: 4         │  │  │  DevOps: 1           │ │
│  │  180K+: 1            │  │  │                      │ │
│  └──────────────────────┘  │  └──────────────────────┘ │
└────────────────────────────┴────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│         CLUSTER ANALYSIS TABLE (700ms delay)          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Cluster │ Domain │ Jobs │ Match │ Applied │ Skills │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ C-001   │Backend │  8   │ 85%   │   5     │Go,AWS │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ C-002   │Cloud   │  2   │ 81%   │   1     │Azure  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ C-003   │Mobile  │  3   │ 78%   │   2     │Swift  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ C-004   │FullStack│ 3   │ 81%   │   2     │JS,Py  │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│   Backend Focus  │Cluster C-001 Perf│ Salary Opps      │
│     [800ms]      │     [800ms]      │    [800ms]       │
│  🎯 8 positions  │ 📈 1 offer from  │  💰 Dublin:      │
│     85% match    │    5 applied     │     100-130K     │
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────┐
│ GraphQL Opportunity │
│  [800ms]          │
│  ⚡ 5 positions    │
│  Upskill area     │
└──────────────────┘
```

## Animation Timeline

### Tracker Page
```
0ms:   Header slide-down starts
100ms: Header slide-down completes, Stat cards fade-in-up starts
100ms: Stat card 1 (Saved) starts
200ms: Stat card 2 (Applied) starts
300ms: Stat card 3 (Pending) starts
400ms: Stat card 4 (Interviewing) starts
500ms: Stat card 5 (Rejected) starts
600ms: Stat card 6 (Offered) starts
600ms: Filter section starts fade-in-up
700ms: Table starts fade-in-up
800ms: Footer stats start fade-in-up
```

### Analytics Page
```
0ms:   Header slide-down starts
100ms: Header slide-down completes, Filter section fade-in-up starts
100ms: Stat card 1 (Total Jobs) fade-in-up starts
200ms: Stat card 2 (Avg Match) fade-in-up starts
300ms: Stat card 3 (Job Clusters) fade-in-up starts
300ms: Match Distribution chart fade-in-up starts
400ms: Jobs by Country chart fade-in-up starts
500ms: Salary Distribution chart fade-in-up starts
600ms: Domain Distribution chart fade-in-up starts
700ms: Cluster Table fade-in-up starts
800ms: Insight cards start fade-in-up
```

## Color Palette

### Status Colors
```
Saved:           #3B82F6 (Blue)
Applied:         #06B6D4 (Cyan)
Pending:         #EAB308 (Yellow)
Interviewing:    #A855F7 (Purple)
Rejected:        #EF4444 (Red)
Offered:         #10B981 (Green)
```

### Gradient Combinations
```
Stat Card Gradients:
- Blue:      from-blue-600 to-blue-800
- Cyan:      from-cyan-600 to-cyan-800
- Yellow:    from-yellow-600 to-yellow-800
- Purple:    from-purple-600 to-purple-800
- Red:       from-red-600 to-red-800
- Green:     from-green-600 to-green-800

Chart Colors (Recharts):
- Primary:   #3B82F6 (Blue)
- Secondary: #8B5CF6 (Purple)
- Success:   #10B981 (Green)
- Warning:   #F59E0B (Orange)
- Danger:    #EF4444 (Red)
- Info:      #06B6D4 (Cyan)
```

### Background & Overlay
```
Background Gradient:
  from-slate-900 via-slate-800 to-slate-900

Container Overlays:
  bg-white/5 (very subtle)
  border border-white/10 (subtle border)
  
Text Colors:
  Text Primary:   text-white (#F1F5F9)
  Text Secondary: text-white/60 (rgba(255,255,255,0.6))
  Text Muted:     text-white/40 (rgba(255,255,255,0.4))

Input/Focus:
  Bg:     bg-white/10
  Border: border-white/20
  Focus:  ring-2 ring-indigo-500
```

## Responsive Breakpoints

```
Mobile (< 768px):
- Stat cards: 1 column
- Filters: Stacked vertically
- Tables: Horizontal scroll
- Charts: Full width, reduced height

Tablet (768px - 1024px):
- Stat cards: 2 columns
- Filters: 2-3 columns
- Tables: Full width
- Charts: Stacked 2-column grid

Desktop (1024px+):
- Stat cards: 6 columns (tracker), 3 columns (analytics)
- Filters: 4 columns
- Tables: Full width
- Charts: 2-column grid
```

## Hover States

### Stat Cards
```
Default:  scale-100, shadow-md
Hover:    scale-105, shadow-2xl
          opacity-100 for glow effect
          Transition: 300ms ease-out
```

### Table Rows
```
Default:  hover:bg-transparent
Hover:    hover:bg-white/5
          Transition: 200ms ease-out
```

### Filter Inputs
```
Default:  bg-white/10, border-white/20
Focus:    border-white/40
          ring-2 ring-indigo-500
          Transition: 200ms ease-out
```

### Buttons
```
Default:  bg-indigo-600, shadow-md
Hover:    bg-indigo-700
          shadow-lg shadow-indigo-500/30
          Transition: 200ms ease-out
```

## Typography Hierarchy

```
Header Title:      text-5xl font-bold tracking-tight
Chart Title:       text-xl font-bold
Section Header:    text-lg font-semibold
Body Text:         text-base font-normal
Label Text:        text-xs font-semibold uppercase tracking-wider
Status Text:       text-sm font-medium
Stat Value:        text-5xl font-bold (counters)
```

## Box Shadows

```
Cards:
  Default: None (uses border for definition)
  Hover:   shadow-2xl (0 25px 50px)

Buttons:
  Default: shadow-md (0 4px 6px)
  Hover:   shadow-lg + glow effect

Glow Effects:
  Stat Cards:   0 0 30px rgba(99, 102, 241, 0.3)
  Containers:   box-shadow with blur
```

## Performance Considerations

### CSS Animations
- All animations use `transform` and `opacity` (GPU accelerated)
- Staggered delays prevent animation jank
- Total animation time: ~900ms per page load

### React Performance
- `useMemo` used for expensive calculations
- Filtered/sorted job lists memoized
- Chart data regenerated only when dependencies change

### Rendering
- Tables use virtual scrolling concept (scrollable divs)
- Charts use Recharts responsive containers
- Images would be lazy-loaded in production
