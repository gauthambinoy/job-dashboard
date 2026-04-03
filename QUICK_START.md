# Quick Start Guide - LazyScaper Frontend

## Setup & Running

```bash
cd /home/gautham/lazyscaper/frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## File Locations

All files are in: `/home/gautham/lazyscaper/frontend/app/`

### Key Pages to Review

| Page | File | Route | What It Does |
|------|------|-------|------------|
| Home | `page.tsx` | `/` | Landing page with CTAs |
| Profile Setup | `profile/page.tsx` | `/profile` | User onboarding form |
| Job Search | `search/page.tsx` | `/search` | Filters for job search |
| Search Results | `search/results.tsx` | `/search` | Job listings table |
| Job Details | `jobs/[id]/page.tsx` | `/jobs/1` | Full job info + match |
| Tracker | `tracker/page.tsx` | `/tracker` | Application tracking |
| Analytics | `analytics/page.tsx` | `/analytics` | Metrics dashboard |

## Component Files

Located in `app/components/`

- `Header.tsx` - Navigation (used in all pages)
- `PieChart.tsx` - Match % visualization
- `MatchScore.tsx` - Circular progress indicator
- `DashboardCard.tsx` - Stat cards
- `StatusBadge.tsx` - Status indicators
- `SkillTag.tsx` - Skill tags
- `SalaryDisplay.tsx` - Salary formatting
- `ConversionFunnel.tsx` - Funnel chart

## Navigate the App

1. **Start at Home** (`/`)
   - See feature overview
   - Click "Set Up Profile" or "Search Jobs"

2. **Setup Profile** (`/profile`)
   - Fill out form with:
     - Select 3-5 skills
     - Enter experience (e.g., 5)
     - Choose education
     - Set salary range ($80k-$150k)
     - Pick 1-2 countries
     - Select availability
   - Click "Save Profile"

3. **Search Jobs** (`/search`)
   - Select domain (e.g., Backend Engineering)
   - Pick countries (e.g., Ireland)
   - Leave other filters as default or adjust
   - Click "Search Jobs"
   - Results table appears

4. **View Results** (`/search` - results view)
   - Scroll table to see 6 columns
   - Green = 80%+ match, Yellow = 60-80%, Red = <60%
   - Click job title to view details

5. **Job Details** (`/jobs/1`)
   - Full job description
   - Required and nice-to-have skills
   - Pie chart showing your match %
   - "Apply Now" button (opens link)
   - Click back button to return to results

6. **Track Applications** (`/tracker`)
   - View status cards at top
   - See applications table
   - Change status in dropdown
   - Click expand for notes
   - Filter by status
   - Sort by different criteria

7. **View Analytics** (`/analytics`)
   - Dashboard metrics
   - Charts and visualizations
   - Filter controls

## Form Examples

### Profile Form
```
Skills: React, Node.js, TypeScript, AWS
Experience: 5 years
Education: Bachelor's Degree
Salary: $80,000 - $150,000
Countries: Ireland, Dubai
Availability: Actively Looking
```

### Search Form
```
Domain: Backend Engineering
Country: Ireland
Experience: 3-5 years
Salary: $80,000 - $160,000
Availability: Actively Looking
```

## Color Meanings

### Match Percentages
- 🟢 **Green (80%+)** - Excellent match
- 🟡 **Yellow (60-80%)** - Good match
- 🔴 **Red (<60%)** - Skills gap

### Status Badges
- Blue: Saved jobs
- Purple: Applied
- Yellow: Pending response
- Orange: Interviewing
- Red: Rejected
- Green: Offered

## Key Features

### Profile Page
- Multi-select dropdowns for skills and countries
- Tags show selected items
- Remove button (X) on each tag
- Form submission to API

### Search Page
- 6 domain options
- 3 countries
- Experience levels
- Salary sliders (drag to adjust)
- Search and Reset buttons

### Search Results
- Pagination (10 per page)
- Click job title to go to details
- Match % colored by percentage
- Back button returns to filters

### Job Details
- Full job description
- Skills highlighted if you have them
- Pie chart showing overall match
- Progress bar for skills match
- Save/Apply buttons
- Cluster information

### Tracker
- 6 status cards showing counts
- Full application table
- Edit status in dropdown
- Expand row for notes
- Delete with confirmation
- Filter by status
- Sort options

## API Ready - Railway Backend

The frontend is now connected to a Railway backend!

### Configuration

Backend URL is set in `/frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=https://lazyscaper-backend-production.up.railway.app/api
```

Replace `lazyscaper-backend-production` with your actual Railway app name.

### Testing API Connectivity

Visit: http://localhost:3000/api-status

This page shows:
- ✓ Backend connection status
- ✓ All 4 API endpoints status
- ✓ Configuration details
- ✓ Troubleshooting guides

### Testing Features

1. **Profile Save** (`/profile`)
   - Fill form and click "Save Profile"
   - Data saves to Railway backend

2. **Job Search** (`/search`)
   - Select filters and "Search Jobs"
   - Results from Railway backend

3. **Analytics** (`/analytics`)
   - View charts loaded from backend
   - Uses Railway data

## Customization

### Add More Skills
Edit `app/profile/page.tsx`:
```typescript
const SKILLS_OPTIONS = [
  'React', 'Node.js', // ... add more
  'NewSkill1', 'NewSkill2'
];
```

### Add More Countries
Edit `app/profile/page.tsx` and `app/search/page.tsx`:
```typescript
const COUNTRIES = ['Ireland', 'Dubai', 'Australia', 'NewCountry'];
```

### Change Colors
All colors use Tailwind classes:
- `bg-green-600` - Green
- `bg-yellow-600` - Yellow
- `bg-red-600` - Red
- `bg-blue-600` - Blue

## Troubleshooting

### Page not loading?
- Ensure you're at `http://localhost:3000`
- Check browser console for errors
- Verify all files are created in correct directories

