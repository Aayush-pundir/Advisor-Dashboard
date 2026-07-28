# Advisor Dashboard — Architecture

This app is the software backbone for OmniCard's **CA Partner Network**
program (source plan: "OmniCard CA Partner Network — Execution Plan",
12-month, 0→500 partners). It implements the program end-to-end: the
public partner microsite, the CA-facing partner portal, and the internal
CRM/ops console — so the 10-step plan runs on software instead of
spreadsheets and manual WhatsApp threads.

**Status:** Feature-complete demo build. Everything described below is
live and exercised by the seed data, except where explicitly marked as
stubbed (see [What's stubbed vs. what's real](#whats-stubbed-vs-whats-real)).

## Implementation status

### ✅ Implemented
- [x] Public marketing microsite, self-serve signup, MOU e-sign, referral codes
- [x] Per-advisor co-branded landing page with attributed lead capture
- [x] Full partner lifecycle (`LEAD → MEETING_SCHEDULED → ONBOARDING → CERTIFIED → ACTIVE → DORMANT`) with auto-provisioned login on certification
- [x] Lead pipeline, scoring, channel-conflict protection, round-robin assignment
- [x] Advisory fees (15% Year-1 + 5% trailing), auto-credited on close
- [x] Annual milestone ladder (7 tiers) + permanent Elite Club
- [x] Auth: sessions, forced password change, rate-limiting, sign-out-everywhere, TOTP 2FA
- [x] Role-permission matrix, enforced server-side
- [x] Bulk CSV import + PII masking with audited reveal
- [x] Campaigns, asset kit catalogue, referral bonus flywheel
- [x] Notifications, command-palette search, audit log, CSV export everywhere
- [x] Support tickets with escalation, PWA manifest

### 🔄 Deliberately stubbed
- [ ] Email/SMS/WhatsApp sending (shown on-screen instead — see stubs section)
- [ ] Live ICAI membership registry lookup
- [ ] E-sign provider webhook, WhatsApp Business API send, asset-render worker

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

## Architecture

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
│  │    certification · integrations · pii · timeline · ops ·   │
│  │    marketing-contacts · asset-kit · support · twofactor ·  │
│  │    password · auth                                          │
│  ├─ API routes                        (src/app/api/*,          │
│  │    src/app/**/export/route.ts)                              │
│  ├─ Auth / session / permissions      (src/lib/auth.ts,        │
│  │    permissions.ts, audit.ts, middleware.ts)                 │
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

## Domain model → the 10-step plan

Every model in `prisma/schema.prisma` maps directly to a step in the
execution plan:

| Model | Plan step(s) | Purpose |
|---|---|---|
| `Partner` | Step 1 (Lock the Foundation), Step 4 (Certification), Step 5 (30-day sprint) | The CA/firm record — lifecycle stage (`LEAD → MEETING_SCHEDULED → ONBOARDING → CERTIFIED → ACTIVE → DORMANT`), current milestone tier, Elite Club status, referral code. |
| `AssetKitItem` | Step 3 (Per-CA creation checklist) | The 12-item deliverable checklist (landing page, QR, video, deck, badge, WhatsApp pack, etc.) generated automatically on certification. |
| `Lead` | Step 6 (Lead-to-Revenue Machine) | A client lead captured under a CA's attribution, tracked `CAPTURED → QUALIFIED → CONTACTED → DEMO → PROPOSAL → CLOSED_WON/LOST`. |
| `Commission` | Step 1.1 (MSA), Step 6.6 (payout), Step 10 (unit economics) | 15% Year-1 + 5% trailing fee, auto-created and credited when a lead closes. |
| `Badge` | Step 4 (Milestone rewards) | Annual milestone-ladder tiers and Elite Club benefits — see [Milestone ladder + Elite Club](#milestone-ladder--elite-club) below. |
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

## Milestone ladder + Elite Club

Replaces an earlier flat Silver/Gold/Platinum quarterly badge system.
Defined in `src/lib/enums.ts` (`MILESTONE_TIERS`, `MILESTONE_TIER_META`,
`ELITE_CLUB_THRESHOLD`, `ELITE_CLUB_BENEFIT_INTERVAL`,
`anniversaryYearWindow()`), computed in `checkMilestoneBadges()`
(`src/app/actions/lead.ts`) every time a lead closes.

- **7-tier ladder** — 1st, 3rd, 5th, 10th, 15th, 20th, 25th client
  referred, each with an escalating PR/visibility reward (LinkedIn
  spotlight → newsletter → verified profile/backlink → webinar →
  whitepaper → speaking slot → media interview).
- **Anniversary-year cadence** — every tier resets fresh each 12-month
  window anchored to the partner's `certifiedAt` date, computed by
  `anniversaryYearWindow()`. `Badge.period` stores the window label
  (`Y1`, `Y2`, ...).
- **Elite Club** — reaching the 25th-client milestone within a single
  anniversary year permanently inducts the partner (`Partner.eliteClubMember`,
  `eliteMemberSince`). Once Elite, the yearly reset no longer applies;
  instead the partner accrues lifetime-cumulative benefits, one every 5
  additional clients closed (`Partner.eliteBenefitsIssued`,
  `Badge.tier = "ELITE_BENEFIT"`, `Badge.period = "ELITE_30"`, `"ELITE_35"`, ...).

`getPartnerDashboard()` (`src/lib/queries/partner.ts`) returns a
discriminated `MilestoneProgress` union so the dashboard's "Milestone
progress" card can render the tier-ladder state and the lifetime-Elite
state with no shared conditional logic.

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
  /partner                 Dashboard — earnings calculator, milestone
                           progress, pipeline snapshot, referral link
  /partner/documents       Signed MOU + certificate (printable)
  /partner/leads           Leads & Pipeline (bulk import, marketing
                           contacts sub-tab)
  /partner/assets          Asset kit checklist + downloads
  /partner/campaigns       Pending campaigns to approve in one click
  /partner/achievements    Milestones/Elite Club, Leaderboard,
                           Certification track, Refer-a-CA — one page,
                           four tabs
  /partner/settings        Profile, payout, team, integrations, security

/admin/*                  Internal ops CRM (auth: ADMIN / PARTNER_MANAGER
                          / MARKETING_OPS / SALES)
  /admin                   Dashboard — KPI funnels, Elite Club/milestone
                           tiles, action queue (partners awaiting
                           accept/countersign/demo, open tickets)
  /admin/partners          CRM list, filters (stage/tier/cert/city),
                           inline bulk-add panel, Referral Network tab
  /admin/leads             Cross-partner lead-to-revenue table, Kanban
                           view, inline stage advancement (drives
                           commission + milestone logic)
  /admin/ops               Rep workload + 24-hour first-contact SLA
  /admin/campaigns         Draft a campaign for a CA to approve,
                           marketing contact lists section
  /admin/asset-kit         Asset kit catalogue management
  /admin/commissions       Advisory fees ledger / full MIS
  /admin/support           Support tickets with escalation tracking
  /admin/team              Internal team management (ADMIN only)
  /admin/audit             Audit log (ADMIN only)
  /admin/settings          Profile, security, 2FA enrollment
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
  - `mergePartnersAction` — merges duplicate partner records.
- **`lead.ts`**
  - `advanceLeadStageAction` — Step 6 pipeline movement; on `CLOSED_WON`
    it creates the Year-1 + trailing `Commission` rows, flips the
    partner to `ACTIVE`, and runs `checkMilestoneBadges` (annual ladder
    + Elite Club — see above).
- **`campaign.ts`**
  - `createCampaignAction` — ops drafts a campaign for a partner.
  - `approveCampaignAction` — CA approves in one click (Step 3.11).
- **`bulk.ts`** — CSV import for partners and leads, duplicate detection.
- **`pii.ts`** — `revealLeadPiiAction`, permission-checked and audited.
- **`certification.ts`** — self-serve certification module completion.
- **`ops.ts`** — round-robin lead assignment, rep workload.

## Data & seeding

`prisma/seed.ts` seeds 12 realistic CA firms across 8 Indian cities,
spread across every lifecycle stage, with leads, commissions, campaigns,
asset kits, milestone badges (including one Elite Club member for
realism), one referral relationship, and six weeks of `KpiSnapshot` rows
— enough to exercise every page without manual setup.

```bash
npm install
npx prisma migrate deploy   # creates prisma/dev.db
npm run db:seed
npm run dev
```

Demo logins (seeded, password `omnicard123` for all):
- Admin: `admin@omnicard.in`
- Partner manager: `ops@omnicard.in`
- Sales: `sales@omnicard.in`
- Marketing Ops: `marketing@omnicard.in`
- CA partner (fully active, ACTIVE stage, Elite Club member, has a
  teammate + payout details + sample notifications): `priya.sharma@camail.in`

## Auth & account system

Built in four phases, all fully functional except where noted:

**Phase 0 — security baseline** (`src/lib/auth.ts`, `src/app/actions/password.ts`)
- Forced password change on first login (`User.mustChangePassword`), including
  for every newly certified partner and every newly invited teammate.
- Self-service forgot/reset password (`/forgot-password`, `/reset-password/[token]`)
  via `PasswordResetToken` — see the email caveat below.
- Login rate-limiting: 5 failed attempts per email in a 15-minute window,
  tracked in `LoginAttempt`.
- "Sign out everywhere": `User.sessionVersion` is embedded in the session JWT
  and cross-checked against the DB on every request (`getAuthedUser`); bumping
  it (password change, admin deactivation, explicit sign-out-everywhere)
  invalidates every previously issued session immediately.
- Password strength rule (`isStrongPassword`): 8+ chars, letter + number.

**Phase 1 — advisor (CA) account layer** (`/partner/settings`,
`/partner/documents`)
- Firm profile + payout details (bank/UPI/PAN/GST) editable by the firm owner.
- Multi-user firms: `User.partnerId` is no longer unique — more than one login
  (`firmRole: OWNER | MEMBER`) can share a `Partner` record. The owner invites
  teammates from `/partner/settings`.
- Document center: the MOU and certification certificate are re-rendered from
  live `Partner` data (not stored as static files) with a "Print / Save as
  PDF" button (`window.print()` + print-only CSS), so they're always current.
- In-app notification feed (`Notification` model, `src/lib/notify.ts`):
  certification, commission credited, milestone earned, and campaign-pending
  events all populate it automatically; the sidebar shows an unread badge.

**Phase 2 — admin account layer** (`src/lib/permissions.ts`, `src/lib/audit.ts`,
`/admin/team`, `/admin/audit`, `/admin/settings`)
- A role permission matrix enforced in both the UI (buttons/links hidden) and
  the server actions themselves (`ForbiddenError` thrown server-side, so
  hiding a button is a UX nicety, not the actual security boundary):
  `PARTNER_MANAGER` manages partners, `SALES` manages leads, `MARKETING_OPS`
  manages campaigns, only `ADMIN` sees the commission ledger's full detail,
  manages the internal team, or reads the audit log.
- Internal team management: add/deactivate ops users from `/admin/team`
  (temp password shown once — no email provider, see below).
- Audit log (`AuditLog` model): every certify/advance/campaign/team action
  records who did what.
- TOTP two-factor auth (`otpauth` + `qrcode`, no external service): enroll via
  QR code at `/admin/settings`, enforced at login through a short-lived
  "pending 2FA" cookie (`/login/2fa`) before the real session is issued.

**Phase 4 — extras**: global command-palette search across partners/leads
(Cmd/Ctrl+K, `/api/search`), CSV export on every admin and partner table, and
MOU version tracking (`Partner.mouVersion`, `CURRENT_MOU_VERSION`) so
re-issuing the MOU text later doesn't silently reinterpret old signatures.

## Partner lifecycle CRM (PRM v2)

Everything below builds out the full partner lifecycle — partnership lead →
co-branded marketing → customer lead → post-sale — from both the admin and
advisor side, on top of the auth/account layer above.

**Ops layer** (`src/lib/notify.ts`, `src/components/shared/*`)
- In-app notification bell (top-right, `Notification` model, `/api/notifications`)
  for both partner and internal roles — `notifyPartnerUsers()` fans out to every
  user on a firm, `notifyInternalUsers()` fans out by role. Each entry shows
  a type-specific icon (`src/lib/notification-icons.ts`) for fast scanning.
- Global command palette (Cmd/Ctrl+K) instead of a dedicated search page —
  reaches partners, leads, support tickets, and marketing contacts.
- Floating support widget (bottom-left, WhatsApp deep-link + ticket form).
  Escalation level shows inline on each ticket in `/admin/support` rather
  than as a separate static reference page.

**Bulk data + PII masking** (`src/app/actions/bulk.ts`, `src/lib/utils.ts`)
- Partners bulk-import their client book via CSV, or add one lead at a time —
  both live as an expandable panel inside `/partner/leads` (no separate
  route) alongside a "Marketing Contacts" sub-tab for the co-branded
  campaign list. Admin bulk-imports partner cohorts the same way, as an
  expandable panel on `/admin/partners`.
- Client phone/email are masked by default everywhere (`maskPhone`,
  `maskEmail`) and only unmasked through an explicit, permission-checked,
  audited server action (`revealLeadPiiAction`) — so marketing/ops can run
  campaigns off bulk-uploaded data without raw PII reaching the browser
  until someone deliberately reveals it.

**Channel-conflict protection** (`src/lib/lead-conflict.ts`)
- Inherited directly into every lead a partner submits (one-by-one, bulk
  CSV, or public capture) rather than requiring a separate "register a deal
  first" step: if another partner already has an active lead for the same
  phone number within a 90-day window, the new submission is blocked with a
  clear error. Admin's `/admin/leads` flags any conflict inline.

**Tiering and certification** (`Partner.badgeTier`, `Partner.eliteClubMember`,
`Partner.certLevel`, `CertificationProgress`)
- Milestone tier (see [Milestone ladder + Elite Club](#milestone-ladder--elite-club))
  updates stamp `tierUpdatedAt`; Elite Club induction stamps `eliteMemberSince`.
- Admin's partner list/detail pages flag "territory overlap" when multiple
  non-dormant partners share a city+state, so overlapping coverage is visible
  without a hard geo-exclusivity rule that would block onboarding.
- Self-serve certification track (`/partner/achievements?tab=certification`):
  completing every module for a level (Demo → Product → Sales) auto-bumps
  `Partner.certLevel`. Milestones, the leaderboard, certification, and
  referrals all live as sub-tabs of a single `/partner/achievements` page.

**Lead routing + ops efficiency** (`src/lib/assignment.ts`, `/admin/ops`)
- New leads (single capture and bulk upload) auto-assign to whichever active
  `SALES` rep currently has the fewest open leads — workload-balanced round
  robin rather than a fixed queue position, so volume doesn't pile onto
  whoever was assigned first. Admins can override the assignment inline.
- `/admin/ops` tracks per-rep workload and 24-hour first-contact SLA
  compliance.

**Navigation, deliberately kept narrow** — the admin sidebar is 8 items
(Dashboard, Partners, Leads, Ops Efficiency, Campaigns, Asset Kit,
Commissions, Support) plus admin-only Team/Audit/Settings; the partner
sidebar is 6 (Dashboard, Documents, Leads, Assets, Campaigns, Achievements)
plus Settings. Most of the functionality above lives as a tab, an
expandable panel, or a section on one of these pages rather than a route
of its own — see the full surface map above.

## What's stubbed vs. what's real

Everything above is fully functional end-to-end **except** actually sending
an email or SMS/WhatsApp message — there's no provider account to send
through. Concretely:
- **Forgot-password** creates a real, single-use, time-limited token and
  shows the reset link directly on screen ("Dev mode — no email provider
  configured") instead of emailing it. Wiring a provider (Resend/SES/SendGrid)
  means replacing that one redirect in `forgotPasswordAction` with an email
  send call — the token/link generation is already correct and secure.
- **Team invites** (both `/admin/team` and `/partner/settings`) generate a real
  temp password and create a real account with `mustChangePassword: true`;
  the password is shown once to the inviter to relay manually instead of
  being emailed.
- **2FA, rate limiting, sessions, audit log, notifications, CSV export,
  permission enforcement** — no external dependency, fully live today.
- **PWA**: `public/manifest.json` + generated app icons (`icon-192.png`,
  `icon-512.png`, `apple-touch-icon.png`, cropped from the OmniCard mark)
  make the dashboard installable on mobile/desktop home screens with the
  brand color as the theme color. There's no service worker yet, so it's
  installable but not offline-capable — adding one is additive, not a
  redesign.

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
