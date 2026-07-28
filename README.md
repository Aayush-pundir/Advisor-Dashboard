# 🤝 Advisor Dashboard: OmniCard CA Partner Network Platform

A full-stack partner relationship management (PRM) platform that runs
OmniCard's Chartered Accountant partner program end-to-end — from public
lead capture, through certification and co-branded marketing, to
lead-to-revenue tracking, advisory-fee payout, and an annual milestone
recognition ladder.

**Status:** Feature-complete demo build — all core flows are live and
seeded with realistic data. See [`ARCHITECTURE.md`](./ARCHITECTURE.md)
for the full system design.

## 🌟 Project Vision

The Advisor Dashboard turns a 10-step partner-program execution plan
into software, replacing spreadsheets and manual WhatsApp threads with:

- **Self-serve partner onboarding** — public signup, MOU e-sign,
  certification tracking, auto-provisioned login.
- **Co-branded lead generation** — a per-advisor landing page with
  attributed lead capture, a personal QR code, and a shareable asset kit.
- **Lead-to-revenue tracking** — pipeline stages, channel-conflict
  protection, round-robin assignment, and automatic advisory-fee
  calculation the moment a lead closes.
- **Annual milestone ladder + Elite Club** — a 7-tier recognition system
  (1st through 25th client, reset each anniversary year) that graduates
  top performers into a permanent, lifetime-benefit Elite Club.
- **Internal CRM/ops console** — funnel KPIs, action queues, support
  tickets, audit logging, and role-based permissions for the OmniCard
  team.

## 📋 Current Implementation Status

### ✅ Implemented
- [x] Public marketing microsite (hero, 12-step flow, earnings calculator, India coverage map, FAQ)
- [x] Self-serve CA signup + MOU e-sign with referral-code capture
- [x] Per-advisor co-branded landing page with attributed lead capture
- [x] Session-based auth (partner + internal ops), forced password change, self-service reset, login rate-limiting, "sign out everywhere"
- [x] TOTP two-factor auth for internal ops (`otpauth` + QR enrollment)
- [x] Role-permission matrix enforced server-side (`ADMIN` / `PARTNER_MANAGER` / `MARKETING_OPS` / `SALES` / `CA`)
- [x] Full partner lifecycle: `LEAD → MEETING_SCHEDULED → ONBOARDING → CERTIFIED → ACTIVE → DORMANT`
- [x] Certification generates a 12-item asset kit + certificate automatically
- [x] Lead pipeline with scoring, channel-conflict detection, round-robin rep assignment
- [x] Advisory fees: 15% Year-1 + 5% trailing, auto-credited on `CLOSED_WON`
- [x] Annual milestone ladder (1st/3rd/5th/10th/15th/20th/25th client) + permanent Elite Club at 25 clients/year
- [x] Bulk CSV import (partners + leads) with PII masking and audited reveal
- [x] Campaigns (draft → approve → sent), asset kit catalogue, referral bonus flywheel
- [x] In-app notifications, global command-palette search, audit log, CSV export on every table
- [x] Support tickets with escalation tracking
- [x] PWA manifest (installable, no offline support yet)

### 🔄 Known Stubs (by design, not oversight)
- [ ] Email/SMS/WhatsApp sending — reset links and temp passwords are shown on-screen instead of sent, since there's no provider account wired up
- [ ] Real ICAI membership lookup — tracked as a field, not verified against a live registry
- [ ] E-sign / WhatsApp Business API / asset-rendering workers — schema and status fields are shaped for these, ready to wire in without a redesign

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components + Server Actions) |
| Language | TypeScript, end-to-end |
| Styling | Tailwind CSS v4 |
| Data layer | Prisma ORM + SQLite (one-line swap to Postgres for production) |
| Auth | Signed session cookies (`jose`, HS256 JWT) + `bcryptjs`, custom TOTP 2FA |
| Charts | Recharts |
| Validation | Zod |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Public microsite (/)                      │
│   Marketing site · signup · directory · co-branded /advisor  │
│   landing pages with attributed lead capture                 │
└───────────────────────────┬────────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────────┐
│              Next.js App Router (single process)               │
│  ├─ Pages / React Server Components   (src/app/**/page.tsx)   │
│  ├─ Server Actions                    (src/app/actions/*.ts)   │
│  │    partner · lead · campaign · bulk · settings · team ·    │
│  │    certification · integrations · pii · timeline · ...     │
│  ├─ API routes                        (src/app/api/*, */export)│
│  ├─ Auth / session / permissions      (src/lib/auth.ts,        │
│  │    permissions.ts, audit.ts)                                │
│  └─ Prisma ORM                        (prisma/schema.prisma)   │
└───────────────────────────┬────────────────────────────────────┘
                            │
                     ┌──────▼──────┐
                     │   SQLite    │   (swap provider for Postgres
                     │  dev.db     │    in production)
                     └─────────────┘
