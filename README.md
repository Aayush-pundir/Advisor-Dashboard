# Advisor Dashboard

Software backbone for OmniCard's **CA Partner Network** program — the
public partner microsite, the CA-facing partner portal, and the internal
CRM/ops console for the 10-step "CA introduces, OmniCard does everything
else" execution plan. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the
full system design and how each feature maps to the plan.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev   # creates prisma/dev.db and applies the schema
npm run db:seed          # seeds 12 demo CA partners across every stage
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo logins (password `omnicard123` for all)

| Role | Email |
|---|---|
| Admin | `admin@omnicard.in` |
| Partner Manager | `ops@omnicard.in` |
| CA Partner (active, Gold badge) | `priya.sharma@camail.in` |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build + serve
- `npm run lint` — ESLint
- `npm run db:seed` — reset & reseed demo data (also runs automatically
  on `prisma migrate dev` via the `prisma.seed` config in `package.json`)

## Stack

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS v4 ·
Prisma + SQLite · Recharts · signed-cookie session auth.
