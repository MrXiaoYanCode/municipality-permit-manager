# Municipality Permit Manager — Product Requirements Document

## 1. Executive Summary

**Municipality Permit Manager** is a B2B SaaS platform that helps small businesses track municipal permits, renewal deadlines, inspection schedules, and compliance checklists. The platform uses AI to parse uploaded permit documents, extract deadlines, and provide proactive compliance guidance.

**Target Market:** Restaurants, beauty salons, cafes, events, advertising signage, food trucks, and similar businesses requiring municipal approvals.

**Business Model:** Freemium with usage-based AI processing ($0.01/document) and tiered subscriptions via Stripe.

---

## 2. User Personas

### 2.1 Small Business Owner (Primary)
- **Name:** Maria, Restaurant Owner
- **Goals:** Never miss a permit renewal; avoid fines and shutdowns
- **Pain Points:** Scattered documents, unclear deadlines, multiple municipality portals
- **Tech Savvy:** Low–medium

### 2.2 Operations Manager (Secondary)
- **Name:** James, Multi-location Franchise Ops
- **Goals:** Centralized compliance dashboard across locations
- **Pain Points:** Manual spreadsheet tracking, no audit trail
- **Tech Savvy:** Medium

### 2.3 Compliance Consultant (Tertiary)
- **Name:** Sarah, Independent Compliance Advisor
- **Goals:** Manage multiple client portfolios efficiently
- **Pain Points:** Client document chaos, no standardized workflow
- **Tech Savvy:** High

---

## 3. Functional Requirements

### 3.1 Core Features (P0 — MVP)

| ID | Feature | Description |
|----|---------|-------------|
| F-01 | User Authentication | Email/password + OAuth via Supabase Auth |
| F-02 | Business Profile | Create business with type (restaurant, salon, cafe, event, signage, food truck) |
| F-03 | Permit Tracking | CRUD permits with status, municipality, issue/expiry dates |
| F-04 | Deadline Alerts | Dashboard showing upcoming renewals (7/30/90 day windows) |
| F-05 | Document Upload | Upload PDFs/images to Supabase Storage |
| F-06 | AI Document Parser | Extract permit details, deadlines from uploaded documents |
| F-07 | Compliance Checklist | Industry-specific checklist templates with completion tracking |
| F-08 | Inspection Scheduler | Schedule and track inspection dates with reminders |
| F-09 | Dashboard Analytics | Overview cards: active permits, expiring soon, compliance score |

### 3.2 Growth Features (P1)

| ID | Feature | Description |
|----|---------|-------------|
| F-10 | AI Compliance Chat | RAG-powered chat over user's permit documents |
| F-11 | Multi-location Support | Manage permits across multiple business locations |
| F-12 | Email Notifications | Automated deadline reminders via Supabase Edge Functions |
| F-13 | Stripe Billing | Subscription tiers + usage-based AI processing |
| F-14 | Export Reports | PDF compliance reports for audits |

### 3.3 Enterprise Features (P2)

| ID | Feature | Description |
|----|---------|-------------|
| F-15 | Team Collaboration | Invite team members with role-based access |
| F-16 | API Access | REST API for third-party integrations |
| F-17 | White-label | Custom branding for compliance consultants |
| F-18 | Municipality Directory | Pre-built templates per municipality |

---

## 4. User Stories

### Epic 1: Onboarding
- **US-1.1:** As a new user, I want to sign up with email so I can start tracking permits.
- **US-1.2:** As a new user, I want to select my business type so I get relevant compliance checklists.
- **US-1.3:** As a new user, I want a guided onboarding tour so I understand the platform quickly.

### Epic 2: Permit Management
- **US-2.1:** As a business owner, I want to add permits manually so I can track all my approvals.
- **US-2.2:** As a business owner, I want to upload a permit PDF so the system auto-extracts details.
- **US-2.3:** As a business owner, I want to see all expiring permits on my dashboard so I never miss a renewal.
- **US-2.4:** As a business owner, I want to filter permits by status (active, expiring, expired) so I can prioritize.

### Epic 3: Compliance
- **US-3.1:** As a restaurant owner, I want a health permit checklist so I know what's required.
- **US-3.2:** As a user, I want to mark checklist items complete so I track my compliance progress.
- **US-3.3:** As a user, I want an AI assistant to answer compliance questions about my permits.

### Epic 4: Inspections
- **US-4.1:** As a business owner, I want to schedule inspections so I can prepare in advance.
- **US-4.2:** As a business owner, I want inspection reminders so I don't forget appointments.

### Epic 5: Billing
- **US-5.1:** As a free user, I want to process up to 5 documents/month so I can try the AI features.
- **US-5.2:** As a paid user, I want usage-based billing so I only pay for what I use.
- **US-5.3:** As a user, I want to upgrade my plan so I get more document processing quota.

---

## 5. Feature Prioritization (MoSCoW)

### Must Have (MVP Launch)
- Authentication & business profiles
- Permit CRUD with deadline tracking
- Document upload with AI extraction
- Compliance checklists (6 business types)
- Inspection scheduling
- Dashboard with analytics cards
- Dark/light mode
- Responsive mobile-first UI

### Should Have (v1.1)
- AI compliance chat (RAG)
- Stripe subscription billing
- Email deadline reminders
- Multi-location support

### Could Have (v1.2)
- Team collaboration
- PDF export reports
- Municipality directory

### Won't Have (v1)
- White-label
- Public API
- Mobile native apps

---

## 6. Success Metrics

| Metric | Target (90 days) |
|--------|------------------|
| Registered users | 500+ |
| Permits tracked | 2,000+ |
| AI documents processed | 1,000+ |
| Free-to-paid conversion | 5% |
| Monthly churn | < 8% |
| NPS score | > 40 |

---

## 7. Non-Functional Requirements (Summary)

- **Uptime:** 99.9% (serverless on Vercel + Supabase)
- **Response Time:** < 200ms for dashboard, < 3s for AI processing
- **Security:** RLS on all tables, encrypted storage, Stripe webhook signature validation
- **Cost:** Free tier compatible — Vercel Hobby, Supabase Free, GitHub Actions keep-alive
- **Accessibility:** WCAG 2.1 AA compliance target