```

There is no separate backend service or database server to run — one
Next.js process serves the marketing site, the partner portal, the
admin console, and all data access.

## 📊 Core Data Models

The full schema is in [`prisma/schema.prisma`](./prisma/schema.prisma).
The models that drive the program:

| Model | Purpose |
|---|---|
| `Partner` | The CA/firm record — lifecycle stage, milestone tier, Elite Club status, referral code, payout details |
| `Lead` | A client lead under a CA's attribution — `CAPTURED → QUALIFIED → CONTACTED → DEMO → PROPOSAL → CLOSED_WON/LOST` |
| `Commission` | Advisory fee rows (Year-1 + trailing), auto-created when a lead closes |
| `Badge` | Milestone-ladder and Elite Club benefit records, keyed by anniversary-year period |
| `AssetKitItem` | The 12-item deliverable checklist generated on certification |
| `Campaign` | Pre-drafted marketing campaigns a CA approves in one click |
| `ReferralBonus` | Partner-refers-partner bonus tracking |
| `SupportTicket` | Ticketed support requests with escalation state |
| `User` | Login identity — `role: CA` links to a `Partner`; ops roles are `ADMIN` / `PARTNER_MANAGER` / `MARKETING_OPS` / `SALES` |

## 🔌 Application Surfaces

```
Public
  /                    Marketing microsite
  /signup              Self-serve CA interest capture + MOU e-sign
  /directory           Public certified-advisor directory
  /advisor/[slug]      Per-CA co-branded landing page + lead capture
  /login               Shared login for CA partners + internal ops

/partner/*             CA-facing portal (auth: role CA)
  /partner               Dashboard — earnings calculator, milestone
                         progress, pipeline snapshot, referral link
  /partner/documents      Signed MOU + certificate (printable)
  /partner/leads          Leads & Pipeline (bulk import, marketing contacts)
  /partner/assets         Asset kit checklist + downloads
  /partner/campaigns      Pending campaigns to approve
  /partner/achievements   Milestones/Elite Club, Leaderboard,
                         Certification track, Refer-a-CA — one page,
                         four tabs
  /partner/settings       Profile, payout, team, integrations, security

/admin/*                Internal ops CRM (auth: ADMIN / PARTNER_MANAGER
                        / MARKETING_OPS / SALES)
  /admin                  Dashboard — KPI funnels + action queue
  /admin/partners         CRM list, filters, bulk import, referral network
  /admin/leads            Lead-to-revenue table, Kanban view
  /admin/ops              Rep workload + first-contact SLA tracking
  /admin/campaigns        Draft campaigns, marketing contact lists
  /admin/asset-kit        Asset kit catalogue management
  /admin/commissions      Advisory fees ledger / MIS
  /admin/support          Support tickets
  /admin/team             Internal team management (ADMIN only)
  /admin/audit            Audit log (ADMIN only)
  /admin/settings         Profile, security, 2FA
```

Route protection lives in `src/middleware.ts`: unauthenticated requests
to `/admin/*` or `/partner/*` redirect to `/login`; a CA session can't
reach `/admin/*` and vice versa.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone <this-repo-url>
cd advisor-dashboard

echo 'DATABASE_URL="file:./prisma/dev.db"' > .env

npm install
npx prisma migrate deploy   # creates prisma/dev.db and applies the schema
npm run db:seed             # seeds 12 demo CA partners across every stage
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For a production-mode local run instead of the dev server:
```bash
npm run build
npm start
```

### Demo logins (password `omnicard123` for all)

| Role | Email |
|---|---|
| Admin | `admin@omnicard.in` |
| Partner Manager | `ops@omnicard.in` |
| CA Partner (Elite Club member) | `priya.sharma@camail.in` |

## 📜 Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build + serve |
| `npm run lint` | ESLint |
| `npm run db:seed` | Reset & reseed demo data |

## 🔐 Security Features

- Password hashing (`bcryptjs`), signed JWT session cookies
- Forced password change on first login for every new partner/teammate
- Login rate-limiting (5 attempts / 15 min), tracked per email
- "Sign out everywhere" via a session-version check on every request
- TOTP two-factor auth for internal ops, enrolled via QR code
- Server-side permission enforcement (not just hidden UI) on every mutation
- PII (phone/email) masked by default, unmasked only through an audited action
- Full audit log of certify/advance/campaign/team actions

## 🚧 What's Stubbed vs. What's Real

Everything is fully functional end-to-end **except** actually sending an
email, SMS, or WhatsApp message — there's no provider account to send
through:

- **Forgot-password** generates a real, single-use, time-limited token
  and shows the reset link on-screen instead of emailing it.
- **Team invites** create a real account with a real temp password,
  shown once to the inviter to relay manually instead of being emailed.
- **2FA, rate limiting, sessions, audit log, notifications, CSV export,
  permission enforcement** — no external dependency, fully live today.

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the extension points
(WhatsApp/email sending, ICAI verification, e-sign) and exactly where
each one plugs in.

## 🤝 Contributing

Internal project for the OmniCard CA Partner Network program.
