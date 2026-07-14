# PermitFlow — Municipality Permit Manager

AI-powered SaaS for tracking municipal permits, renewal deadlines, inspection schedules, and compliance checklists.

## Features

- **Permit Tracking** — CRUD permits with deadline alerts (7/30/90 day windows)
- **AI Document Parsing** — Upload PDFs, auto-extract permit details via OpenAI
- **Compliance Checklists** — Industry templates for restaurants, salons, cafes, events, signage, food trucks
- **Inspection Scheduler** — Schedule and track municipal inspections
- **AI Compliance Chat** — RAG-powered assistant over your permit documents
- **Stripe Billing** — Freemium + subscription tiers with usage-based AI processing
- **Dark/Light Mode** — Beautiful responsive UI inspired by [21st.dev](https://21st.dev)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS 4, Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Storage, pgvector) |
| AI | OpenAI GPT-4o-mini + text-embedding-3-small |
| Payments | Stripe (subscriptions + webhooks) |
| Hosting | Vercel (serverless/edge) |
| Keep-Alive | GitHub Actions + cron-job.org |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env.local
# Fill in your Supabase, Stripe, and OpenAI keys

# 3. Run database migration (in Supabase SQL Editor or via CLI)
# Paste contents of supabase/migrations/20250714000000_initial_schema.sql

# 4. Start development server
npm run dev
```

## Deployment

### Supabase Setup
```bash
# Install Supabase CLI: https://supabase.com/docs/guides/cli
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### Vercel Deployment
```bash
vercel login
vercel link
vercel env pull .env.local
vercel --prod
```

### Stripe Webhook
```bash
stripe listen --forward-to https://your-app.vercel.app/api/webhooks/stripe
# Copy whsec_... to STRIPE_WEBHOOK_SECRET
```

### GitHub Secrets (for keep-alive workflow)
```bash
gh secret set SUPABASE_URL --body "https://xxx.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "eyJ..."
gh secret set NEXT_PUBLIC_APP_URL --body "https://your-app.vercel.app"
```

### cron-job.org Backup
Create a free cron job at [cron-job.org](https://cron-job.org):
- **URL:** `https://your-app.vercel.app/api/health`
- **Schedule:** Every 3 days
- **Method:** GET

## Documentation

- [PRD](docs/PRD.md) — Product Requirements
- [TRD](docs/TRD.md) — Technical Requirements
- [AI Pipeline](docs/AI_PIPELINE.md) — AI/ML Architecture

## License

Private — All rights reserved.
