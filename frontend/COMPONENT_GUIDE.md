# LazyScaper Frontend - Complete Component Guide

## Overview
Complete Next.js frontend with TypeScript, Tailwind CSS, and React components for a job matching dashboard.

## File Structure
```
app/
├── components/
│   ├── Header.tsx              - Navigation header with active route highlighting
│   ├── PieChart.tsx            - SVG-based match percentage visualization
│   ├── MatchScore.tsx          - Circular progress indicator for match scores
│   ├── DashboardCard.tsx       - Generic statistic card component
│   ├── StatusBadge.tsx         - Status indicators with color coding
│   ├── SkillTag.tsx            - Reusable skill tag with remove button
│   ├── SalaryDisplay.tsx       - Formatted salary range display
│   └── ConversionFunnel.tsx    - Funnel chart for analytics
├── jobs/[id]/page.tsx          - Job details with match breakdown
├── profile/page.tsx            - User profile setup form
├── search/
│   ├── page.tsx                - Search filters form
│   └── results.tsx             - Job results table with pagination
├── tracker/page.tsx            - Application tracking dashboard
├── analytics/page.tsx          - Analytics and metrics dashboard
├── layout.tsx                  - Root layout with Header
├── page.tsx                    - Home landing page
└── globals.css                 - Global Tailwind styles
```

## Pages Built

### 1. Home (/)
- Landing page with feature overview
- Quick start CTAs for Profile and Search
- Feature highlights with icons

### 2. Profile Setup (/profile)
- Multi-select skills dropdown with tag display
- Years of experience numeric input
- Education level selector
- Salary range inputs (min/max)
- Target countries multi-select
- Availability radio buttons
- Form submission to API

### 3. Search (/search)
- Domain multi-select filter
- Country multi-select filter
- Experience level dropdown
- Salary range dual sliders
- Availability status filter
- Search and Reset buttons
- Transitions to results view

### 4. Search Results (/search - conditional)
- Responsive table with 6 columns
- Company, Title, Location, Salary, Match%, Cluster ID
- Color-coded match percentages
- Pagination (10 items per page)
- Clickable titles linking to job details
- Back to filters button

### 5. Job Details (/jobs/[id])
- Full job description text
- Requirements with highlighted skills
- Match breakdown visualization
- Cluster information card
- Save job and Apply buttons
- Pie chart match indicator

### 6. Tracker (/tracker)
- Status overview cards (6 statuses)
- Comprehensive applications table
- Editable status dropdown
- Expandable notes section
- Delete functionality
- Filter and sort controls
- Quick statistics

### 7. Analytics (/analytics)
- Dashboard metric cards
- Charts and visualizations
- Cluster analysis
- Filter controls

## Components Reference

### Header Component
- Responsive navigation bar
- Active route highlighting
- Logo and branding
- Sign in placeholder
- Mobile-friendly menu (ready for enhancement)

### PieChart Component
- SVG-based implementation
- Animated on load
- Color-coded by match percentage
- Display percentage and status text

### MatchScore Component
- Circular progress indicator
- Three size options: sm, md, lg
- Color scale: Green (80+), Blue (60-79), Yellow (40-59), Red (0-39)
- Optional label display

### DashboardCard Component
- Title and value display
- Optional subtitle
- Optional icon/emoji
- Optional trend indicator
- Hover shadow effect

### StatusBadge Component
- Color-coded for 6 status types
- Compact display
- Used in tracker and tables

### SkillTag Component
- Supports 3 variants: primary, secondary, outline
- Optional remove button
- Compact sizing

### SalaryDisplay Component
- Formats numbers as K/M shorthand
- Handles min-only, max-only, and range formats
- Shows "Not specified" if empty

### ConversionFunnel Component
- Visual funnel with percentages
- Conversion rate calculation
- Summary statistics

## Styling

### Color Scheme
- Primary: Blue (#2563eb)
- Success: Green (#16a34a)
- Warning: Yellow (#eab308)
- Danger: Red (#dc2626)
- Neutral: Gray palette

### Responsive Design
- Mobile first approach
- Breakpoints: sm, md, lg, xl
- Full responsive tables with horizontal scroll
- Stacked layouts on mobile

### Common Styles
- Rounded corners: 0.5rem (8px)
- Shadows: md, sm variations
- Spacing: 4px, 8px, 16px, 24px base units
- Typography: Geist font family

## Key Features

✓ Multi-select dropdowns with tag management
✓ Form validation and error handling
✓ Color-coded match percentages
✓ Pagination with navigation
✓ Editable table rows
✓ Expandable sections
✓ Responsive design
✓ TypeScript type safety
✓ Mock data for testing
✓ SVG-based charts
✓ Smooth animations and transitions

## State Management
- useState for form inputs and UI state
- useMemo for computed values
- Local state management (no Redux)
- Props-based component communication

## API Integration Points

### Ready for Backend Connection:
1. POST /api/profile/{userId} - Save user profile
2. GET /api/jobs/search - Get filtered jobs
3. GET /api/jobs/{id} - Get job details
4. GET/PUT/DELETE /api/applications - Track applications
5. GET /api/analytics - Get analytics data

## Mock Data
All components use realistic mock data that can be easily replaced with API calls:
- 6+ mock jobs with match percentages
- 8 mock applications with various statuses
- Sample clusters and analytics data

## Browser Support
- Modern browsers with ES2017+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design works on mobile, tablet, desktop

## Performance Notes
- Client-side filtering and pagination
- Lazy component loading where applicable
- SVG charts for sharp rendering
- Minimal re-renders with useMemo

## Future Enhancements
1. Replace mock data with real API calls
2. Add authentication/login
3. Implement WebSocket for real-time updates
4. Add dark mode toggle
5. Export applications to PDF
6. Advanced search with saved filters
7. User profile pictures
8. Email notification preferences
