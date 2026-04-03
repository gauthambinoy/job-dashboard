# LazyScaper - Pages Visual Reference

## Page Map

```
Homepage
    │
    ├─→ Profile Setup
    │   └─→ [Form fills user preferences]
    │
    └─→ Job Search
        ├─→ Search Results (Table view)
        │   └─→ Job Details [id]
        │       └─→ [View full job info]
        │
        └─→ Tracker
            └─→ [View all applications]
        
Analytics (accessible from header)
```

---

## 1. Home Page `/`

**Purpose:** Entry point and feature overview

**Key Elements:**
- Header with navigation
- Feature headline
- 3 feature cards (Setup Profile, Search Jobs, Track Applications)
- Feature highlights section
- Call-to-action buttons

**Navigation:**
- "Set Up Profile" → `/profile`
- "Search Jobs" → `/search`
- Profile nav → `/profile`
- Search nav → `/search`

**Visual Style:**
- Gradient background (blue to indigo)
- White cards with shadows
- Large typography
- Icons/emojis for visual interest

---

## 2. Profile Setup Page `/profile`

**Purpose:** User onboarding and preference collection

**Form Sections:**

```
┌─────────────────────────────────────────┐
│  Profile Setup                          │
├─────────────────────────────────────────┤
│                                         │
│  Skills (Multi-select dropdown)         │ ← Multi-select
│  [React, Node.js, TypeScript, ...]     │
│  ┌─────────────────────────────────┐   │
│  │ React ✕ Node.js ✕ TypeScript ✕ │   │ Tags with remove
│  └─────────────────────────────────┘   │
│                                         │
│  Years of Experience (Input)            │
│  [____5____]                            │
│                                         │
│  Education (Dropdown)                   │
│  [Select education level ▼]             │
│                                         │
│  Minimum Salary (Input)                 │
│  [_____80000_____]                      │
│                                         │
│  Maximum Salary (Input)                 │
│  [_____150000____]                      │
│                                         │
│  Target Countries (Multi-select)        │
│  [Ireland, Dubai ▼]                     │
│  ┌──────────────────────┐               │
│  │ Ireland ✕ Dubai ✕   │               │
│  └──────────────────────┘               │
│                                         │
│  Availability (Radio Buttons)           │
│  ○ Actively Looking                     │
│  ○ Passive                              │
│  ○ Planning to Relocate                 │
│                                         │
│  [ Save Profile ]  [ Cancel ]           │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Dropdown menus with checkboxes
- Tag display for selections
- Remove (X) button on each tag
- Form validation on submit
- Loading state during submission
- Success message

**State Updates:**
- Selected skills display as tags
- Remove button removes tag
- All fields pre-populated on edit

---

## 3. Job Search Page `/search`

**Purpose:** Filter and search for jobs

**Filter Form:**

```
┌──────────────────────────────────────────┐
│  Find Jobs                               │
├──────────────────────────────────────────┤
│                                          │
│  Domain (Multi-select)                   │
│  ┌────────────────────────────────────┐  │
│  ☑ Backend Engineering                │  │
│  ☑ Full Stack                         │  │
│  ☐ Frontend Engineering               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Country (Multi-select)                  │
│  [Ireland ▼]                             │
│  ┌──────────────────┐                    │
│  ☑ Ireland         │                    │
│  ☐ Dubai           │                    │
│  ☐ Australia       │                    │
│  └──────────────────┘                    │
│                                          │
│  Experience Level (Dropdown)             │
│  [All levels ▼]                          │
│                                          │
│  Salary Range (Sliders)                  │
│  Min: $50,000 ━━━●━━━━━━━━━━━ $300,000  │
│  Max: $100,000 ━━━━━━●━━━━━━━ $300,000  │
│                                          │
│  Your Availability (Dropdown)            │
│  [All statuses ▼]                        │
│                                          │
│  [ Search Jobs ]  [ Reset Filters ]      │
│                                          │
└──────────────────────────────────────────┘
```

**Features:**
- Dropdowns for single select
- Checkboxes for multi-select
- Dual sliders for salary range
- Live salary display
- Reset all filters button
- Tag display for active filters

**Transitions:**
- Clicking "Search Jobs" → Shows results
- "Back to Filters" link returns to this view

---

## 4. Search Results Page `/search`

**Purpose:** Display filtered job listings

**Results Table:**

```
Found 6 jobs matching your criteria

