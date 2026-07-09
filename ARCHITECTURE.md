# Advisor Dashboard — Architecture

This app is the software backbone for OmniCard's **CA Partner Network**
program (see the source plan: "OmniCard CA Partner Network — Execution
Plan", 12-month, 0→500 partners). It implements the program end-to-end:
the public partner microsite, the CA-facing partner portal, and the
internal CRM/ops console — so the 10-step plan actually runs on software
instead of spreadsheets and manual WhatsApp threads.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router, Server Components + Server Actions) | One codebase for the public microsite, partner portal, and admin console; server actions replace a separate REST/API layer for all mutations. |
| Language | TypeScript | End-to-end type safety from DB to UI. |
| Styling | Tailwind CSS v4 | Utility-first, fast to iterate, themeable via CSS variables (light/dark). |
| Data layer | Prisma ORM + SQLite (dev) | Zero-infra local database that runs anywhere; schema is written to be a one-line swap to Postgres/MySQL for production (see below). |
| Auth | Custom session cookies signed with `jose` (HS256 JWT) + `bcryptjs` password hashing | Two-role auth (CA partner vs internal ops) doesn't need a full IdP; keeps the stack dependency-light. Swap-in point for a real IdP (Clerk/Auth0/WorkOS) is `src/lib/auth.ts`. |
| Charts | Recharts | Funnel and KPI visualizations in the admin console. |
| Validation | Zod (installed, ready for form/action schemas as they grow) | |

### Why SQLite over Postgres for this build

SQLite has no enum type, so every Prisma enum in the original design was
flattened to `String` with the valid values centralized in
`src/lib/enums.ts` (single source of truth, used by Prisma seed data, UI
labels, and server actions alike). Moving to Postgres in production is a
two-step change: swap `provider = "sqlite"` → `"postgresql"` in
`prisma/schema.prisma`, point `DATABASE_URL` at a real instance, and
optionally re-introduce native `enum` blocks for stricter DB-level
validation.

## Domain model → the 10-step plan

Every model in `prisma/schema.prisma` maps directly to a step in the
execution plan:

| Model | Plan step(s) | Purpose |
|---|---|---|
| `Partner` | Step 1 (Lock the Foundation), Step 4 (Certification), Step 5 (30-day sprint) | The CA/firm record — ICP score (Step 1.2), lifecycle stage (`LEAD → MEETING_SCHEDULED → ONBOARDING → CERTIFIED → ACTIVE → DORMANT`), badge tier, referral code. |
| `AssetKitItem` | Step 3 (Per-CA creation checklist) | The 12-item deliverable checklist (landing page, QR, video, deck, badge, WhatsApp pack, etc.) generated automatically on certification. |
| `Lead` | Step 6 (Lead-to-Revenue Machine) | A client lead captured under a CA's attribution, tracked `CAPTURED → QUALIFIED → CONTACTED → DEMO → PROPOSAL → CLOSED_WON/LOST`. |
| `Commission` | Step 1.1 (MSA), Step 6.6 (payout), Step 10 (unit economics) | 15% Year-1 + 5% trailing fee, auto-created and credited when a lead closes. |
| `Badge` | Step 4 (Milestone rewards) | Silver/Gold/Platinum, auto-issued per quarter once the client-count threshold is hit — computed from `Lead.closedAt` inside the quarter window. |
| `ReferralBonus` / `Partner.referredBy` | Step 8 (Retention & Referral Flywheel) | Partner-refers-partner bonus tracking. |
| `Campaign` | Step 3.11, Step 7 (Acquisition Marketing Engine) | Pre-drafted campaigns a CA approves in one click; OmniCard "sends" on approval. |
| `ActivityEvent` | Step 6.1, Step 9 (attribution) | Every share/click/QR-scan/webinar-attend/campaign-approval, CA-tagged, for funnel attribution. |
| `KpiSnapshot` | Step 9 (Tracking & KPIs) | Weekly funnel metrics against the plan's explicit targets (cost/lead ≤ Rs 500, activation ≥ 60%, SLA ≥ 95%, etc). |
| `User` | Auth | Login identity; `role: CA` links 1:1 to a `Partner` record (provisioned automatically the moment a partner is certified — see `certifyPartnerAction`). |

`src/lib/enums.ts` also carries the ICP scoring weights and rates
(`YEAR1_RATE = 15%`, `TRAILING_RATE = 5%`) as named constants, and
`src/lib/plan-content.ts` carries the static plan copy (stats, the
12-step flow, proof brands, KPI target table) shown on the marketing
site and admin overview — content lives in one place, not copy-pasted
across pages.

## Application surfaces

