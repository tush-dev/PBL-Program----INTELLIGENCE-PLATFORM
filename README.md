# PBL Program Intelligence & Grant Reporting Assistant

A production-ready web application that transforms raw Project Based Learning (PBL) implementation data into program intelligence, risk detection, review preparation, grant reporting, and action planning.

Built for education program teams to understand what's working, what's not, which districts/blocks need intervention, and how to prepare grant reports.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Next.js 16 App                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Pages   │  │   API    │  │   Engines     │  │
│  │ (Client) │  │ (Server) │  │ (Services)    │  │
│  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │              │              │            │
│  ┌────┴──────────────┴──────────────┴────────┐  │
│  │         Prisma ORM + PostgreSQL (Neon)       │  │
│  └─────────────────┬─────────────────────────┘  │
│                    │                             │
│  ┌─────────────────┴─────────────────────────┐  │
│  │         CSV Import Pipeline                │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
CSV Files → Import Pipeline → PostgreSQL (Neon) Database → KPI Engine
                                                   ├── Risk Engine
                                                   ├── Trend Engine
                                                   ├── Review Engine
                                                   ├── Action Engine
                                                   └── Grant Engine
                                                        │
                                            ┌───────────┴───────────┐
                                            ▼                      ▼
                                     Rule-Based Narrator     Groq AI Narrator
                                     (Default, no AI)        (Optional, USE_AI=true)
```

## Data Model

### Tables

| Table | Description |
|-------|-------------|
| `District` | Unique districts from PBL data |
| `Block` | Unique blocks per district |
| `School` | Unique schools with district/block references |
| `SchoolMetric` | Monthly per-school metrics (core fact table, 6,900 rows) |
| `Grant` | Grant profiles (3 grants) |
| `GrantFinance` | Budget lines per grant per month (45 rows) |
| `GrantPerformance` | Performance records per grant per month (9 rows) |
| `EvidenceAsset` | Evidence metadata (9 records) |
| `RiskAssessment` | Computed risks at district/block/metric levels |
| `ReviewSummary` | Generated review summaries |
| `RecommendedAction` | Generated action items |
| `GeneratedReport` | Cached export reports |
| `AuditLog` | Audit trail |

### Schema Design Principles

- Normalized structure with proper foreign keys
- Composite unique constraints prevent duplicates
- Indexed on frequently queried columns (month, school, district, block)
- PostgreSQL via Neon with pooled connection for serverless

## Risk Logic (Deterministic)

| Score Range | Level | Description |
|-------------|-------|-------------|
| >= 75 | On Track | Performance meets target |
| >= 60 and < 75 | Behind | Needs improvement |
| >= 35 and < 60 | At Risk | Significant attention required |
| < 35 | Critical | Immediate intervention needed |

Composite risk score = Participation × 0.4 + Attendance × 0.3 + Evidence × 0.3

## KPI Definitions

| KPI | Formula |
|-----|---------|
| Participation Rate | (# participating schools / total schools) × 100 |
| Attendance Rate | Average of per-school attendance rates |
| Evidence Submission Rate | (# schools with evidence / total schools) × 100 |
| MoM Change | Current value - Previous value |
| MoM % Change | (Absolute change / Previous value) × 100 |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Set Up Database

Create a Neon PostgreSQL database and set `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

Push the schema to Neon:
```bash
npx prisma db push
```

### Import Data

```bash
npm run import-data
```

Imports all 6 CSV files (6,900 school records + grant + evidence data).

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run Tests

```bash
npm test
```

## CSV Data Sources

The `/csv` directory contains 6 source files:

1. **PBL_School_Response_Data_July_2025.csv** - July school data (2,300 rows)
2. **PBL_School_Response_Data_August_2025.csv** - August school data (2,300 rows)
3. **PBL_School_Response_Data_September_2025.csv** - September school data (2,300 rows)
4. **01_Grant_Profile_and_Finance.csv** - Grant budgets and utilization (45 rows)
5. **02_Grant_Performance_and_Report_Material.csv** - Grant outcomes (9 rows)
6. **03_Evidence_and_Media_Index.csv** - Evidence metadata (9 records)

