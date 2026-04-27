# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # Start dev server on http://localhost:3000
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint
npm run typecheck       # Run TypeScript type checking
npm run db:push         # Push Prisma schema to database
npm run db:generate     # Regenerate Prisma client after schema changes
npm run db:studio       # Open Prisma Studio (GUI for database)
```

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js v4 (Credentials + GitHub + Google OAuth, JWT strategy)
- **Payments:** Stripe (Checkout, Customer Portal, webhooks)
- **UI:** Tailwind CSS 3 + shadcn/ui (Radix UI, Lucide icons), next-themes
- **Charts:** Recharts (analytics dashboard)
- **Validation:** Zod
- **Notifications:** Sonner (toast)

## Project Structure

```
src/
├── app/
│   ├── (auth)/                # Login, register, forgot password
│   ├── (dashboard)/dashboard/ # Protected pages: overview, projects, team,
│   │                          #   analytics, billing, settings
│   ├── api/
│   │   ├── auth/[...nextauth] # NextAuth API route
│   │   └── billing/           # Stripe checkout, portal, webhook
│   └── page.tsx               # Landing page
├── components/
│   ├── analytics/   # RevenueChart
│   ├── auth/        # AuthForm
│   ├── billing/     # PricingCard
│   ├── dashboard/   # StatsCard, RecentProjects
│   ├── layout/      # Header, Sidebar, ThemeProvider, SessionProvider
│   └── ui/          # Button, Card, Input, Badge, Avatar (shadcn)
├── lib/
│   ├── auth.ts      # NextAuth config (callbacks, providers, events)
│   ├── data.ts      # Data layer — Prisma or demo fallback
│   ├── demo-data.ts # Realistic sample data for demo mode
│   ├── prisma.ts    # Prisma singleton client
│   ├── stripe.ts    # Stripe client, plans, checkout + portal helpers
│   ├── utils.ts     # cn() helper, currency/number formatters
│   └── validations.ts # Zod schemas
├── types/index.ts   # SafeUser, UserWithTenant, NavItem, BillingPlan, etc.
├── hooks/index.ts   # Custom React hooks
└── middleware.ts    # Protects /dashboard/* — delegates to next-auth/middleware
```

## Multi-Tenancy Architecture

- **Tenant** model (`prisma/schema.prisma`) — slug-based isolation with `slug` (unique), `plan` (FREE/PRO/ENTERPRISE), Stripe fields
- **User** has `tenantId` FK — each user belongs to one tenant
- **Roles:** OWNER, ADMIN, MEMBER (enforced via `UserRole` enum)
- **Data scoping:** All models (Project, etc.) have `tenantId` — queries filter by tenant
- **Auto-provisioning:** On user signup, the `createUser` NextAuth event auto-creates a tenant and assigns the user as OWNER
- **JWT:** `tenantId` and `role` are embedded in the JWT token and session

## Demo Mode

When `DATABASE_URL` is not set, the app runs in **demo mode** — all dashboard pages render with realistic sample data from `lib/demo-data.ts`. No database or Stripe keys needed to start.

- Blue "Demo Mode" banner shows at top
- Auth pages are visible but don't submit
- Navigation, dark mode toggle, and all dashboard pages work fully

## Auth Flow

- **NextAuth** with JWT strategy (30-day max age)
- Providers: Credentials (email/password with bcrypt), GitHub, Google
- On `createUser` event: tenant is auto-created with slug from email, user becomes OWNER
- Session data includes `id`, `role`, and `tenantId` via JWT callbacks
- Middleware (`src/middleware.ts`) protects all `/dashboard/*` routes

## Stripe Billing

- Plans defined in `lib/stripe.ts`: Free ($0), Pro ($29/mo), Enterprise ($99/mo)
- `createCheckoutSession(tenantId, priceId, customerId?)` → redirects to Stripe
- `createBillingPortalSession(customerId)` → redirects to customer portal
- Webhook handler at `app/api/billing/webhook/route.ts` syncs subscription status
- Pricing page reads from `PLANS` array — Stripe Price IDs from env vars

## Key Patterns

- **Data layer** (`lib/data.ts`) — all data fetching goes through here. Checks `isDemoMode()` and returns demo data or Prisma queries
- **Validation** — Zod schemas in `lib/validations.ts` (login, register, project, settings, tenant)
- **Types** — Prisma-generated types re-exported as `SafeUser` (without passwordHash) and `UserWithTenant`
- **SWR not used** — data is fetched server-side in page components

## Environment Variables (.env.local)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (omit for demo mode) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (`whsec_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe Price ID for Pro monthly |
| `STRIPE_PRICE_PRO_YEARLY` | Stripe Price ID for Pro yearly |
| `STRIPE_PRICE_ENTERPRISE_MONTHLY` | Stripe Price ID for Enterprise monthly |