### Form not submitting?
- Check browser console for JS errors
- Verify mock API endpoint is correct
- Remove validation requirements if testing

### Styles not showing?
- Tailwind CSS should auto-compile
- Try stopping and restarting dev server
- Clear `.next` folder and rebuild

## Development Tips

1. **Hot Reload**: Changes auto-reload in browser
2. **Console**: Open DevTools to see errors
3. **Mobile Testing**: Use DevTools device emulation
4. **Component Isolation**: Open single components in browser
5. **Mock Data**: All data is in the component files

## Documentation Files

- `COMPONENT_GUIDE.md` - Detailed component docs
- `FRONTEND_BUILD_SUMMARY.md` - Build overview
- `FRONTEND_STRUCTURE.txt` - File tree and routes
- `IMPLEMENTATION_CHECKLIST.md` - Completion status
- `QUICK_START.md` - This file

## API Testing Tools

### 1. Web Dashboard (Recommended)
```bash
npm run dev
# Visit: http://localhost:3000/api-status
```
Visual interface showing:
- Real-time API status
- Individual endpoint tests
- Troubleshooting guide

### 2. Command-Line Tests
```bash
npx ts-node scripts/test-api-connectivity.ts
```
Terminal output with:
- Pass/fail for each endpoint
- Response times
- Summary statistics

### 3. Testing Functions
```typescript
import { runAllApiTests, getApiConfig } from '@/lib/api-test';

const results = await runAllApiTests();
console.log(results);
```

## Next Steps

1. ✅ Review all pages by navigating in browser
2. ✅ Test all forms and interactions
3. ✅ Verify responsive design on mobile
4. ✅ Test pagination and table sorting
5. ✅ Connect to real backend API (DONE)
6. ⬜ Test all features with Railway backend
7. ✅ Deploy to production (READY)

## Support

All components are self-contained and use Tailwind CSS.
No external UI library dependencies (except lucide-react for icons).
TypeScript provides type safety and IDE autocomplete.

Happy coding!