Image files in `/images` (9 files) are loaded dynamically in the Evidence Center.

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Overview | `/` | Dashboard with KPIs, trends, risk distribution |
| District Intelligence | `/district-intelligence` | District ranking and performance |
| Block Intelligence | `/block-intelligence` | Block ranking and performance |
| Risk Center | `/risk-center` | Risk assessment details and distribution |
| Review Preparation | `/review-preparation` | Generated review summaries with export |
| Grant Reporting | `/grant-reporting` | Grant report generation workflow |
| Evidence Center | `/evidence-center` | Image gallery with categories |
| Actions Center | `/actions-center` | Recommended actions |
| Settings | `/settings` | System configuration |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/filters` | GET | Available filter options |
| `/api/metrics` | GET | Dashboard metrics with trends |
| `/api/districts` | GET | District performance data |
| `/api/blocks` | GET | Block performance data |
| `/api/risks` | GET | Risk assessments |
| `/api/review` | GET | Review summary |
| `/api/actions` | GET | Recommended actions |
| `/api/grants` | GET | Grant list |
| `/api/grants/[id]` | GET | Grant report |
| `/api/evidence` | GET | Evidence records |
| `/api/export` | POST | Export content |

## Database (Neon PostgreSQL)

This project uses **Neon PostgreSQL** via Prisma ORM. The schema is defined in `prisma/schema.prisma`.

### Local Setup

1. Create a **Neon** account at https://console.neon.tech
2. Create a new project and copy the connection string
3. Set it as `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. Push the schema to Neon:
   ```bash
   npx prisma db push
   ```
5. Import CSV data:
   ```bash
   npm run import-data
   ```

### Migration from SQLite

1. Change the Prisma datasource provider from `sqlite` to `postgresql` in `prisma/schema.prisma`
2. Replace `DATABASE_URL` in `.env` with your Neon PostgreSQL connection string
3. Run `npx prisma db push` to create all tables
4. Run `npm run import-data` to repopulate data (import is optimized for PostgreSQL with bulk inserts)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `USE_AI` | No | Set to `"true"` to enable Groq AI narrative generation |
| `GROQ_API_KEY` | No | Groq API key (required if `USE_AI=true`) |

## AI Integration (Optional)

Set `USE_AI=true` and `GROQ_API_KEY` in `.env` to enable AI narrative generation via Groq (Llama 3.3 70B).

**Important**: AI only generates narrative text. All metrics, risks, and KPIs are calculated deterministically by the engines. The AI never computes data — it only formats pre-computed facts into prose.

Without AI (default), the `RuleBasedGenerator` produces structured, deterministic narratives.

## Deployment (Vercel Free Tier + Neon)

1. Create a **Neon** project at https://console.neon.tech
2. In your Neon dashboard, go to **Connection Details** and copy the connection string (use the pooled connection string for serverless)
3. Push to GitHub
4. Connect repo to Vercel
5. Add the following **Environment Variables** in Vercel:
   - `DATABASE_URL`: Your Neon connection string (use the pooled URL with `-pooler` suffix and `?sslmode=require`)
6. In Vercel build settings, add the following **Build Command**:
   ```bash
   npx prisma generate && next build
   ```
7. Deploy

Note: When using Vercel's serverless functions, always use the **pooled connection string** (contains `-pooler` in the hostname) from Neon to handle concurrent requests.

## Export Features

- **PDF/DOCX**: Use jsPDF and docx libraries
- **Copy to Clipboard**: One-click copy of review summaries and grant reports
- **TXT/HTML**: Downloadable text and HTML formats

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Shadcn UI, Recharts, Lucide React
- **State**: Zustand
- **Backend**: Next.js Route Handlers, TypeScript
- **Database**: Prisma ORM + Neon PostgreSQL
- **Validation**: Zod, React Hook Form
- **Export**: jsPDF, docx
- **Notifications**: Sonner
- **Utilities**: date-fns, clsx
- **Testing**: Vitest

## Cost

**₹0.** All infrastructure and APIs are free-tier:
- Vercel Free Tier
- Neon PostgreSQL (free tier, 500 MB storage)
- Groq Free Tier (optional, no credit card required)
- No paid APIs or services

## Tradeoffs & Assumptions

1. **Neon PostgreSQL in production**: Serverless PostgreSQL with connection pooling. Schema is managed via Prisma migrations.
2. **Rule-based AI as default**: Ensures the app works perfectly without any API keys. AI adds narrative polish but is never required.
3. **Deterministic risk engine**: All risk classifications use hard thresholds. No ML or probabilistic models.
4. **Composite risk scoring**: Weighted average (40% participation, 30% attendance, 30% evidence) chosen for simplicity and explainability.
5. **Denormalized API responses**: API endpoints return pre-joined data for frontend convenience at the cost of slightly larger payloads.
6. **Month-over-month trends**: Only 3 months of data available, so trends are limited to sequential month comparisons.
7. **Static images**: Images are pre-generated and stored in `/images`. In production, these would be uploaded via a CMS or cloud storage.

## Future Improvements

- PostgreSQL deployment with connection pooling
- User authentication and role-based access
- Data upload UI (drag-and-drop CSV import)
- Multi-language support
- Advanced filtering (date ranges, custom KPIs)
- Real-time notifications for risk changes
- Email report delivery
- Mobile app (React Native)