┌─────────────┬────────────────┬─────────────────┬──────────┬─────────┬──────────┐
│ Company     │ Title          │ Location        │ Salary   │ Match % │ Cluster  │
├─────────────┼────────────────┼─────────────────┼──────────┼─────────┼──────────┤
│ TechCorp    │ Senior Backend │ Dublin, Ireland │ $120-160k│ 92% ✓   │ C-001    │
│             │ Engineer       │                 │          │ GREEN   │          │
├─────────────┼────────────────┼─────────────────┼──────────┼─────────┼──────────┤
│ CloudNext   │ Full Stack Dev │ Dublin, Ireland │ $100-140k│ 85% ✓   │ C-001    │
│             │                │                 │          │ GREEN   │          │
├─────────────┼────────────────┼─────────────────┼──────────┼─────────┼──────────┤
│ DubaiTech   │ DevOps Engine  │ Dubai, UAE      │ $110-150k│ 78% ◐   │ C-002    │
│             │                │                 │          │ YELLOW  │          │
├─────────────┼────────────────┼─────────────────┼──────────┼─────────┼──────────┤
│ Sydney      │ React Dev      │ Sydney, Aus     │ $90-130k │ 72% ◐   │ C-003    │
│ Innov.      │                │                 │          │ YELLOW  │          │
└─────────────┴────────────────┴─────────────────┴──────────┴─────────┴──────────┘

Pagination:
[ Previous ] [ 1 ] [ 2 ] [ Next ]
```

**Features:**
- Sorted table with 6 columns
- Clickable job titles (links to `/jobs/[id]`)
- Color-coded match %:
  - 🟢 GREEN: 80%+ match
  - 🟡 YELLOW: 60-80% match
  - 🔴 RED: <60% match
- Pagination: 10 items per page
- Page numbers with active highlight
- Previous/Next buttons
- Back to filters link

**Interactions:**
- Click job title → Go to job details
- Click page number → Jump to page
- Click Previous/Next → Navigate pages

---

## 5. Job Details Page `/jobs/[id]`

**Purpose:** View full job information and match details

**Layout: 2 Column (Main + Sidebar)**

```
[ ← Back to Results ]

┌─────────────────────────────────┬──────────────────────┐
│ Main Content (2/3)              │ Sidebar (1/3)        │
├─────────────────────────────────┼──────────────────────┤
│                                 │                      │
│ Senior Backend Engineer          │  Your Match          │
│ TechCorp Ireland                 │  ┌────────────────┐  │
│                                 │  │   ◯ 92%         │  │
│ Location: Dublin, Ireland       │  │   ● (green pie) │  │
│ Salary: $120k - $160k           │  │   Excellent!    │  │
│ Type: Full-time                 │  │                 │  │
│ Posted: 2 days ago              │  │ 92% Match       │  │
│                                 │  │ 6 matching skills│  │
│ [ Save Job ]                    │  └────────────────┘  │
│                                 │                      │
├─────────────────────────────────┤  Match Breakdown     │
│ Job Description                 │  ─────────────────  │
│ ─────────────────               │  Skills: 6/6 ██████ │
│ We are looking for a...         │  You have: 6        │
│ [Full job description text...]  │  Missing: 0         │
│                                 │                      │
├─────────────────────────────────┤  ┌────────────────┐  │
│ Requirements                    │  │ Cluster Info   │  │
│ ─────────────────               │  │ C-001          │  │
│ Required Skills:                │  │ 3 similar      │  │
│ • Node.js (✓ you have this)    │  │ roles - 1 CV   │  │
│ • TypeScript (✓ you have)      │  └────────────────┘  │
│ • AWS (✓ you have)             │                      │
│ • PostgreSQL                    │  ┌────────────────┐  │
│ • Docker                        │  │ [ Apply Now ] │  │
│                                 │  │ [ View Orig ] │  │
│ Nice-to-Have:                   │  └────────────────┘  │
│ • GraphQL                       │                      │
│ • Kubernetes                    │                      │
│                                 │                      │
│ Experience: 5+ years            │                      │
│ Education: Bachelor's Degree    │                      │
│                                 │                      │
│ Soft Skills:                    │                      │
│ • Leadership                    │                      │
│ • Communication                 │                      │
│ • Problem-solving               │                      │
│                                 │                      │
│ Cluster: C-001 with 3 roles    │                      │
│ Use 1 CV for all cluster jobs  │                      │
│                                 │                      │
└─────────────────────────────────┴──────────────────────┘
```

**Features:**
- Full job description text
- Required skills (highlighted if you have them)
- Nice-to-have skills
- Experience requirements
- Education requirements
- Soft skills listed
- Match percentage pie chart
- Skills match progress bar
- Missing skills highlighted
- Cluster information
- Save job button (toggleable)
- Apply now button (opens link)
- Back to results button

**Interactions:**
- Hover over skills to see descriptions
- Click "Apply Now" opens original job link
- Click "Save Job" toggles saved state
- "Back to Results" returns to search results

---

## 6. Application Tracker Page `/tracker`

**Purpose:** Track job applications and interview progress

**Status Overview Cards:**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Applied      │ Interviewed  │ Rejected     │ Saved        │
│     1        │      1       │      1       │      1       │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Filter & Sort Controls:**

```
Filter by Status: [All Statuses ▼]
Sort by: [Applied Date (Newest) ▼]
[ Reset Filters ]
```

**Applications Table:**

```
┌────────┬────────────┬──────────┬──────────┬───────┬─────────┬────────────┐
│Company │Position   │Location │ Status   │ Match │ Cluster │Applied Date│
├────────┼────────────┼──────────┼──────────┼───────┼─────────┼────────────┤
│TechCorp│Senior BE  │Dublin   │[Applied▼]│ 92%  │ C-001  │ 2024-04-01 │
│        │Engineer   │Ireland  │          │ ●●● │        │            │
├────────┼────────────┼──────────┼──────────┼───────┼─────────┼────────────┤
│CloudNext│Full Stack │Dublin  │[Applied▼]│ 85%  │ C-001  │ 2024-04-02 │
│         │Developer  │Ireland │          │ ●●● │        │            │
├────────┼────────────┼──────────┼──────────┼───────┼─────────┼────────────┤
│DubaiTech│DevOps Eng │Dubai   │[Rejected▼]│ 78% │ C-002  │ 2024-03-30 │
│         │           │UAE     │          │ ●● │        │            │
└────────┴────────────┴──────────┴──────────┴───────┴─────────┴────────────┘

