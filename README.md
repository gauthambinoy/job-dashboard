# LazyScaper - Lazy but Smart Job Hunting

A smart job discovery and application tracking platform that helps you find the perfect role across Ireland, Dubai, and Australia using deep job description analysis and intelligent matching.

## Features

✨ **Smart Job Discovery**
- Broad filtering by job domain, country, experience level, and availability
- Deep job description analysis to extract real requirements
- Intelligent matching algorithm: 0-100% match score based on your profile
- Real links to original job postings

🎯 **Intelligent Clustering**
- Groups similar jobs automatically (85%+ skill overlap)
- Suggests single CV for jobs in same cluster
- Identifies reusable application strategies

📊 **Professional Analytics**
- Track job applications with detailed status
- Match distribution visualization
- Cluster performance analysis
- Location and salary breakdowns
- Application funnel conversion metrics

## Tech Stack

**Frontend:**
- Next.js 14 (React 19, TypeScript)
- Tailwind CSS
- Recharts for visualizations
- Axios for API calls

**Backend:**
- Node.js + Express.js (TypeScript)
- PostgreSQL database
- Smart NLP-based JD analysis
- Cosine similarity clustering

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (or Docker)
- npm or yarn

### Development Setup

**Option 1: Using Docker Compose**

```bash
cd lazyscaper
docker-compose up
```

Frontend: http://localhost:3000
Backend API: http://localhost:5000/api

**Option 2: Manual Setup**

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

## Project Structure

```
lazyscaper/
├── frontend/              # Next.js React app
│   ├── app/              # App router pages
│   ├── components/       # Reusable components
│   ├── lib/             # API client & types
│   └── public/          # Static files
│
├── backend/              # Express API server
│   ├── src/
│   │   ├── config/      # Database config
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── utils/       # JD analysis & matching
│   │   └── types/       # TypeScript interfaces
│   ├── schema.sql       # Database schema
│   └── package.json
│
├── docker-compose.yml   # Local development
└── README.md
```

## Smart Matching Algorithm

Calculates job match as:
```
(Skills % * 40) + (Experience % * 30) + (Salary % * 15) + 
(Location % * 10) + (Education % * 5) = Total Match (0-100%)
```

## API Endpoints

**Profile:** GET/POST `/api/profile/:userId`
**Jobs:** GET `/api/jobs/search` | GET `/api/jobs/:jobId`
**Matching:** POST `/api/matching/calculate/:userId/:jobId`
**Analytics:** GET `/api/analytics/:userId/stats`

See full API docs in backend README.

## Roadmap

- [x] Backend foundation & APIs
- [x] Smart matching algorithm
- [x] JD analysis engine
- [ ] Frontend UI components
- [ ] Indeed scraper
- [ ] LinkedIn integration
- [ ] Application tracker
- [ ] Analytics dashboards

## License

MIT