```
/                         Public marketing microsite (Step 2.1) — hero,
                          12-step flow, earnings calculator, milestone
                          teaser, proof-brand comparison
/signup                   Self-serve CA interest capture (Step 1.2)
/directory                Public certified-advisor directory (Step 2.7)
/advisor/[slug]           Per-CA co-branded landing page (Step 3.1) with
                          a lead-capture form attributed to that CA
/login                    Shared login for CA partners + internal ops

/partner/*                CA-facing portal (auth: role CA)
  /partner                 Dashboard — earnings, pipeline, milestone
                           progress, city rank, referral link
  /partner/leads           Leads & pipeline table
  /partner/assets          Step 3 asset-kit checklist status
  /partner/campaigns       Pending campaigns to approve in one click
  /partner/badges          Milestone tiers + badges earned
  /partner/referrals       Refer-a-CA flywheel + bonus tracking

/admin/*                  Internal ops CRM (auth: ADMIN / PARTNER_MANAGER
                          / MARKETING_OPS / SALES)
  /admin                   KPI overview — partner + lead funnels
                           (Recharts), badge counts, Step 9 KPI targets
  /admin/partners          ICP-scored CRM list, pursue ≥70 / skip <50
  /admin/partners/[id]     Onboarding actions (schedule meeting → verify
                           ICAI/MSA → certify), Step 3 checklist, leads,
                           commissions for that partner
  /admin/leads             Cross-partner lead-to-revenue table with
                           inline stage advancement (drives commission +
                           badge logic)
  /admin/campaigns         Draft a campaign for a CA to approve
  /admin/commissions       Full commission ledger with credited/pending
                           totals
```

Route protection is enforced in `src/middleware.ts`: unauthenticated
requests to `/admin/*` or `/partner/*` redirect to `/login`; a CA session
can't reach `/admin/*` and an ops session can't reach `/partner/*`.

## Key flows implemented as server actions (`src/app/actions/*`)

- **`partner.ts`**
  - `signupPartnerAction` — Step 1.2 interest capture from the public site.
  - `captureLeadAction` — Step 6.1 lead capture on a CA's microsite.
  - `certifyPartnerAction` — Step 4: marks ICAI verified + MSA signed +
    demo attended, generates all 12 `AssetKitItem` rows, auto-delivers the
    certificate/badge asset, and provisions the CA's `User` login
    (default password, meant to be reset on first login in production).
  - `advancePartnerStageAction` — moves a partner through
    `LEAD → MEETING_SCHEDULED → ONBOARDING`.
- **`lead.ts`**
  - `advanceLeadStageAction` — Step 6 pipeline movement; on `CLOSED_WON`
    it creates the Year-1 + trailing `Commission` rows, flips the
    partner to `ACTIVE`, and checks/issues quarterly milestone `Badge`s
    (Step 4/8).
- **`campaign.ts`**
  - `createCampaignAction` — ops drafts a campaign for a partner.
  - `approveCampaignAction` — CA approves in one click (Step 3.11).

## Data & seeding

`prisma/seed.ts` seeds 12 realistic CA firms across 8 Indian cities,
spread across every lifecycle stage, with leads, commissions, campaigns,
asset kits, milestone badges, one referral relationship, and six weeks of
`KpiSnapshot` rows — enough to exercise every page without manual setup.

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npm run db:seed
npm run dev
```

Demo logins (seeded, password `omnicard123` for all):
- Admin: `admin@omnicard.in`
- Partner manager: `ops@omnicard.in`
- CA partner (fully active, ACTIVE stage, Gold badge): `priya.sharma@camail.in`

## Extension points (deliberately stubbed, not faked)

The plan calls for several external integrations that are out of scope
for this build but the schema/actions are shaped so they slot in without
a redesign:

- **WhatsApp / Email sending** — `Campaign.status` already models
  `DRAFTED → PENDING_APPROVAL → APPROVED → SENT`; wiring `SENT` to an
  actual WhatsApp Business API / email provider is a single call inside
  `approveCampaignAction`.
- **ICAI membership verification** — `Partner.icaiNumber` /
  `icaiVerified` are already tracked; `advancePartnerStageAction` is
  where a real ICAI lookup API would be called before flipping
  `icaiVerified`.
- **E-sign** — `Partner.msaSignedAt` is a timestamp today; swapping in
  DocuSign/Leegality means writing to that same field from a webhook.
  Asset-kit generation (video, deck, WhatsApp pack) — `AssetKitItem`
  rows are created with `status: PENDING/IN_PROGRESS` and a due date;
  production would have a worker that renders each asset and flips the
  row to `DELIVERED`, exactly like `certifyPartnerAction` does today for
  the certificate.
