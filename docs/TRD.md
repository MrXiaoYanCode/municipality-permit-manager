# Municipality Permit Manager — Technical Requirements Document

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Edge Network                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Next.js 15  │  │  API Routes  │  │  Middleware (Auth)   │  │
│  │  App Router  │  │  /api/*      │  │  Session refresh     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐  ┌─────────────────┐  ┌───────────────┐
│   Supabase    │  │  OpenAI / AI    │  │    Stripe     │
│  PostgreSQL   │  │  Provider API   │  │   Payments    │
│  Auth + RLS   │  │  Embeddings     │  │   Webhooks    │
│  Storage      │  │  Chat Complete  │  │   Billing     │
│  pgvector     │  │                 │  │               │
└───────────────┘  └─────────────────┘  └───────────────┘
        │
        ▼
┌───────────────────────────────────────┐
│  GitHub Actions (keep_alive.yml)      │
│  cron-job.org (backup heartbeat)      │
└───────────────────────────────────────┘
```

**Stack:** Next.js 15 (App Router) · Tailwind CSS 4 · Supabase · Stripe · Vercel · TypeScript

---

## 2. Data Models

### 2.1 profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  document_quota INTEGER DEFAULT 5,
  documents_used INTEGER DEFAULT 0,
  quota_reset_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 businesses
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL CHECK (business_type IN (
    'restaurant', 'beauty_salon', 'cafe', 'event', 'signage', 'food_truck'
  )),
  address TEXT,
  municipality TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 permits
```sql
CREATE TABLE permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  permit_number TEXT,
  municipality TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expiring', 'expired', 'pending', 'renewed')),
  issue_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  notes TEXT,
  document_url TEXT,
  ai_extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.4 inspections
```sql
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permit_id UUID REFERENCES permits(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scheduled_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'failed', 'rescheduled', 'cancelled')),
  inspector_name TEXT,
  notes TEXT,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.5 compliance_checklists
```sql
CREATE TABLE compliance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.6 documents
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  permit_id UUID REFERENCES permits(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.7 document_embeddings (pgvector)
```sql
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_chunk TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.8 chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. API Specifications

### 3.1 REST Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/extract` | Extract permit data from uploaded document | Required |
| POST | `/api/ai/chat` | RAG-powered compliance chat | Required |
| POST | `/api/ai/embed` | Generate embeddings for document | Required |
| POST | `/api/webhooks/stripe` | Stripe webhook handler | Signature |
| POST | `/api/stripe/checkout` | Create checkout session | Required |
| POST | `/api/stripe/portal` | Create customer portal session | Required |
| GET | `/api/health` | Health check endpoint | Public |

### 3.2 Stripe Webhook Events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate subscription tier, set quota |
| `invoice.payment_succeeded` | Reset monthly quota, confirm payment |
| `customer.subscription.updated` | Update tier on plan change |
| `customer.subscription.deleted` | Downgrade to free tier |

### 3.3 Subscription Tiers

| Tier | Price | Documents/mo | Features |
|------|-------|--------------|----------|
| Free | $0 | 5 | Basic tracking, 1 business |
| Starter | $19/mo | 50 | AI extraction, 3 businesses |
| Professional | $49/mo | 200 | AI chat, unlimited businesses |
| Enterprise | $99/mo | Unlimited | Priority support, API access |

Usage-based: $0.01 per additional document processed beyond quota.

---

## 4. Non-Functional Specifications

### 4.1 Performance
- Edge-rendered static pages: < 100ms TTFB
- API routes: < 500ms (non-AI), < 5s (AI processing)
- Database queries: indexed on `user_id`, `business_id`, `expiry_date`
- Vector search: HNSW index on embeddings

### 4.2 Security
- Row Level Security (RLS) on all tables
- Service role key only in server-side API routes
- Stripe webhook signature validation
- CORS restricted to production domain
- Rate limiting on AI endpoints (10 req/min free, 60 req/min paid)

### 4.3 Scalability
- Serverless auto-scaling via Vercel
- Supabase connection pooling (Supavisor)
- Edge functions for lightweight cron jobs
- CDN for static assets

### 4.4 Monitoring
- Vercel Analytics (free tier)
- Supabase Dashboard metrics
- GitHub Actions heartbeat logs
- cron-job.org uptime monitoring

---

## 5. Infrastructure (Free Tier Optimized)

| Service | Tier | Purpose |
|---------|------|---------|
| Vercel | Hobby (Free) | Frontend + API hosting |
| Supabase | Free | Database, Auth, Storage, pgvector |
| GitHub | Free | Repo, Actions (keep-alive cron) |
| cron-job.org | Free | Backup heartbeat (every 3 days) |
| Stripe | Free (pay-per-use) | Payments |
| OpenAI | Pay-per-use | AI processing (~$0.01/doc) |

### Keep-Alive Strategy
1. **GitHub Actions:** `0 0 */3 * *` — ping Supabase + commit heartbeat.txt
2. **cron-job.org:** Backup ping to `/api/health` every 3 days
3. Prevents Supabase free tier pause (7-day inactivity) and GitHub repo archive (60-day inactivity)

---

## 6. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI Provider
AI_PROVIDER_API_KEY=
AI_PROVIDER=openai

# App
NEXT_PUBLIC_APP_URL=
```

---

## 7. Deployment Commands

```bash
# Supabase
supabase login
supabase init
supabase link --project-ref <ref>
supabase db push

# Vercel
vercel login
vercel link
vercel env pull
vercel --prod

# Stripe webhook
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
