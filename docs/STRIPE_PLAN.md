# Stripe Integration Plan — Municipality Permit Manager (PermitFlow)

> Generated per Stripe best practices (MCP planner unavailable — manual plan from TRD + provisioning).

## Business Model

| Tier | Price | Documents/mo | Stripe Product |
|------|-------|--------------|----------------|
| Free | $0 | 5 | No Stripe product (app-managed) |
| Starter | $19/mo | 50 | PermitFlow Starter |
| Professional | $49/mo | 200 | PermitFlow Professional |
| Enterprise | $99/mo | Unlimited | PermitFlow Enterprise |
| Overage | $0.01/doc | — | Billing Meter: `document_processed` |

## Architecture

```
User → Settings → POST /api/stripe/checkout → Stripe Checkout
                                                    ↓
Stripe Webhook → POST /api/webhooks/stripe → Supabase profiles update
                                                    ↓
AI Extract → quota check → meter event (if over quota + paid)
```

## Provisioned Resources (Sandbox)

Run `node scripts/stripe-provision.mjs` to create/recreate:

- **Products + recurring prices** for Starter, Professional, Enterprise
- **Billing meter** `document_processed` for usage-based overage

Price IDs are written to `.env` and `.env.local`.

## Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate tier, set quota, link customer |
| `invoice.payment_succeeded` | Reset monthly document usage |
| `customer.subscription.updated` | Sync tier on plan change |
| `customer.subscription.deleted` | Downgrade to free |

## Local Development

```cmd
scripts\stripe-webhook.cmd
```

Copy the `whsec_...` output into `STRIPE_WEBHOOK_SECRET` in `.env`.

## Production Checklist

- [ ] Switch to live API keys (`sk_live_`, `pk_live_`)
- [ ] Create production webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
- [ ] Subscribe to: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Enable Stripe Customer Portal in Dashboard
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Inject secrets via `gh secret set`

## Integration Review vs Plan

| Requirement | Status |
|-------------|--------|
| Subscription checkout | ✅ `/api/stripe/checkout` |
| Customer portal | ✅ `/api/stripe/portal` |
| Webhook signature validation | ✅ |
| Tier → quota mapping | ✅ |
| Usage meter for overage | ✅ `reportDocumentUsage()` |
| Promotion codes | ✅ `allow_promotion_codes` |
| Metadata on subscription | ✅ `user_id`, `tier` |

## Optional Improvements (P2)

- Add `customer.subscription.created` handler for redundancy
- Stripe Tax for multi-jurisdiction businesses
- Annual billing prices (20% discount per PRD)
- Idempotency keys on checkout creation