Quick Stats:
Average Match: 85.3%  |  Total Applications: 2  |  Active Interviews: 1
```

**Expandable Notes (Click row):**

```
Notes & Comments:
[___________________________________]
[___________________________________]
[___________________________________]

[ Done ]
```

**Features:**
- Status overview cards (6 types)
- Editable status dropdown on each row
- Match score badges
- Expandable notes section
- Delete button (with confirmation)
- Filter by status
- Sort options (Date, Match, Company, Title, Location)
- Reset filters button
- Quick statistics

**Interactions:**
- Click dropdown to change status
- Click notes icon (📝) to expand/edit
- Click delete (🗑️) to remove
- Change filter dropdown
- Click reset to return to default

---

## 7. Analytics Dashboard `/analytics`

**Purpose:** Visualize metrics and insights

**Dashboard Overview:**

```
┌────────────────┬────────────────┬────────────────┐
│ Metric 1       │ Metric 2       │ Metric 3       │
│ Value          │ Value          │ Value          │
└────────────────┴────────────────┴────────────────┘

Filter Controls:
Country: [All ▼]  Status: [All ▼]  Cluster: [All ▼]

┌─────────────────────────────────────────────────┐
│ Charts & Visualizations                         │
│ • Job distribution by domain                   │
│ • Conversion funnel (Saved → Applied → Offered)│
│ • Salary insights by location                  │
│ • Match percentage distribution                │
└─────────────────────────────────────────────────┘
```

**Features:**
- Metric cards with values
- Trend indicators (up/down)
- Filter controls
- Multiple chart types
- Conversion funnel
- Domain breakdown
- Salary analysis

---

## Navigation Flow

```
              Home Page
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
 Profile      Search      Analytics
    │            │
    │         Results ← Details ─┐
    │            │                 │
    │            └──────────────────┘
    │
    └──→ Tracker (always accessible)

Header Navigation available on all pages:
[ Home ] [ Profile ] [ Search ] [ Tracker ] [ Analytics ]
```

---

## Summary

| Page | Route | Purpose | Key Feature |
|------|-------|---------|------------|
| Home | `/` | Introduction | Landing CTAs |
| Profile | `/profile` | Setup | Multi-select form |
| Search | `/search` | Filters | Advanced filters |
| Results | `/search` | Display | Paginated table |
| Details | `/jobs/[id]` | View | Match breakdown |
| Tracker | `/tracker` | Track | Status management |
| Analytics | `/analytics` | Analyze | Metrics & charts |

All pages are responsive and work on mobile, tablet, and desktop devices.
